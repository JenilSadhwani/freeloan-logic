
import { Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";

const About = () => {
  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image: "https://placehold.co/300x300/f8fafc/94a3b8?text=SJ",
      bio: "Former fintech executive with 15+ years of experience in financial technology and freelancer ecosystems."
    },
    {
      name: "Michael Chen",
      role: "CTO",
      image: "https://placehold.co/300x300/f8fafc/94a3b8?text=MC",
      bio: "Technology leader with expertise in building secure financial platforms and scalable cloud architecture."
    },
    {
      name: "Emma Roberts",
      role: "Head of Design",
      image: "https://placehold.co/300x300/f8fafc/94a3b8?text=ER",
      bio: "Award-winning designer focused on creating beautiful, intuitive experiences for financial applications."
    },
    {
      name: "James Wilson",
      role: "Financial Advisor",
      image: "https://placehold.co/300x300/f8fafc/94a3b8?text=JW",
      bio: "Certified financial planner with deep knowledge of freelancer tax strategies and financial planning."
    }
  ];

  const values = [
    {
      title: "Simplicity",
      description: "We believe financial tools should be clear and easy to use, removing complexity without sacrificing capabilities."
    },
    {
      title: "Transparency",
      description: "We are committed to clear communication, honest pricing, and full visibility into how our platform works."
    },
    {
      title: "Security",
      description: "We employ industry-leading security practices to ensure your financial data is always protected."
    },
    {
      title: "Continuous Improvement",
      description: "We constantly gather feedback and improve our platform to better serve the evolving needs of freelancers."
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen pt-24 pb-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_40%,hsl(var(--primary)/0.1),transparent)]" />
          <div className="container px-4 sm:px-6 mx-auto text-center relative z-10 py-16 sm:py-24">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight mb-6 animate-fade-in">
              Our mission is to empower<br /> freelancers financially
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in animation-delay-200">
              FinancePro was built by freelancers for freelancers. We understand the unique financial challenges of independent professionals.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 sm:py-24">
          <div className="container px-4 sm:px-6 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="aspect-video rounded-2xl overflow-hidden bg-muted shadow-lg">
                  <img 
                    src="https://placehold.co/800x450/f8fafc/94a3b8?text=Our+Story" 
                    alt="Our story" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight mb-4">Our Story</h2>
                  <div className="w-16 h-1 bg-primary rounded-full mb-6"></div>
                </div>
                <p className="text-muted-foreground">
                  FinancePro began in 2018 when our founder, Sarah Johnson, experienced firsthand the financial challenges of freelancing. After struggling with inconsistent income, complex tax situations, and financial planning uncertainty, she decided to build the solution she wished had existed.
                </p>
                <p className="text-muted-foreground">
                  What started as a simple budgeting tool has evolved into a comprehensive financial platform designed specifically for freelancers and independent professionals. We've grown from a team of three to a passionate company of 25, all dedicated to simplifying financial management for the self-employed.
                </p>
                <p className="text-muted-foreground">
                  Today, FinancePro serves over 50,000 freelancers across the globe, helping them track finances, prepare for taxes, and build sustainable businesses.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 sm:py-24 bg-muted/30">
          <div className="container px-4 sm:px-6 mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Our Values</h2>
              <p className="text-muted-foreground">
                The principles that guide every decision we make
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <div 
                  key={index}
                  className="bg-card p-8 rounded-xl border border-border shadow-sm hover-lift"
                >
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 sm:py-24">
          <div className="container px-4 sm:px-6 mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Meet Our Team</h2>
              <p className="text-muted-foreground">
                The people behind FinancePro building the best financial tools for freelancers
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <div key={index} className="flex flex-col items-center text-center hover-lift">
                  <div className="w-40 h-40 rounded-full overflow-hidden mb-4 bg-muted">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 sm:py-24 bg-muted/30 overflow-hidden relative">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_40%,hsl(var(--primary)/0.05),transparent)]" />
          <div className="container px-4 sm:px-6 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight mb-4">Get In Touch</h2>
                  <div className="w-16 h-1 bg-primary rounded-full mb-6"></div>
                </div>
                <p className="text-muted-foreground">
                  Have questions about FinancePro? We'd love to hear from you. Reach out to our team for support, feedback, or partnership opportunities.
                </p>
                
                <div className="space-y-4 pt-4">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-primary mt-0.5 mr-3" />
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-muted-foreground">hello@financepro.example.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-primary mt-0.5 mr-3" />
                    <div>
                      <h3 className="font-medium">Phone</h3>
                      <p className="text-muted-foreground">(123) 456-7890</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 mr-3" />
                    <div>
                      <h3 className="font-medium">Office</h3>
                      <p className="text-muted-foreground">
                        123 Financial Street<br />
                        San Francisco, CA 94107
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button asChild>
                    <Link to="/contact">
                      Contact Us <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute -inset-x-20 -top-10 -bottom-10 bg-primary/5 rounded-[40px] rotate-3 transform -z-10" />
                <div className="absolute -inset-x-20 -top-10 -bottom-10 bg-primary/5 rounded-[40px] -rotate-3 transform -z-10" />
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted shadow-lg">
                  <img 
                    src="https://placehold.co/800x600/f8fafc/94a3b8?text=Our+Office" 
                    alt="Our office" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default About;
