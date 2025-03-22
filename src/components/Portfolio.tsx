
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PlusCircle, Trash2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface PortfolioStock {
  id: string;
  symbol: string;
  shares: number;
  purchase_price: number;
  current_price?: number;
  value?: number;
  gain_loss?: number;
  gain_loss_percent?: number;
}

export function Portfolio() {
  const { user } = useAuth();
  const [stocks, setStocks] = useState<PortfolioStock[]>([]);
  const [newSymbol, setNewSymbol] = useState("");
  const [newShares, setNewShares] = useState<number>(0);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPortfolio();
    }
  }, [user]);

  const fetchPortfolio = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("portfolio")
        .select("*")
        .eq("user_id", user?.id);

      if (error) throw error;

      if (data) {
        setStocks(data);
        refreshPrices(data);
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      toast.error("Failed to load portfolio");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPrices = async (portfolioStocks: PortfolioStock[]) => {
    if (!portfolioStocks.length) return;
    
    try {
      setIsRefreshing(true);
      const symbols = portfolioStocks.map(stock => stock.symbol).join(",");
      
      const response = await fetch(`/api/functions/v1/finlab?endpoint=market/quotes&symbols=${symbols}`, {
        headers: {
          Authorization: `Bearer ${supabase.auth.getSession().then(res => res.data.session?.access_token)}`
        }
      });
      
      if (!response.ok) throw new Error("Failed to fetch market data");
      
      const data = await response.json();
      
      // Update the stocks with current prices
      const updatedStocks = portfolioStocks.map(stock => {
        const quote = data.data?.find(q => q.symbol === stock.symbol);
        const currentPrice = quote?.last_price || stock.purchase_price;
        const value = currentPrice * stock.shares;
        const gainLoss = value - (stock.purchase_price * stock.shares);
        const gainLossPercent = ((currentPrice - stock.purchase_price) / stock.purchase_price) * 100;
        
        return {
          ...stock,
          current_price: currentPrice,
          value,
          gain_loss: gainLoss,
          gain_loss_percent: gainLossPercent
        };
      });
      
      setStocks(updatedStocks);
    } catch (error) {
      console.error("Error refreshing prices:", error);
      toast.error("Failed to refresh prices");
    } finally {
      setIsRefreshing(false);
    }
  };

  const addStock = async () => {
    if (!newSymbol || !newShares || !newPrice) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("portfolio")
        .insert({
          user_id: user?.id,
          symbol: newSymbol.toUpperCase(),
          shares: newShares,
          purchase_price: newPrice
        })
        .select();

      if (error) throw error;

      toast.success("Stock added to portfolio");
      setNewSymbol("");
      setNewShares(0);
      setNewPrice(0);
      fetchPortfolio();
    } catch (error) {
      console.error("Error adding stock:", error);
      toast.error("Failed to add stock");
    }
  };

  const removeStock = async (id: string) => {
    try {
      const { error } = await supabase
        .from("portfolio")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Stock removed from portfolio");
      fetchPortfolio();
    } catch (error) {
      console.error("Error removing stock:", error);
      toast.error("Failed to remove stock");
    }
  };

  const totalValue = stocks.reduce((sum, stock) => sum + (stock.value || 0), 0);
  const totalGainLoss = stocks.reduce((sum, stock) => sum + (stock.gain_loss || 0), 0);
  const totalGainLossPercent = totalValue ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Portfolio</CardTitle>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => refreshPrices(stocks)} 
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-1 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Total Value</div>
              <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Total Gain/Loss</div>
              <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                {totalGainLoss >= 0 ? "+" : ""}{totalGainLoss.toFixed(2)} ({totalGainLossPercent.toFixed(2)}%)
              </div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Holdings</div>
              <div className="text-2xl font-bold">{stocks.length}</div>
            </div>
          </div>

          <div className="border rounded-md mb-4">
            <div className="p-4">
              <h3 className="text-base font-medium mb-3">Add New Stock</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <Input 
                    placeholder="Symbol (e.g., AAPL)" 
                    value={newSymbol} 
                    onChange={(e) => setNewSymbol(e.target.value)} 
                  />
                </div>
                <div>
                  <Input 
                    type="number" 
                    placeholder="Shares" 
                    value={newShares || ""} 
                    onChange={(e) => setNewShares(parseFloat(e.target.value))} 
                  />
                </div>
                <div>
                  <Input 
                    type="number" 
                    placeholder="Purchase Price ($)" 
                    value={newPrice || ""} 
                    onChange={(e) => setNewPrice(parseFloat(e.target.value))} 
                  />
                </div>
                <div>
                  <Button onClick={addStock} className="w-full">
                    <PlusCircle className="mr-1 h-4 w-4" /> Add Stock
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-6">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-r-transparent rounded-full inline-block"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading portfolio...</p>
            </div>
          ) : stocks.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead className="text-right">Shares</TableHead>
                    <TableHead className="text-right">Avg. Price</TableHead>
                    <TableHead className="text-right">Current Price</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">Gain/Loss</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stocks.map((stock) => (
                    <TableRow key={stock.id}>
                      <TableCell className="font-medium">{stock.symbol}</TableCell>
                      <TableCell className="text-right">{stock.shares}</TableCell>
                      <TableCell className="text-right">${stock.purchase_price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        ${stock.current_price?.toFixed(2) || "-"}
                      </TableCell>
                      <TableCell className="text-right">${stock.value?.toFixed(2) || "-"}</TableCell>
                      <TableCell className="text-right">
                        <span className={stock.gain_loss && stock.gain_loss >= 0 ? "text-green-600" : "text-red-600"}>
                          {stock.gain_loss ? (stock.gain_loss >= 0 ? "+" : "") + stock.gain_loss.toFixed(2) : "-"}
                          {stock.gain_loss_percent ? ` (${(stock.gain_loss_percent).toFixed(2)}%)` : ""}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeStock(stock.id)}
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-6 border rounded-md">
              <p className="text-muted-foreground">Your portfolio is empty. Add stocks to get started.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default Portfolio;
