
import { useState, useEffect } from "react";
import { TrendingUp, ExternalLink, MessageSquare, Search, BarChart4 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface SentimentData {
  category: string;
  count: number;
  color: string;
}

const MarketSentimentAnalysis = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [activeTab, setActiveTab] = useState("summary");
  const [topKeywords, setTopKeywords] = useState<{word: string, count: number}[]>([]);

  useEffect(() => {
    fetchSentimentData();
  }, []);

  const fetchSentimentData = async () => {
    setIsLoading(true);
    try {
      // This would normally fetch from an API
      setTimeout(() => {
        // Mock sentiment data
        const mockSentimentData: SentimentData[] = [
          { category: "Positive", count: 42, color: "#16a34a" },
          { category: "Neutral", count: 28, color: "#3b82f6" },
          { category: "Negative", count: 18, color: "#dc2626" },
          { category: "Mixed", count: 12, color: "#f59e0b" },
        ];
        
        const mockKeywords = [
          { word: "RBI", count: 24 },
          { word: "Inflation", count: 18 },
          { word: "Interest Rates", count: 15 },
          { word: "GDP", count: 12 },
          { word: "Fiscal Policy", count: 10 },
          { word: "Trade Deficit", count: 8 },
          { word: "Foreign Investment", count: 7 },
          { word: "Manufacturing", count: 6 },
        ];
        
        setSentimentData(mockSentimentData);
        setTopKeywords(mockKeywords);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error fetching sentiment data:", error);
      toast.error("Failed to load sentiment analysis");
      setIsLoading(false);
    }
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const filterKeywords = topKeywords.filter(
    keyword => keyword.word.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const refreshData = () => {
    fetchSentimentData();
    toast.success("Sentiment data refreshed");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart4 className="h-5 w-5" />
          Market Sentiment Analysis
        </CardTitle>
        <CardDescription>Sentiment breakdown of market news and trends</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="keywords">Top Keywords</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} mentions`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-muted p-4 rounded-md">
                  <h4 className="font-medium mb-2">Market Sentiment Overview</h4>
                  <p className="text-sm text-muted-foreground">
                    Current market sentiment is predominantly positive (42%), with neutral coverage at 28% and negative at 18%. 
                    News about RBI policy changes and foreign investments are driving the positive sentiment, while inflation concerns 
                    contribute to negative mentions.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="keywords">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search keywords..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {filterKeywords.map((keyword, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded-md">
                      <span className="font-medium">{keyword.word}</span>
                      <Badge variant="secondary">{keyword.count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <Button variant="outline" size="sm" onClick={refreshData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href="https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
            Latest RBI Press Releases <ExternalLink className="h-4 w-4 ml-1" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MarketSentimentAnalysis;
