
import { useState, useEffect } from "react";
import { ExternalLink, Trending } from "lucide-react";
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

interface MarketNewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  sentiment: "positive" | "negative" | "neutral";
}

const MarketNews = () => {
  const [newsItems, setNewsItems] = useState<MarketNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This would normally fetch from an API, but for demo purposes we'll use mock data
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setNewsItems([
        {
          title: "RBI Keeps Repo Rate Unchanged at 6.5%",
          description: "The Reserve Bank of India (RBI) maintained its key policy rate for the eighth consecutive time, focusing on controlling inflation.",
          url: "https://example.com/rbi-news",
          publishedAt: "2023-04-15T09:30:00Z",
          source: "Economic Times",
          sentiment: "neutral"
        },
        {
          title: "Sensex Crosses 74,000 Mark for First Time",
          description: "Indian stock market benchmark Sensex crossed the 74,000 mark for the first time amid strong foreign investment inflows.",
          url: "https://example.com/sensex-news",
          publishedAt: "2023-04-14T11:15:00Z",
          source: "LiveMint",
          sentiment: "positive"
        },
        {
          title: "Rupee Falls 12 Paise to 83.42 Against US Dollar",
          description: "The Indian rupee depreciated 12 paise to close at 83.42 against the US dollar due to persistent foreign fund outflows.",
          url: "https://example.com/rupee-news",
          publishedAt: "2023-04-13T14:45:00Z",
          source: "Business Standard",
          sentiment: "negative"
        },
        {
          title: "Government Raises Interest Rates on Small Savings Schemes",
          description: "The Indian government has increased interest rates on various small savings schemes by up to 30 basis points for the April-June quarter.",
          url: "https://example.com/savings-news",
          publishedAt: "2023-04-12T10:00:00Z",
          source: "Financial Express",
          sentiment: "positive"
        }
      ]);
      setIsLoading(false);
    }, 1500);
  }, []);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "negative":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trending className="h-5 w-5" />
          Market News & Analysis
        </CardTitle>
        <CardDescription>Latest financial news and market updates from India</CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {newsItems.map((item, index) => (
              <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium">{item.title}</h3>
                  <Badge variant="outline" className={getSentimentColor(item.sentiment)}>
                    {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{item.source} • {formatDate(item.publishedAt)}</span>
                  <Button variant="ghost" size="sm" className="h-auto p-0" asChild>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                      Read more <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-center">
        <Button variant="outline" asChild>
          <a href="https://www.rbi.org.in/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
            Visit RBI Website <ExternalLink className="h-4 w-4 ml-1" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MarketNews;
