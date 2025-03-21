
import { useState, useEffect } from "react";
import { Search, Filter, ArrowDown, ArrowUp, RefreshCw, Star, Plus, Clock, TrendingUp, TrendingDown, Filter as FilterIcon } from "lucide-react";
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
  Area
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

// Mock market data
const mockStockData = [
  { 
    symbol: "AAPL", 
    name: "Apple Inc.", 
    price: 187.42, 
    change: 1.23, 
    changePercent: 0.66, 
    volume: "35.4M",
    marketCap: "2.94T",
    starred: true,
    data: Array.from({ length: 20 }, (_, i) => ({
      time: i,
      value: 180 + Math.random() * 15
    }))
  },
  { 
    symbol: "MSFT", 
    name: "Microsoft Corp.", 
    price: 402.65, 
    change: 5.31, 
    changePercent: 1.34, 
    volume: "28.2M",
    marketCap: "3.01T",
    starred: true,
    data: Array.from({ length: 20 }, (_, i) => ({
      time: i,
      value: 390 + Math.random() * 20
    }))
  },
  { 
    symbol: "GOOGL", 
    name: "Alphabet Inc.", 
    price: 165.27, 
    change: -2.14, 
    changePercent: -1.28, 
    volume: "22.1M",
    marketCap: "2.06T",
    starred: false,
    data: Array.from({ length: 20 }, (_, i) => ({
      time: i,
      value: 160 + Math.random() * 10
    }))
  },
  { 
    symbol: "AMZN", 
    name: "Amazon.com Inc.", 
    price: 181.74, 
    change: 0.92, 
    changePercent: 0.51, 
    volume: "41.8M",
    marketCap: "1.88T",
    starred: false,
    data: Array.from({ length: 20 }, (_, i) => ({
      time: i,
      value: 175 + Math.random() * 12
    }))
  },
  { 
    symbol: "META", 
    name: "Meta Platforms Inc.", 
    price: 472.38, 
    change: -7.26, 
    changePercent: -1.51, 
    volume: "18.7M",
    marketCap: "1.21T",
    starred: false,
    data: Array.from({ length: 20 }, (_, i) => ({
      time: i,
      value: 465 + Math.random() * 25
    }))
  },
  { 
    symbol: "TSLA", 
    name: "Tesla Inc.", 
    price: 182.56, 
    change: 3.45, 
    changePercent: 1.93, 
    volume: "109.2M",
    marketCap: "580.2B",
    starred: false,
    data: Array.from({ length: 20 }, (_, i) => ({
      time: i,
      value: 175 + Math.random() * 15
    }))
  },
  { 
    symbol: "NVDA", 
    name: "NVIDIA Corp.", 
    price: 116.20, 
    change: 2.78, 
    changePercent: 2.45, 
    volume: "156.4M",
    marketCap: "2.87T",
    starred: false,
    data: Array.from({ length: 20 }, (_, i) => ({
      time: i,
      value: 110 + Math.random() * 10
    }))
  },
];

// Mock index data
const mockIndexData = [
  { 
    symbol: "SPY", 
    name: "S&P 500 ETF", 
    price: 512.68, 
    change: 2.37, 
    changePercent: 0.46, 
    volume: "76.2M",
    data: Array.from({ length: 30 }, (_, i) => ({ day: i, value: 500 + Math.sin(i / 5) * 20 + Math.random() * 5 }))
  },
  { 
    symbol: "DIA", 
    name: "Dow Jones ETF", 
    price: 384.19, 
    change: 1.15, 
    changePercent: 0.30, 
    volume: "32.5M",
    data: Array.from({ length: 30 }, (_, i) => ({ day: i, value: 375 + Math.sin(i / 4) * 15 + Math.random() * 5 }))
  },
  { 
    symbol: "QQQ", 
    name: "Nasdaq 100 ETF", 
    price: 426.96, 
    change: -3.25, 
    changePercent: -0.76, 
    volume: "48.7M",
    data: Array.from({ length: 30 }, (_, i) => ({ day: i, value: 420 + Math.sin(i / 6) * 25 + Math.random() * 5 }))
  }
];

