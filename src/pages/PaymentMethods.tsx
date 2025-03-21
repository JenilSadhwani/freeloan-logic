import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Trash2, PlusCircle, Building, CreditCardIcon, Smartphone } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Define types
interface PaymentMethod {
  id: string;
  name: string;
  type: string;
}

// Form schema
const paymentMethodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["credit_card", "bank_account", "mobile_payment"]),
});

type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;

const PaymentMethods = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<PaymentMethod | null>(null);

  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      name: "",
      type: "credit_card",
    },
  });

  const fetchPaymentMethods = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
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
      if (isEditing && currentPaymentMethod) {
        // Update payment method
        const { error } = await supabase
          .from('payment_methods')
          .update({
            name: values.name,
            type: values.type,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentPaymentMethod.id);
        
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
      setCurrentPaymentMethod(null);
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

  const handleEdit = (paymentMethod: PaymentMethod) => {
    setCurrentPaymentMethod(paymentMethod);
    setIsEditing(true);
    
    form.reset({
      name: paymentMethod.name,
      type: paymentMethod.type as "credit_card" | "bank_account" | "mobile_payment",
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

  const handleDialogOpen = (open: boolean) => {
    if (!open) {
      form.reset();
      setIsEditing(false);
      setCurrentPaymentMethod(null);
    }
    setIsDialogOpen(open);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-28 sm:pt-32 pb-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payment Methods</h1>
            <p className="text-muted-foreground mt-1">Manage your payment methods</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 sm:mt-0" onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{isEditing ? "Edit Payment Method" : "Add Payment Method"}</DialogTitle>
                <DialogDescription>
                  {isEditing ? "Update the payment method details below." : "Enter the payment method details below."}
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
                          <Input placeholder="Enter name" {...field} />
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
                            <option value="credit_card">Credit Card</option>
                            <option value="bank_account">Bank Account</option>
                            <option value="mobile_payment">Mobile Payment</option>
                          </select>
                        </FormControl>
                        <FormMessage />
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
        
        <div className="rounded-lg border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <div className="flex justify-center">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading payment methods...</p>
                  </TableCell>
                </TableRow>
              ) : paymentMethods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <p className="text-muted-foreground">No payment methods found</p>
                    <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Your First Payment Method
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                paymentMethods.map((paymentMethod) => (
                  <TableRow key={paymentMethod.id}>
                    <TableCell>{paymentMethod.name}</TableCell>
                    <TableCell>
                      {paymentMethod.type === "credit_card" && (
                        <div className="flex items-center">
                          <CreditCardIcon className="h-4 w-4 mr-1" />
                          Credit Card
                        </div>
                      )}
                      {paymentMethod.type === "bank_account" && (
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          Bank Account
                        </div>
                      )}
                      {paymentMethod.type === "mobile_payment" && (
                        <div className="flex items-center">
                          <Smartphone className="h-4 w-4 mr-1" />
                          Mobile Payment
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(paymentMethod)}>
                          <CreditCard className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(paymentMethod.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentMethods;
