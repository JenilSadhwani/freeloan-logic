
import { Construction } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PaymentMethods = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 pt-28 sm:pt-32 pb-16 min-h-[80vh] flex flex-col items-center justify-center">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Construction className="h-12 w-12 text-primary" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Coming Soon</h1>
            <p className="text-muted-foreground">
              We're working hard to bring you convenient payment methods. 
              This feature will be available in the next update.
            </p>
          </div>
          
          <div className="pt-4">
            <Button asChild>
              <Link to="/dashboard">Return to Dashboard</Link>
            </Button>
          </div>
          
          <div className="border-t border-border pt-6 mt-6">
            <p className="text-sm text-muted-foreground">
              Payment features coming in Q3 2024, including credit card integration, 
              automatic billing, and receipt management.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentMethods;
