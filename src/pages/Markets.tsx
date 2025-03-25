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
import { formatCurrency } from "@/lib/utils";

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
    return Number(num).toLocaleString('en-IN', {
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
          <p className="text-sm font-medium">₹{formatNumber(payload[0].value)}</p>
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
      symbol: "RELIANCE",
      name: "Reliance Industries Ltd.",
      price: 2875.45,
      change: 37.3,
      changePercent: 1.35,
      volume: "45.3M",
      marketCap: "19.4T",
      starred: false,
      data: Array.from({ length: 20 }, (_, i) => ({
        time: i,
        value: 2875.45 * (0.98 + Math.random() * 0.04)
      }))
    },
    {
      symbol: "TCS",
      name: "Tata Consultancy Services Ltd.",
      price: 3578.8,
      change: 45.75,
      changePercent: 1.12,
      volume: "22.1M",
      marketCap: "12.9T",
      starred: false,
      data: Array.from({ length: 20 }, (_, i) => ({
        time: i,
        value: 3578.8 * (0.98 + Math.random() * 0.04)
      }))
    },
    {
      symbol: "INFY",
      name: "Infosys Ltd.",
      price: 1472.65,
      change: -8.85,
      changePercent: -0.59,
      volume: "18.7M",
      marketCap: "6.1T",
      starred: false,
      data: Array.from({ length: 20 }, (_, i) => ({
        time: i,
        value: 1472.65 * (0.98 + Math.random() * 0.04)
      }))
    },
    {
      symbol: "ICICIBANK",
      name: "ICICI Bank Ltd.",
      price: 1054.30,
      change: 12.45,
      changePercent: 1.2,
      volume: "15.8M",
      marketCap: "7.3T",
      starred: false,
      data: Array.from({ length: 20 }, (_, i) => ({
        time: i,
        value: 1054.30 * (0.98 + Math.random() * 0.04)
      }))
    },
    {
      symbol: "HDFCBANK",
      name: "HDFC Bank Ltd.",
      price: 1498.75,
      change: -5.25,
      changePercent: -0.35,
      volume: "12.3M",
      marketCap: "8.4T",
      starred: false,
      data: Array.from({ length: 20 }, (_, i) => ({
        time: i,
        value: 1498.75 * (0.98 + Math.random() * 0.04)
      }))
    },
    {
      symbol: "HINDUNILVR",
      name: "Hindustan Unilever Ltd.",
      price: 2376.90,
      change: 28.15,
      changePercent: 1.2,
      volume: "8.5M",
      marketCap: "5.6T",
      starred: false,
      data: Array.from({ length: 20 }, (_, i) => ({
        time: i,
        value: 2376.90 * (0.98 + Math.random() * 0.04)
      }))
    },
    {
      symbol: "SBIN",
      name: "State Bank of India",
      price: 726.40,
      change: 9.85,
      changePercent: 1.38,
      volume: "25.6M",
      marketCap: "6.5T",
      starred: false,
      data: Array.from({ length: 20 }, (_, i) => ({
        time: i,
        value: 726.40 * (0.98 + Math.random() * 0.04)
      }))
    },
    {
      symbol: "BHARTIARTL",
      name: "Bharti Airtel Ltd.",
      price: 1258.65,
      change: -3.45,
      changePercent: -0.27,
      volume: "10.2M",
      marketCap: "7.1T",
      starred: false,
      data: Array.from({ length: 20 }, (_, i) => ({
        time: i,
        value: 1258.65 * (0.98 + Math.random() * 0.04)
      }))
    }
  ];

  const mockIndexData = [
    {
      symbol: "NIFTY 50",
      name: "NSE Nifty 50 Index",
      price: 22451.23,
      change: 105.05,
      changePercent: 0.47,
      volume: "155.7M",
      data: Array.from({ length: 30 }, (_, i) => ({
        day: i,
        value: 22451.23 * (0.97 + Math.sin(i / 15) * 0.03 + Math.random() * 0.01)
      }))
    },
    {
      symbol: "SENSEX",
      name: "BSE Sensex",
      price: 73980.45,
      change: 235.35,
      changePercent: 0.32,
      volume: "142.3M",
      data: Array.from({ length: 30 }, (_, i) => ({
        day: i,
        value: 73980.45 * (0.97 + Math.sin(i / 15) * 0.03 + Math.random() * 0.01)
      }))
    },
    {
      symbol: "BANKNIFTY",
      name: "Nifty Bank Index",
      price: 48346.78,
      change: -145.45,
      changePercent: -0.30,
      volume: "112.1M",
      data: Array.from({ length: 30 }, (_, i) => ({
        day: i,
        value: 48346.78 * (0.97 + Math.sin(i / 15) * 0.03 + Math.random() * 0.01)
      }))
    }
  ];

  const mockMarketData = {
    RELIANCE: {
      chartData: Array.from({ length: 90 }, (_, i) => ({
        date: new Date(Date.now() - (90 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: 2875.45 * (0.95 + Math.sin(i / 20) * 0.05 + (i / 90) * 0.05 + (Math.random() * 0.05 - 0.025))
      })),
      stats: {
        open: 2872.3,
        high: 2895.1,
        low: 2861.8,
        volume: "45.3M",
        avgVolume: "67.2M",
        marketCap: "19.4T",
        peRatio: 28.5,
        dividend: 12.4,
        dividendYield: 0.55,
        eps: 106.08,
        week52High: 2982.94,
        week52Low: 2424.17
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
                                  <div className="font-medium">₹{formatNumber(stock.price)}</div>
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
                                  <div className="font-medium">₹{formatNumber(index.price)}</div>
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
                                ₹{formatNumber(stockDetails.price)}
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
                          <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis domain={['auto', 'auto']} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                  type="monotone"
                                  dataKey="value"
                                  stroke="#3b82f6"
                                  fill="#3b82f6"
                                  strokeWidth={2}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <div className="flex justify-center py-8 text-muted-foreground">
                      Select a stock to view details
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="portfolio">
              <Portfolio />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Markets;

