
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, CreditCard, Smartphone, Building, Wallet, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Define types
interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  details: any;
  is_default: boolean;
}

// Form schema
const paymentMethodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  accountNumber: z.string().optional(),
  bankName: z.string().optional(),
  upiId: z.string().optional(),
  is_default: z.boolean().default(false),
});

type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;

const PaymentMethods = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMethod, setCurrentMethod] = useState<PaymentMethod | null>(null);

  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      name: "",
      type: "card",
      accountNumber: "",
      bankName: "",
      upiId: "",
      is_default: false,
    },
  });

  const selectedType = form.watch("type");

  const fetchPaymentMethods = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, [user]);

  const onSubmit = async (values: PaymentMethodFormValues) => {
    if (!user) return;
    
    try {
      // Prepare the details object based on selected type
      let details = {};
      
      if (values.type === 'card') {
        details = { cardNumber: values.accountNumber };
      } else if (values.type === 'bank') {
        details = { 
          accountNumber: values.accountNumber,
          bankName: values.bankName 
        };
      } else if (values.type === 'upi') {
        details = { upiId: values.upiId };
      }
      
      // If this is being set as default, update all other methods
      if (values.is_default) {
        await supabase
          .from('payment_methods')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }
      
      if (isEditing && currentMethod) {
        // Update payment method
        const { error } = await supabase
          .from('payment_methods')
          .update({
            name: values.name,
            type: values.type,
            details,
            is_default: values.is_default,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentMethod.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Payment method updated successfully",
        });
      } else {
        // Create new payment method
        const { error } = await supabase
          .from('payment_methods')
          .insert({
            user_id: user.id,
            name: values.name,
            type: values.type,
            details,
            is_default: values.is_default,
          });
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Payment method added successfully",
        });
      }
      
      // Reset form and close dialog
      form.reset();
      setIsDialogOpen(false);
      setIsEditing(false);
      setCurrentMethod(null);
      fetchPaymentMethods();
    } catch (error: any) {
      console.error('Error saving payment method:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save payment method",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setCurrentMethod(method);
    setIsEditing(true);
    
    let accountNumber = "";
    let bankName = "";
    let upiId = "";
    
    if (method.details) {
      if (method.type === 'card') {
        accountNumber = method.details.cardNumber || "";
      } else if (method.type === 'bank') {
        accountNumber = method.details.accountNumber || "";
        bankName = method.details.bankName || "";
      } else if (method.type === 'upi') {
        upiId = method.details.upiId || "";
      }
    }
    
    form.reset({
      name: method.name,
      type: method.type,
      accountNumber,
      bankName,
      upiId,
      is_default: method.is_default,
    });
    
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Payment method deleted successfully",
      });
      
      fetchPaymentMethods();
    } catch (error: any) {
      console.error('Error deleting payment method:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete payment method",
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;
    
    try {
      // First, set all payment methods to non-default
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id);
      
      // Then, set the selected one as default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Default payment method updated",
      });
      
      fetchPaymentMethods();
    } catch (error: any) {
      console.error('Error setting default payment method:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update default payment method",
        variant: "destructive",
      });
    }
  };

  const handleDialogOpen = (open: boolean) => {
    if (!open) {
      form.reset();
      setIsEditing(false);
      setCurrentMethod(null);
    }
    setIsDialogOpen(open);
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="h-6 w-6" />;
      case 'bank':
        return <Building className="h-6 w-6" />; // Changed from Bank to Building
      case 'upi':
        return <Smartphone className="h-6 w-6" />;
      default:
        return <Wallet className="h-6 w-6" />;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-28 sm:pt-32 pb-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payment Methods</h1>
            <p className="text-muted-foreground mt-1">Manage your payment options</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 sm:mt-0" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{isEditing ? "Edit Payment Method" : "Add Payment Method"}</DialogTitle>
                <DialogDescription>
                  {isEditing ? "Update your payment method details below." : "Enter your payment method details below."}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter a name for this payment method" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="card">Credit/Debit Card</option>
                            <option value="bank">Bank Account</option>
                            <option value="upi">UPI</option>
                            <option value="other">Other</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {selectedType === "card" && (
                    <FormField
                      control={form.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Card Number (last 4 digits)</FormLabel>
                          <FormControl>
                            <Input placeholder="••••" maxLength={4} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {selectedType === "bank" && (
                    <>
                      <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter bank name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="accountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Number (last 4 digits)</FormLabel>
                            <FormControl>
                              <Input placeholder="••••" maxLength={4} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  
                  {selectedType === "upi" && (
                    <FormField
                      control={form.control}
                      name="upiId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>UPI ID</FormLabel>
                          <FormControl>
                            <Input placeholder="name@upi" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={form.control}
                    name="is_default"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                        <FormControl>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Make this my default payment method</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="submit">{isEditing ? "Update" : "Add"} Payment Method</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center py-20">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="ml-4 text-muted-foreground">Loading payment methods...</p>
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-muted/30 rounded-lg border border-dashed">
              <Wallet className="h-10 w-10 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No payment methods yet</h3>
              <p className="mt-1 text-muted-foreground">Add your first payment method to get started</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </div>
          ) : (
            paymentMethods.map((method) => (
              <Card key={method.id} className={method.is_default ? "border-primary" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${method.is_default ? 'bg-primary/10' : 'bg-muted'}`}>
                        {getPaymentMethodIcon(method.type)}
                      </div>
                      <div className="ml-3">
                        <CardTitle className="text-base">{method.name}</CardTitle>
                        <CardDescription>{method.type.charAt(0).toUpperCase() + method.type.slice(1)}</CardDescription>
                      </div>
                    </div>
                    {method.is_default && (
                      <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex items-center">
                        <Check className="h-3 w-3 mr-1" /> Default
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    {method.type === 'card' && method.details && method.details.cardNumber && (
                      <p>Card ending in {method.details.cardNumber}</p>
                    )}
                    {method.type === 'bank' && method.details && (
                      <>
                        {method.details.bankName && <p>{method.details.bankName}</p>}
                        {method.details.accountNumber && <p>Account ending in {method.details.accountNumber}</p>}
                      </>
                    )}
                    {method.type === 'upi' && method.details && method.details.upiId && (
                      <p>UPI ID: {method.details.upiId}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    {!method.is_default && (
                      <Button variant="outline" size="sm" onClick={() => handleSetDefault(method.id)}>
                        Set as Default
                      </Button>
                    )}
                    {method.is_default && <div />}
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(method)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(method.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PaymentMethods;
