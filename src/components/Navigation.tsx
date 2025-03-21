
import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogIn, User, ChevronDown, CreditCard, PieChart, History, BarChart3, TrendingUp, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// Define types for navigation items
interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, signOut, isLoading } = useAuth();

  // Check if user is on landing page
  const isLandingPage = location.pathname === "/";
  
  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  // Nav items when logged in
  const authenticatedNavItems: NavItem[] = [
    { label: "Dashboard", path: "/dashboard", icon: <PieChart className="w-4 h-4" /> },
    { label: "Transactions", path: "/transactions", icon: <History className="w-4 h-4" /> },
    { label: "Reports", path: "/reports", icon: <BarChart3 className="w-4 h-4" /> },
    { label: "Payment Methods", path: "/payment-methods", icon: <CreditCard className="w-4 h-4" /> },
    { label: "Markets", path: "/markets", icon: <TrendingUp className="w-4 h-4" /> },
  ];

  // Nav items for landing page (when not logged in)
  const landingNavItems: NavItem[] = [
    { label: "Features", path: "/#features" },
    { label: "Pricing", path: "/#pricing" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  // Choose which nav items to display based on auth state and current page
  const displayItems = user ? authenticatedNavItems : (isLandingPage ? landingNavItems : []);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-md shadow-sm py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <NavLink 
          to="/" 
          className="text-foreground font-display font-bold text-2xl flex items-center group"
        >
          <div className="relative w-8 h-8 mr-2">
            <div className="absolute inset-0 bg-primary rounded-md rotate-45 group-hover:-rotate-45 transition-transform duration-300"></div>
            <div className="absolute inset-1 bg-background rounded-sm rotate-45 group-hover:-rotate-45 transition-transform duration-300"></div>
          </div>
          Finance<span className="text-primary">Pro</span>
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {displayItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors relative group flex items-center",
                  isActive
                    ? "text-primary"
                    : "text-foreground/80 hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {item.icon && <span className="mr-1.5">{item.icon}</span>}
                  {item.label}
                  <span
                    className={cn(
                      "absolute bottom-0 left-0 w-full h-0.5 bg-primary transform origin-left transition-transform duration-300",
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    )}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Authentication/User Menu */}
        <div className="hidden md:flex items-center space-x-4">
          {isLoading ? (
            <div className="h-9 w-24 rounded-md bg-muted animate-pulse"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="hidden sm:inline-block">Account</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem disabled className="font-medium opacity-100">
                  {user.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <NavLink to="/dashboard" className="cursor-pointer">Dashboard</NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to="/transactions" className="cursor-pointer">Transactions</NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to="/reports" className="cursor-pointer">Reports</NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to="/payment-methods" className="cursor-pointer">Payment Methods</NavLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <NavLink to="/login" className="flex items-center gap-1">
                  <LogIn className="w-4 h-4 mr-1" />
                  Log in
                </NavLink>
              </Button>
              <Button size="sm" asChild>
                <NavLink to="/signup">Sign up</NavLink>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden flex items-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 top-[57px] bg-background z-40 md:hidden transition-all duration-300 ease-in-out",
          mobileMenuOpen
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-full pointer-events-none"
        )}
      >
        <nav className="container h-full flex flex-col px-4 pt-8 pb-20 overflow-y-auto">
          <div className="flex flex-col space-y-3">
            {displayItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "px-4 py-3 rounded-lg text-base font-medium transition-colors flex items-center",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  )
                }
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="mt-auto pt-6 flex flex-col space-y-3">
            {isLoading ? (
              <div className="h-12 rounded-md bg-muted animate-pulse"></div>
            ) : user ? (
              <>
                <div className="px-4 py-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Signed in as</p>
                  <p className="font-medium truncate">{user.email}</p>
                </div>
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" asChild className="w-full justify-start">
                  <NavLink to="/login" className="flex items-center">
                    <LogIn className="w-4 h-4 mr-2" />
                    Log in
                  </NavLink>
                </Button>
                <Button asChild className="w-full justify-start">
                  <NavLink to="/signup">Sign up</NavLink>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navigation;
