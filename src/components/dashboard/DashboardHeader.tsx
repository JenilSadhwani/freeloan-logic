
import { RefreshCw, FileText, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface DashboardHeaderProps {
  toggleAutoUpdate: () => void;
  autoUpdateEnabled: boolean;
  openTaxModal: () => void;
}

const DashboardHeader = ({ 
  toggleAutoUpdate, 
  autoUpdateEnabled, 
  openTaxModal 
}: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="mb-4 sm:mb-0">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your financial overview at a glance.</p>
      </div>
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={toggleAutoUpdate}
        >
          <RefreshCw className="h-4 w-4" />
          {autoUpdateEnabled ? "Auto-update On" : "Auto-update Off"}
        </Button>
        <Button 
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          asChild
        >
          <Link to="/reports">
            <FileText className="h-4 w-4" />
            View Reports
          </Link>
        </Button>
        <Button 
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={openTaxModal}
        >
          <Calculator className="h-4 w-4" />
          Tax Calculator
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
