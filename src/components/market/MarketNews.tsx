
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  date: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Indian Markets Hit Record High as Investors Cheer Strong Earnings',
    summary: 'India's benchmark indices Sensex and Nifty 50 reached record highs today, driven by better-than-expected corporate earnings and strong foreign investments.',
    url: '#',
    source: 'Economic Times',
    date: '2024-07-15',
    sentiment: 'positive'
  },
  {
    id: '2',
    title: 'RBI Keeps Repo Rate Unchanged, Maintains Growth Forecast',
    summary: 'The Reserve Bank of India (RBI) has decided to keep the repo rate unchanged at 6.5% in its latest monetary policy meeting, while maintaining its GDP growth forecast at 7.2% for FY 2024-25.',
    url: '#',
    source: 'Business Standard',
    date: '2024-07-14',
    sentiment: 'neutral'
  },
  {
    id: '3',
    title: 'Rupee Falls 15 Paise Against US Dollar Amid Global Uncertainties',
    summary: 'The Indian rupee depreciated by 15 paise against the US dollar, closing at 83.35, as global economic uncertainties and rising crude oil prices put pressure on emerging market currencies.',
    url: '#',
    source: 'Financial Express',
    date: '2024-07-13',
    sentiment: 'negative'
  },
  {
    id: '4',
    title: 'IT Sector Leads Gains as Infosys, TCS Report Strong Q1 Results',
    summary: 'IT giants Infosys and TCS reported better-than-expected Q1 results, driving the sector higher and contributing significantly to market gains.',
    url: '#',
    source: 'Mint',
    date: '2024-07-12',
    sentiment: 'positive'
  },
  {
    id: '5',
    title: 'Government Unveils New Policy to Boost Manufacturing Sector',
    summary: 'The Indian government has announced a new policy framework aimed at boosting the manufacturing sector, with special incentives for electronics and semiconductor industries.',
    url: '#',
    source: 'The Hindu BusinessLine',
    date: '2024-07-11',
    sentiment: 'positive'
  }
];

const MarketSentiment = () => {
  const [marketSentiment, setMarketSentiment] = useState<'positive' | 'negative' | 'neutral'>('neutral');
  const [sentimentScore, setSentimentScore] = useState(0);

  useEffect(() => {
    // Calculate sentiment based on news
    const positiveCount = MOCK_NEWS.filter(news => news.sentiment === 'positive').length;
    const negativeCount = MOCK_NEWS.filter(news => news.sentiment === 'negative').length;
    
    const score = positiveCount - negativeCount;
    setSentimentScore(score);
    
    if (score > 1) {
      setMarketSentiment('positive');
    } else if (score < 0) {
      setMarketSentiment('negative');
    } else {
      setMarketSentiment('neutral');
    }
  }, []);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-muted/50 rounded-lg mb-6">
      <div className="flex items-center mb-4 sm:mb-0">
        {marketSentiment === 'positive' ? (
          <TrendingUp className="h-10 w-10 text-green-500 mr-4" />
        ) : marketSentiment === 'negative' ? (
          <TrendingDown className="h-10 w-10 text-red-500 mr-4" />
        ) : (
          <Sparkles className="h-10 w-10 text-blue-500 mr-4" />
        )}
        <div>
          <h3 className="text-lg font-semibold">Market Sentiment</h3>
          <p className={`text-sm ${
            marketSentiment === 'positive' 
              ? 'text-green-600' 
              : marketSentiment === 'negative' 
                ? 'text-red-600' 
                : 'text-blue-600'
          }`}>
            {marketSentiment === 'positive' 
              ? 'Bullish' 
              : marketSentiment === 'negative' 
                ? 'Bearish' 
                : 'Neutral'}
          </p>
        </div>
      </div>
      <div className="flex space-x-3">
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
          Positive: {MOCK_NEWS.filter(news => news.sentiment === 'positive').length}
        </Badge>
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100">
          Neutral: {MOCK_NEWS.filter(news => news.sentiment === 'neutral').length}
        </Badge>
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
          Negative: {MOCK_NEWS.filter(news => news.sentiment === 'negative').length}
        </Badge>
      </div>
    </div>
  );
};

const MarketNews = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Newspaper className="h-5 w-5 text-primary mr-2" />
            <CardTitle>Market News & Sentiment</CardTitle>
          </div>
        </div>
        <CardDescription>Latest financial news and market sentiment analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <MarketSentiment />
        
        <Accordion type="single" collapsible className="w-full">
          {MOCK_NEWS.map((news) => (
            <AccordionItem key={news.id} value={news.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="text-left flex items-start">
                  <Badge 
                    className={`mr-3 mt-0.5 ${
                      news.sentiment === 'positive' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : news.sentiment === 'negative' 
                          ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    }`}
                  >
                    {news.source}
                  </Badge>
                  <span>{news.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-14">
                  <p className="mb-2">{news.summary}</p>
                  <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                    <span>{new Date(news.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}</span>
                    <a href={news.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Read more
                    </a>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default MarketNews;
