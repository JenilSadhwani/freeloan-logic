
import { Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const About = () => {
  const team = [
    {
      name: "Jyothika Lal",
      role: "Owner",
      image: "/lovable-uploads/b228bbe5-dbd0-4a65-aebd-f74d6e531365.png",
      bio: "Former fintech executive with 15+ years of experience in financial technology and freelancer ecosystems."
    },
    {
      name: "Jeevesh Mishra",
      role: "Scrum Master",
      image: "/lovable-uploads/f10a09d0-c131-443d-bc2a-015298c36dfb.png",
      bio: "Technology leader with expertise in building secure financial platforms and scalable cloud architecture."
    },
    {
      name: "Jenil Sadhwani",
      role: "Founder and Developer",
      image: "/lovable-uploads/c14b9623-ca3c-4d78-ad2e-4c5b97cadd3b.png",
      bio: "Award-winning designer, developer focused on creating beautiful, intuitive experiences for financial applications."
    },
    {
      name: "Dr. Antoni Sophia",
      role: "Guide",
      image: "/lovable-uploads/4576439f-92ac-4cc6-9349-8dba1a364891.png",
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
                    src="https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80" 
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
                  FinancePro began in 2018 when our founder, Jenil Sadhwani, experienced firsthand the financial challenges of freelancing. After struggling with inconsistent income, complex tax situations, and financial planning uncertainty, he decided to build the solution he wished had existed.
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
                  <Avatar className="w-40 h-40 mb-4">
                    <AvatarImage src={member.image} alt={member.name} className="object-cover" />
                    <AvatarFallback className="text-xl">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
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
                      <p className="text-muted-foreground">jenil.sadhwani04@gmail.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-primary mt-0.5 mr-3" />
                    <div>
                      <h3 className="font-medium">Phone</h3>
                      <p className="text-muted-foreground">(91)-9377566687</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 mr-3" />
                    <div>
                      <h3 className="font-medium">Office</h3>
                      <p className="text-muted-foreground">
                        3165 Estancia Potheri<br />
                        Chennai, Tamil Nadu 603203
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
                    src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80" 
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
