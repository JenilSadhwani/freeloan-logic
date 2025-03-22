import { useState, useEffect, useCallback } from "react";
import { Search, Filter, ArrowDown, ArrowUp, RefreshCw, Star, Plus, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  TooltipProps
} from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Portfolio from "@/components/Portfolio";

// Time periods for chart
const timePeriods = [
  { label: "1D", value: "1d" },
  { label: "1W", value: "1w" },
  { label: "1M", value: "1m" },
  { label: "3M", value: "3m" },
  { label: "1Y", value: "1y" },
  { label: "5Y", value: "5y" },
];

const Markets = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStock, setSelectedStock] = useState<string | null>("AAPL");
  const [stockList, setStockList] = useState([]);
  const [stockDetails, setStockDetails] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [activePeriod, setActivePeriod] = useState("3m");
  const [indexData, setIndexData] = useState([]);
  const [activeTab, setActiveTab] = useState("market");

  // Format number with commas and precision
  const formatNumber = (num, precision = 2) => {
    if (num === undefined || num === null) return "-";
    return Number(num).toLocaleString(undefined, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });
  };

  // Fetch market data from FinLab API
  const fetchMarketData = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Get bearer token for authorization
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to view real-time market data");
        return;
      }
      
      // Fetch most active stocks
      const response = await fetch("/api/functions/v1/finlab?endpoint=market/most_active", {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching market data: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.data) {
        // Transform the data for our UI
        const stocks = result.data.map(stock => ({
          symbol: stock.symbol,
          name: stock.name || `${stock.symbol} Inc.`,
          price: stock.last_price || 0,
          change: stock.change || 0,
          changePercent: stock.change_percent || 0,
          volume: stock.volume ? (stock.volume / 1000000).toFixed(1) + 'M' : "N/A",
          marketCap: stock.market_cap ? (stock.market_cap >= 1000000000000 
            ? (stock.market_cap / 1000000000000).toFixed(2) + 'T' 
            : (stock.market_cap / 1000000000).toFixed(2) + 'B') : "N/A",
          starred: false,
          data: Array.from({ length: 20 }, (_, i) => ({
            time: i,
            value: stock.last_price * (0.98 + Math.random() * 0.04) // Simulate small price movements
          }))
        }));
        
        setStockList(stocks);
        
        // If no stock is selected yet, select the first one
        if (!selectedStock && stocks.length > 0) {
          setSelectedStock(stocks[0].symbol);
        }
        
        // Fetch index data
        const indexResponse = await fetch("/api/functions/v1/finlab?endpoint=market/indices", {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });
        
        if (indexResponse.ok) {
          const indexResult = await indexResponse.json();
          
          if (indexResult.data) {
            const indices = indexResult.data.map(index => ({
              symbol: index.symbol,
              name: index.name || index.symbol,
              price: index.last_price || 0,
              change: index.change || 0,
              changePercent: index.change_percent || 0,
              volume: index.volume ? (index.volume / 1000000).toFixed(1) + 'M' : "N/A",
              data: Array.from({ length: 30 }, (_, i) => ({ 
                day: i, 
                value: index.last_price * (0.97 + Math.sin(i / 15) * 0.03 + Math.random() * 0.01) 
              }))
            }));
            
            setIndexData(indices);
          }
        }
      }
      
      // Fetch details for the selected stock if one is selected
      if (selectedStock) {
        fetchStockDetails(selectedStock, session.access_token);
      }
    } catch (error) {
      console.error("Error fetching market data:", error);
      toast.error("Failed to load market data");
      
      // Fall back to mock data if API fails
      setStockList(mockStockData);
      setIndexData(mockIndexData);
      
      if (selectedStock) {
        const activeStock = mockStockData.find(s => s.symbol === selectedStock);
        if (activeStock) {
          setStockDetails({
            ...activeStock,
            stats: mockMarketData.AAPL.stats
          });
          setChartData(mockMarketData.AAPL.chartData);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedStock, user]);

  // Fetch details for a specific stock
  const fetchStockDetails = async (symbol, token) => {
    try {
      setIsChartLoading(true);
      
      // Fetch stock details
      const detailsResponse = await fetch(`/api/functions/v1/finlab?endpoint=stocks/profile&symbols=${symbol}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!detailsResponse.ok) {
        throw new Error(`Error fetching stock details: ${detailsResponse.statusText}`);
      }
      
      const detailsResult = await detailsResponse.json();
      
      if (detailsResult.data && detailsResult.data.length > 0) {
        const stockInfo = detailsResult.data[0];
        
        // Fetch price data for chart
        const chartResponse = await fetch(`/api/functions/v1/finlab?endpoint=stocks/historical&symbols=${symbol}&period=${activePeriod}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        let chartPoints = [];
        
        if (chartResponse.ok) {
          const chartResult = await chartResponse.json();
          
          if (chartResult.data && chartResult.data.length > 0) {
            const priceData = chartResult.data[0].prices || [];
            
            chartPoints = priceData.map(point => ({
              date: new Date(point.date).toISOString().split('T')[0],
              value: point.close
            }));
          }
        }
        
        // Find the stock in the list to get current price and change
        const stockInList = stockList.find(s => s.symbol === symbol);
        
        setStockDetails({
          symbol: stockInfo.symbol,
          name: stockInfo.name || stockInfo.symbol,
          price: stockInList?.price || stockInfo.last_price || 0,
          change: stockInList?.change || 0,
          changePercent: stockInList?.changePercent || 0,
          stats: {
            open: stockInfo.open || 0,
            high: stockInfo.high || 0,
            low: stockInfo.low || 0,
            volume: stockInfo.volume ? (stockInfo.volume / 1000000).toFixed(1) + 'M' : "N/A",
            avgVolume: stockInfo.avg_volume ? (stockInfo.avg_volume / 1000000).toFixed(1) + 'M' : "N/A",
            marketCap: stockInfo.market_cap ? 
              (stockInfo.market_cap >= 1000000000000 
                ? (stockInfo.market_cap / 1000000000000).toFixed(2) + 'T' 
                : (stockInfo.market_cap / 1000000000).toFixed(2) + 'B') 
              : "N/A",
            peRatio: stockInfo.pe_ratio || 0,
            dividend: stockInfo.dividend_yield || 0,
            dividendYield: stockInfo.dividend_yield || 0,
            eps: stockInfo.eps || 0,
            week52High: stockInfo.week_52_high || 0,
            week52Low: stockInfo.week_52_low || 0
          }
        });
        
        setChartData(chartPoints.length > 0 ? chartPoints : 
          // Fallback data if no chart data is available
          Array.from({ length: 90 }, (_, i) => ({
            date: new Date(Date.now() - (90 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            value: stockInList?.price * (0.95 + Math.sin(i / 20) * 0.05 + (i / 90) * 0.05 + (Math.random() * 0.05 - 0.025))
          }))
        );
      }
    } catch (error) {
      console.error(`Error fetching details for ${symbol}:`, error);
      toast.error(`Failed to load details for ${symbol}`);
      
      // Fall back to mock data
      const activeStock = mockStockData.find(s => s.symbol === symbol);
      if (activeStock) {
        setStockDetails({
          ...activeStock,
          stats: mockMarketData.AAPL.stats
        });
        setChartData(mockMarketData.AAPL.chartData);
      }
    } finally {
      setIsChartLoading(false);
    }
  };

  // Handle period change for charts
  const handlePeriodChange = async (period) => {
    setActivePeriod(period);
    
    if (selectedStock && user) {
      try {
        setIsChartLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error("You must be logged in to view historical data");
          return;
        }
        
        const chartResponse = await fetch(`/api/functions/v1/finlab?endpoint=stocks/historical&symbols=${selectedStock}&period=${period}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });
        
        if (!chartResponse.ok) {
          throw new Error(`Error fetching chart data: ${chartResponse.statusText}`);
        }
        
        const chartResult = await chartResponse.json();
        
        if (chartResult.data && chartResult.data.length > 0) {
          const priceData = chartResult.data[0].prices || [];
          
          const chartPoints = priceData.map(point => ({
            date: new Date(point.date).toISOString().split('T')[0],
            value: point.close
          }));
          
          setChartData(chartPoints);
        }
      } catch (error) {
        console.error(`Error fetching chart data for period ${period}:`, error);
        toast.error("Failed to load historical data");
        
        // Fall back to mock data
        setChartData(mockMarketData.AAPL.chartData);
      } finally {
        setIsChartLoading(false);
      }
    }
  };

  // Toggle star status for a stock
  const toggleStarred = (symbol) => {
    setStockList(
      stockList.map((stock) =>
        stock.symbol === symbol ? { ...stock, starred: !stock.starred } : stock
      )
    );
  };

  // Refresh data
  const refreshData = () => {
    fetchMarketData();
    toast.success("Market data refreshed");
  };

  // Load data on component mount
  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 border border-border rounded-md shadow-md">
          <p className="text-sm font-medium">${formatNumber(payload[0].value)}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      );
    }
    return null;
  };

  // Filter stocks based on search query
  const filteredStocks = stockList.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get active stock data
  const activeStock = stockList.find(
    (stock) => stock.symbol === selectedStock
  );

  // Mock data for fallback if API fails
  const mockStockData = [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 173.5,
      change: 2.3,
      changePercent: 1.35,
      volume: "45.3M",
      marketCap: "2.8T",
      starred: false,
      data: Array.from({ length: 20 }, (_, i) => ({
        time: i,
        value: 173.5 * (0.98 + Math.random() * 0.04)
      }))
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      price: 337.8,
      change: 3.75,
      changePercent: 1.12,
      volume: "22.1M",
      marketCap: "2.5T",
      starred: false,
      data: Array.from({ length: 20 }, (_, i) => ({
        time: i,
        value: 337.8 * (0.98 + Math.random() * 0.04)
      }))
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      price: 142.65,
      change: -0.85,
      changePercent: -0.59,
      volume: "18.7M",
      marketCap: "1.8T",
      starred: false,
      data: Array.from({ length: 20 }, (_, i) => ({
        time: i,
        value: 142.65 * (0.98 + Math.random() * 0.04)
      }))
    }
  ];

  const mockIndexData = [
    {
      symbol: "SPY",
      name: "S&P 500 ETF",
      price: 451.23,
      change: 1.05,
      changePercent: 0.23,
      volume: "55.7M",
      data: Array.from({ length: 30 }, (_, i) => ({
        day: i,
        value: 451.23 * (0.97 + Math.sin(i / 15) * 0.03 + Math.random() * 0.01)
      }))
    },
    {
      symbol: "QQQ",
      name: "Nasdaq 100 ETF",
      price: 380.45,
      change: 2.35,
      changePercent: 0.62,
      volume: "42.3M",
      data: Array.from({ length: 30 }, (_, i) => ({
        day: i,
        value: 380.45 * (0.97 + Math.sin(i / 15) * 0.03 + Math.random() * 0.01)
      }))
    },
    {
      symbol: "DIA",
      name: "Dow Jones ETF",
      price: 346.78,
      change: -0.45,
      changePercent: -0.13,
      volume: "12.1M",
      data: Array.from({ length: 30 }, (_, i) => ({
        day: i,
        value: 346.78 * (0.97 + Math.sin(i / 15) * 0.03 + Math.random() * 0.01)
      }))
    }
  ];

  const mockMarketData = {
    AAPL: {
      chartData: Array.from({ length: 90 }, (_, i) => ({
        date: new Date(Date.now() - (90 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: 173.5 * (0.95 + Math.sin(i / 20) * 0.05 + (i / 90) * 0.05 + (Math.random() * 0.05 - 0.025))
      })),
      stats: {
        open: 172.3,
        high: 175.1,
        low: 171.8,
        volume: "45.3M",
        avgVolume: "67.2M",
        marketCap: "2.8T",
        peRatio: 28.5,
        dividend: 0.24,
        dividendYield: 0.55,
        eps: 6.08,
        week52High: 182.94,
        week52Low: 124.17
      }
    }
  };

  return (
    <Layout>
      <div className="min-h-screen pt-24 pb-10">
        <div className="container px-4 sm:px-6 mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold tracking-tight">Markets</h1>
              <p className="text-muted-foreground">
                Monitor stocks, indexes, and market trends
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={refreshData}
                size="sm"
                variant="outline"
                className="h-10"
              >
                <RefreshCw
                  className={`mr-1 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="h-10">
                    <Filter className="mr-1 h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Show all</DropdownMenuItem>
                  <DropdownMenuItem>Starred only</DropdownMenuItem>
                  <DropdownMenuItem>Gainers</DropdownMenuItem>
                  <DropdownMenuItem>Losers</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-grid sm:grid-cols-2">
              <TabsTrigger value="market">Market</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            </TabsList>

            <TabsContent value="market" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stock list and search column */}
                <div className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Search stocks..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Watchlist</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin h-6 w-6 border-2 border-primary border-r-transparent rounded-full"></div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {filteredStocks.map((stock) => (
                            <div
                              key={stock.symbol}
                              onClick={() => setSelectedStock(stock.symbol)}
                              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                                selectedStock === stock.symbol
                                  ? "bg-primary/10"
                                  : "hover:bg-muted"
                              }`}
                            >
                              <div className="flex items-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleStarred(stock.symbol);
                                  }}
                                  className="p-1 mr-2 text-muted-foreground hover:text-yellow-500"
                                >
                                  <Star
                                    className={`h-4 w-4 ${
                                      stock.starred
                                        ? "fill-yellow-500 text-yellow-500"
                                        : ""
                                    }`}
                                  />
                                </button>
                                <div>
                                  <div className="font-medium">{stock.symbol}</div>
                                  <div className="text-xs text-muted-foreground truncate max-w-32">
                                    {stock.name}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <div className="text-right mr-3">
                                  <div className="font-medium">${formatNumber(stock.price)}</div>
                                  <div
                                    className={`text-xs flex items-center ${
                                      stock.change >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {stock.change >= 0 ? (
                                      <ArrowUp className="h-3 w-3 mr-0.5" />
                                    ) : (
                                      <ArrowDown className="h-3 w-3 mr-0.5" />
                                    )}
                                    {stock.change > 0 && "+"}
                                    {formatNumber(stock.change)} ({formatNumber(stock.changePercent)}%)
                                  </div>
                                </div>
                                <div className="w-16 h-12">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stock.data}>
                                      <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke={
                                          stock.change >= 0 ? "#16a34a" : "#dc2626"
                                        }
                                        dot={false}
                                        strokeWidth={1.5}
                                      />
                                    </LineChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Market indices */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Market Indices</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin h-6 w-6 border-2 border-primary border-r-transparent rounded-full"></div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {indexData.map((index) => (
                            <div
                              key={index.symbol}
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                            >
                              <div>
                                <div className="font-medium">{index.symbol}</div>
                                <div className="text-xs text-muted-foreground">
                                  {index.name}
                                </div>
                              </div>
                              <div className="flex items-center">
                                <div className="text-right mr-3">
                                  <div className="font-medium">${formatNumber(index.price)}</div>
                                  <div
                                    className={`text-xs flex items-center ${
                                      index.change >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {index.change >= 0 ? (
                                      <ArrowUp className="h-3 w-3 mr-0.5" />
                                    ) : (
                                      <ArrowDown className="h-3 w-3 mr-0.5" />
                                    )}
                                    {index.change > 0 && "+"}
                                    {formatNumber(index.change)} ({formatNumber(index.changePercent)}%)
                                  </div>
                                </div>
                                <div className="w-16 h-12">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={index.data}>
                                      <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke={
                                          index.change >= 0 ? "#16a34a" : "#dc2626"
                                        }
                                        dot={false}
                                        strokeWidth={1.5}
                                      />
                                    </LineChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Stock detail column */}
                <div className="lg:col-span-2 space-y-6">
                  {activeStock && stockDetails ? (
                    <>
                      <Card>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center">
                                <h2 className="text-2xl font-bold">
                                  {stockDetails.symbol}
                                </h2>
                                <button
                                  onClick={() => toggleStarred(stockDetails.symbol)}
                                  className="ml-2 p-1 text-muted-foreground hover:text-yellow-500"
                                >
                                  <Star
                                    className={`h-4 w-4 ${
                                      activeStock.starred
                                        ? "fill-yellow-500 text-yellow-500"
                                        : ""
                                    }`}
                                  />
                                </button>
                              </div>
                              <p className="text-muted-foreground">
                                {stockDetails.name}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">
                                ${formatNumber(stockDetails.price)}
                              </div>
                              <div
                                className={`flex items-center justify-end ${
                                  stockDetails.change >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {stockDetails.change >= 0 ? (
                                  <ArrowUp className="h-4 w-4 mr-0.5" />
                                ) : (
                                  <ArrowDown className="h-4 w-4 mr-0.5" />
                                )}
                                {stockDetails.change > 0 && "+"}
                                {formatNumber(stockDetails.change)} ({formatNumber(stockDetails.changePercent)}%)
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="mt-2 mb-4 flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              {timePeriods.map((period) => (
                                <Button
                                  key={period.value}
                                  variant={
                                    activePeriod === period.value
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() => handlePeriodChange(period.value)}
                                  className="h-8 px-3"
                                  disabled={isChartLoading}
                                >
                                  {period.label}
                                </Button>
                              ))}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} EST
                            </div>
                          </div>

                          <div className="h-72">
                            {isChartLoading ? (
                              <div className="h-full flex items-center justify-center">
                                <div className="animate-spin h-8 w-8 border-2 border-primary border-r-transparent rounded-full"></div>
                              </div>
                            ) : (
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                  data={chartData}
                                  margin={{
                                    top: 5,
                                    right: 5,
                                    left: 5,
                                    bottom: 5,
                                  }}
                                >
                                  <defs>
                                    <linearGradient
                                      id="colorValue"
                                      x1="0"
                                      y1="0"
                                      x2="0"
                                      y2="1"
                                    >
                                      <stop
                                        offset="5%"
                                        stopColor="#4f46e5"
                                        stopOpacity={0.3}
                                      />
                                      <stop
                                        offset="95%"
                                        stopColor="#4f46e5"
                                        stopOpacity={0}
                                      />
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#f3f4f6"
                                  />
                                  <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => {
                                      const date = new Date(value);
                                      return date.toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                      });
                                    }}
                                    interval={Math.floor(chartData.length / 6)}
                                  />
                                  <YAxis
                                    domain={['auto', 'auto']}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => `$${formatNumber(value, 0)}`}
                                    width={50}
                                  />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#4f46e5"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                    isAnimationActive={true}
                                    animationDuration={1000}
                                    animationEasing="ease-out"
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Key Statistics</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm text-muted-foreground">
                                  Open
                                </div>
                                <div className="font-medium">
                                  ${formatNumber(stockDetails.stats.open)}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">
                                  High
                                </div>
                                <div className="font-medium">
                                  ${formatNumber(stockDetails.stats.high)}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">
                                  Low
                                </div>
                                <div className="font-medium">
                                  ${formatNumber(stockDetails.stats.low)}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">
                                  Volume
                                </div>
                                <div className="font-medium">
                                  {stockDetails.stats.volume}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">
                                  Avg Volume
                                </div>
                                <div className="font-medium">
                                  {stockDetails.stats.avgVolume}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">
                                  Market Cap
                                </div>
                                <div className="font-medium">
                                  {stockDetails.stats.marketCap}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">
                                  P/E Ratio
                                </div>
                                <div className="font-medium">
                                  {formatNumber(stockDetails.stats.peRatio)}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">
                                  EPS
                                </div>
                                <div className="font-medium">
                                  ${formatNumber(stockDetails.stats.eps)}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">
                                  Dividend
                                </div>
                                <div className="font-medium">
                                  ${formatNumber(stockDetails.stats.dividend)} ({formatNumber(stockDetails.stats.dividendYield)}%)
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">
                                  52W High
                                </div>
                                <div className="font-medium">
                                  ${formatNumber(stockDetails.stats.week52High)}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">
                                  52W Low
                                </div>
                                <div className="font-medium">
                                  ${formatNumber(stockDetails.stats.week52Low)}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Analysis</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Tabs defaultValue="sentiment">
                              <TabsList className="w-full">
                                <TabsTrigger value="sentiment" className="flex-1">
                                  Sentiment
                                </TabsTrigger>
                                <TabsTrigger value="news" className="flex-1">
                                  News
                                </TabsTrigger>
                              </TabsList>
                              <TabsContent value="sentiment" className="mt-4">
                                <div className="space-y-4">
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="text-sm font-medium">
                                        Buy Signal
                                      </div>
                                      <div className="text-sm text-green-600 font-medium flex items-center">
                                        <TrendingUp className="h-4 w-4 mr-1" />
                                        Strong
                                      </div>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                      <div
                                        className="bg-green-500 h-full rounded-full"
                                        style={{ width: "85%" }}
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="text-sm font-medium">
                                        Analyst Ratings
                                      </div>
                                      <div className="text-sm font-medium">
                                        25 Buy · 8 Hold · 1 Sell
                                      </div>
                                    </div>
                                    <div className="flex h-2 w-full rounded-full overflow-hidden">
                                      <div
                                        className="bg-green-500 h-full"
                                        style={{ width: "74%" }}
                                      />
                                      <div
                                        className="bg-yellow-500 h-full"
                                        style={{ width: "23%" }}
                                      />
                                      <div
                                        className="bg-red-500 h-full"
                                        style={{ width: "3%" }}
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="text-sm font-medium">
                                        Technical Indicators
                                      </div>
                                      <div className="text-sm font-medium">
                                        Neutral
                                      </div>
                                    </div>
                                    <div className="flex h-2 w-full rounded-full overflow-hidden">
                                      <div
                                        className="bg-green-500 h-full"
                                        style={{ width: "45%" }}
                                      />
                                      <div
                                        className="bg-yellow-500 h-full"
                                        style={{ width: "32%" }}
                                      />
                                      <div
                                        className="bg-red-500 h-full"
                                        style={{ width: "23%" }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </TabsContent>
                              <TabsContent value="news" className="mt-4">
                                <div className="space-y-3">
                                  <div className="p-3 border border-border rounded-lg">
                                    <div className="text-sm font-medium">{stockDetails.name} Reports Strong Quarterly Results</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      Revenue and earnings exceeded analyst expectations, driven by strong product performance and margin expansion.
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-2">2 hours ago • Business Insider</div>
                                  </div>
                                  <div className="p-3 border border-border rounded-lg">
                                    <div className="text-sm font-medium">Analysts Raise Price Target for {stockDetails.symbol}</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      Multiple analysts have raised their price targets following the company's latest product announcements.
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-2">5 hours ago • Market Watch</div>
                                  </div>
                                  <div className="p-3 border border-border rounded-lg">
                                    <div className="text-sm font-medium">{stockDetails.name} Expands Operations</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      The company announced plans to expand its operations in Asia, potentially opening new growth opportunities.
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-2">1 day ago • Bloomberg</div>
                                  </div>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <div className="text-lg font-medium">
                          Select a stock to view details
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Choose from the watchlist on the left
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="portfolio" className="space-y-6">
              <Portfolio />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Markets;
