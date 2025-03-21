
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, MessageSquare, MapPin, Phone, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Layout from "@/components/Layout";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubmitted(true);
      toast.success("Message sent successfully!");
      
      // Reset form after successful submission
      setTimeout(() => {
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
        setIsSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen pt-24 pb-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_40%,hsl(var(--primary)/0.1),transparent)]" />
          <div className="container px-4 sm:px-6 mx-auto text-center relative z-10 py-12 sm:py-16">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight mb-6 animate-fade-in">
              Contact Us
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in animation-delay-200">
              Have questions or feedback? We'd love to hear from you. Our team is here to help.
            </p>
          </div>
        </section>

        {/* Contact Form and Info */}
        <section className="py-12">
          <div className="container px-4 sm:px-6 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Contact Form */}
              <div className="bg-card rounded-xl border border-border shadow-sm p-6 sm:p-8 hover-lift">
                <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                {isSubmitted ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground mb-6">
                      Thank you for reaching out. We'll get back to you as soon as possible.
                    </p>
                    <Button onClick={() => setIsSubmitted(false)}>
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Full Name
                        </label>
                        <Input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email Address
                        </label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@example.com"
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">
                        Subject
                      </label>
                      <Select 
                        value={subject} 
                        onValueChange={setSubject} 
                        disabled={isSubmitting}
                      >
                        <SelectTrigger id="subject">
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="billing">Billing Question</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="How can we help you?"
                        rows={6}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>Sending Message...</>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" /> Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Contact Information</h2>
                  <p className="text-muted-foreground mb-6">
                    Reach out to us using any of the methods below. Our support team is available Monday through Friday, 9am - 6pm IST.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start p-4 bg-card border border-border rounded-lg hover-lift">
                      <div className="bg-primary/10 p-3 rounded-md mr-4">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Email Us</h3>
                        <p className="text-muted-foreground text-sm mb-2">For general inquiries and support</p>
                        <a href="mailto:hello@financepro.example.com" className="text-primary hover:underline font-medium">
                          jenil.sadhwani04@gmail.com
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start p-4 bg-card border border-border rounded-lg hover-lift">
                      <div className="bg-primary/10 p-3 rounded-md mr-4">
                        <Phone className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Call Us</h3>
                        <p className="text-muted-foreground text-sm mb-2">Mon-Fri from 9am to 6pm IST</p>
                        <a href="tel:+11234567890" className="text-primary hover:underline font-medium">
                          (91)-9377566687
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start p-4 bg-card border border-border rounded-lg hover-lift">
                      <div className="bg-primary/10 p-3 rounded-md mr-4">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Visit Our Office</h3>
                        <p className="text-muted-foreground text-sm mb-2">Stop by for a coffee and a chat</p>
                        <address className="not-italic text-primary font-medium">
                          3165 Estancia Potheri<br />
                          Chennai, Tamil Nadu 603202<br />
                          India
                        </address>
                      </div>
                    </div>
                    
                    <div className="flex items-start p-4 bg-card border border-border rounded-lg hover-lift">
                      <div className="bg-primary/10 p-3 rounded-md mr-4">
                        <MessageSquare className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Live Chat</h3>
                        <p className="text-muted-foreground text-sm mb-2">Chat with our support team in real-time</p>
                        <Button variant="outline" size="sm" onClick={() => toast.info("Live chat feature coming soon!")}>
                          Start Chat
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Frequently Asked Questions</h3>
                  <div className="space-y-4">
                    <div className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                      <h4 className="font-medium mb-1">What forms of payment do you accept?</h4>
                      <p className="text-sm text-muted-foreground">
                        We accept all major credit cards, PayPal, and bank transfers for our subscription plans.
                      </p>
                    </div>
                    <div className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                      <h4 className="font-medium mb-1">Can I cancel my subscription at any time?</h4>
                      <p className="text-sm text-muted-foreground">
                        Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
                      </p>
                    </div>
                    <div className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                      <h4 className="font-medium mb-1">How secure is my financial data?</h4>
                      <p className="text-sm text-muted-foreground">
                        We use bank-level encryption and security measures to ensure your data is always protected.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-12">
          <div className="container px-4 sm:px-6 mx-auto">
            <div className="rounded-xl overflow-hidden shadow-lg border border-border h-[400px] w-full">
              <img 
                src="https://placehold.co/1200x400/f8fafc/94a3b8?text=Map" 
                alt="Office Location Map" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Contact;
