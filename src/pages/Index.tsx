
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, PieChart, LineChart, BarChart4, Wallet, Layers, TrendingUp, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

const Index = () => {
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  useEffect(() => {
    const handleScroll = () => {
      featureRefs.current.forEach(ref => {
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
          ref.classList.add('opacity-100', 'translate-y-0');
          ref.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <PieChart className="h-8 w-8 text-primary" />,
      title: "Visual Analytics",
      description: "Gain insights with intuitive charts and reports that visualize your financial data at a glance."
    },
    {
      icon: <Wallet className="h-8 w-8 text-primary" />,
      title: "Income Tracking",
      description: "Track invoices, payments, and income streams in one place with automated categorization."
    },
    {
      icon: <Layers className="h-8 w-8 text-primary" />,
      title: "Expense Management",
      description: "Organize and categorize expenses, track receipts, and manage your business costs efficiently."
    },
    {
      icon: <BarChart4 className="h-8 w-8 text-primary" />,
      title: "Financial Reports",
      description: "Generate professional reports for tax season, client billing, and business planning."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Market Insights",
      description: "Stay informed with real-time market data and customize your financial portfolio."
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: "Secure & Private",
      description: "Bank-level security ensures your financial data remains protected and private."
    }
  ];

  const pricing = [
    {
      title: "Starter",
      price: "Free",
      description: "Perfect for freelancers just getting started",
      features: [
        "Basic income & expense tracking",
        "Limited financial reports",
        "Up to 5 clients",
        "Email support"
      ],
      cta: "Get Started",
      ctaLink: "/signup",
      popular: false
    },
    {
      title: "Professional",
      price: "$9/month",
      description: "Ideal for growing freelance businesses",
      features: [
        "Advanced income & expense tracking",
        "Comprehensive financial reports",
        "Unlimited clients",
        "Invoice management",
        "Basic market insights",
        "Priority support"
      ],
      cta: "Start Free Trial",
      ctaLink: "/signup",
      popular: true
    },
    {
      title: "Enterprise",
      price: "$19/month",
      description: "For established freelance businesses",
      features: [
        "All Professional features",
        "Advanced market analytics",
        "Tax preparation tools",
        "Team access (up to 3 users)",
        "Custom financial dashboards",
        "Dedicated support"
      ],
      cta: "Contact Sales",
      ctaLink: "/contact",
      popular: false
    }
  ];

  return (
    <Layout>
      <div className="pt-28 sm:pt-32 md:pt-36">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_40%,hsl(var(--primary)/0.1),transparent)]" />
          <div className="container px-4 sm:px-6 mx-auto text-center relative z-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight md:leading-tight tracking-tight mb-6 animate-fade-in">
              Financial clarity for
              <span className="relative inline-block px-2">
                <span className="relative z-10 text-primary">freelancers</span>
                <span className="absolute -inset-1 -z-10 bg-primary/10 blur-xl rounded-full" />
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in animation-delay-200">
              Streamline your finances, track expenses, monitor income, and make informed financial decisions with our intuitive platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto animate-fade-in animation-delay-300">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/signup">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link to="/login">Log in</Link>
              </Button>
            </div>

            <div className="mt-16 sm:mt-24 relative mx-auto max-w-5xl animate-fade-in animation-delay-500">
              <div className="absolute inset-0 -z-10 bg-primary/5 rounded-2xl shadow-xl blur-xl" />
              <div className="glass rounded-xl shadow-2xl overflow-hidden">
                <img 
                  src="https://placehold.co/1200x600/f8fafc/e2e8f0?text=Dashboard+Preview" 
                  alt="FinancePro Dashboard" 
                  className="w-full h-auto object-cover" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 sm:py-28 mt-16 sm:mt-24 relative">
          <div className="container px-4 sm:px-6 mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Designed for freelancers</h2>
              <p className="text-lg text-muted-foreground">
                Every feature crafted to simplify your financial management.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  ref={el => featureRefs.current[index] = el}
                  className="p-6 rounded-xl border border-border bg-card hover:shadow-md transition-all duration-300 opacity-0 translate-y-10 hover-lift"
                  style={{ transitionDelay: `${100 * index}ms` }}
                >
                  <div className="mb-4 p-3 rounded-lg bg-primary/10 w-fit">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4 sm:px-6 mx-auto">
            <blockquote className="text-center max-w-3xl mx-auto">
              <p className="text-xl sm:text-2xl font-display font-medium text-foreground italic mb-6">
                "FinancePro has transformed how I manage my freelance business finances. The clarity and ease of use is unmatched."
              </p>
              <footer className="flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <span className="text-primary font-medium">AJ</span>
                </div>
                <div>
                  <p className="font-medium">Alex Johnson</p>
                  <p className="text-sm text-muted-foreground">Web Developer & Designer</p>
                </div>
              </footer>
            </blockquote>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 sm:py-28">
          <div className="container px-4 sm:px-6 mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Simple, transparent pricing</h2>
              <p className="text-lg text-muted-foreground">
                Choose the plan that fits your freelance business needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {pricing.map((plan, index) => (
                <div 
                  key={index}
                  className={`rounded-xl border ${plan.popular ? 'border-primary' : 'border-border'} overflow-hidden transition-all duration-300 hover:shadow-lg ${plan.popular ? 'shadow-md' : ''}`}
                >
                  <div className={`p-6 ${plan.popular ? 'bg-primary/5' : ''}`}>
                    {plan.popular && (
                      <span className="inline-block text-xs font-medium text-primary bg-primary/10 rounded-full px-3 py-1 mb-3">
                        Most Popular
                      </span>
                    )}
                    <h3 className="text-xl font-bold mb-2">{plan.title}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">{plan.price}</span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                    <Button 
                      asChild 
                      className={`w-full ${plan.popular ? '' : 'bg-foreground hover:bg-foreground/90'}`}
                    >
                      <Link to={plan.ctaLink}>{plan.cta}</Link>
                    </Button>
                  </div>
                  <div className="p-6 bg-card">
                    <ul className="space-y-3">
                      {plan.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 sm:py-28 bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(40%_40%_at_55%_40%,hsl(var(--primary)/0.1),transparent)]" />
          <div className="container px-4 sm:px-6 mx-auto text-center max-w-3xl">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Ready to take control of your freelance finances?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of freelancers who have simplified their financial management.
            </p>
            <Button asChild size="lg">
              <Link to="/signup">Start Your Free Trial <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