// Detailed market data for active stock
const mockMarketData = {
  AAPL: {
    stats: {
      open: 185.82,
      high: 188.45,
      low: 185.19,
      volume: "35.4M",
      avgVolume: "43.2M",
      marketCap: "2.94T",
      peRatio: 32.1,
      dividend: 0.96,
      dividendYield: 0.51,
      eps: 5.84,
      week52High: 196.38,
      week52Low: 143.90
    },
    chartData: Array.from({ length: 90 }, (_, i) => ({
      date: new Date(Date.now() - (90 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: 170 + Math.sin(i / 10) * 20 + (i / 5) + (Math.random() * 5 - 2.5)
    }))
  }
};

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStock, setSelectedStock] = useState<string | null>("AAPL");
  const [stockList, setStockList] = useState(mockStockData);
  const [isLoading, setIsLoading] = useState(false);
  const [activePeriod, setActivePeriod] = useState("3m");

  // Simulate data loading
  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Market data refreshed");
    }, 1000);
  };

  // Filter stocks based on search query
  const filteredStocks = stockList.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle star status for a stock
  const toggleStarred = (symbol: string) => {
    setStockList(
      stockList.map((stock) =>
        stock.symbol === symbol ? { ...stock, starred: !stock.starred } : stock
      )
    );
  };

  // Get active stock data
  const activeStock = mockStockData.find(
    (stock) => stock.symbol === selectedStock
  );

  // Format number with commas and precision
  const formatNumber = (num: number, precision: number = 2) => {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 border border-border rounded-md shadow-md">
          <p className="text-sm font-medium">{`$${formatNumber(payload[0].value)}`}</p>
          <p className="text-xs text-muted-foreground">{payload[0].payload.date}</p>
        </div>
      );
    }
    return null;
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
                            <div className="font-medium">${stock.price}</div>
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
                              {stock.change} ({stock.changePercent}%)
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
                </CardContent>
              </Card>

              {/* Market indices */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Market Indices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockIndexData.map((index) => (
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
                            <div className="font-medium">${index.price}</div>
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
                              {index.change} ({index.changePercent}%)
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
                </CardContent>
              </Card>
            </div>

            {/* Stock detail column */}
            <div className="lg:col-span-2 space-y-6">
              {activeStock && (
                <>
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center">
                            <h2 className="text-2xl font-bold">
                              {activeStock.symbol}
                            </h2>
                            <button
                              onClick={() => toggleStarred(activeStock.symbol)}
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
                            {activeStock.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            ${activeStock.price}
                          </div>
                          <div
                            className={`flex items-center justify-end ${
                              activeStock.change >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {activeStock.change >= 0 ? (
                              <ArrowUp className="h-4 w-4 mr-0.5" />
                            ) : (
                              <ArrowDown className="h-4 w-4 mr-0.5" />
                            )}
                            {activeStock.change > 0 && "+"}
                            {activeStock.change} ({activeStock.changePercent}%)
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
                              onClick={() => setActivePeriod(period.value)}
                              className="h-8 px-3"
                            >
                              {period.label}
                            </Button>
                          ))}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          Last updated: 15:45 EST
                        </div>
                      </div>

                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={mockMarketData.AAPL.chartData}
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
                              interval={14}
                            />
                            <YAxis
                              domain={["dataMin - 5", "dataMax + 5"]}
                              tickLine={false}
                              axisLine={false}
                              tick={{ fontSize: 12 }}
                              tickFormatter={(value) => `$${value.toFixed(0)}`}
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
                              ${mockMarketData.AAPL.stats.open.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              High
                            </div>
                            <div className="font-medium">
                              ${mockMarketData.AAPL.stats.high.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Low
                            </div>
                            <div className="font-medium">
                              ${mockMarketData.AAPL.stats.low.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Volume
                            </div>
                            <div className="font-medium">
                              {mockMarketData.AAPL.stats.volume}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Avg Volume
                            </div>
                            <div className="font-medium">
                              {mockMarketData.AAPL.stats.avgVolume}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Market Cap
                            </div>
                            <div className="font-medium">
                              {mockMarketData.AAPL.stats.marketCap}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              P/E Ratio
                            </div>
                            <div className="font-medium">
                              {mockMarketData.AAPL.stats.peRatio.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              EPS
                            </div>
                            <div className="font-medium">
                              ${mockMarketData.AAPL.stats.eps.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Dividend
                            </div>
                            <div className="font-medium">
                              ${mockMarketData.AAPL.stats.dividend.toFixed(2)} (
                              {mockMarketData.AAPL.stats.dividendYield.toFixed(
                                2
                              )}
                              %)
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              52W High
                            </div>
                            <div className="font-medium">
                              ${mockMarketData.AAPL.stats.week52High.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              52W Low
                            </div>
                            <div className="font-medium">
                              ${mockMarketData.AAPL.stats.week52Low.toFixed(2)}
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
                                    Volatility
                                  </div>
                                  <div className="text-sm font-medium">
                                    Medium
                                  </div>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="bg-yellow-500 h-full rounded-full"
                                    style={{ width: "45%" }}
                                  />
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                          <TabsContent value="news" className="mt-4">
                            <div className="space-y-3">
                              <div className="border-b border-border pb-3">
                                <div className="text-sm font-medium">
                                  Apple's Next-Gen iPhone Design Leaked: What to Expect
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  2 hours ago · TechInsider
                                </div>
                              </div>
                              <div className="border-b border-border pb-3">
                                <div className="text-sm font-medium">
                                  Quarterly Earnings Beat Expectations as Services Growth Accelerates
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Yesterday · Financial Times
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium">
                                  New AI Capabilities Coming to Apple Ecosystem
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  2 days ago · Bloomberg
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Trading Tools</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-primary"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add to Portfolio
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                          <div className="text-sm text-muted-foreground">
                            Estimated Yearly Return
                          </div>
                          <div className="text-2xl font-bold text-green-600">
                            +8.6%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Based on historical data and current price
                          </div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                          <div className="text-sm text-muted-foreground">
                            Risk Level
                          </div>
                          <div className="text-2xl font-bold">Medium</div>
                          <div className="text-xs text-muted-foreground">
                            Beta: 1.24
                          </div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                          <div className="text-sm text-muted-foreground">
                            Price Target
                          </div>
                          <div className="text-2xl font-bold">$210.50</div>
                          <div className="text-xs text-muted-foreground">
                            Avg. analyst 12-month estimate
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Markets;
