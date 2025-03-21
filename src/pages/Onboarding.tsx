
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";

const formSchema = z.object({
  currentBalance: z.coerce.number().min(0, "Balance must be a positive number"),
});

type FormValues = z.infer<typeof formSchema>;

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentBalance: 0,
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error("You must be logged in to complete onboarding");
      return;
    }

    setIsLoading(true);

    try {
      // Update the user's profile
      const { error } = await supabase
        .from('profiles')
        .update({
          current_balance: values.currentBalance,
          is_onboarded: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success("Onboarding completed successfully");
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Onboarding error:", err);
      toast.error(err.message || "Failed to complete onboarding");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen pt-28 sm:pt-32 flex justify-center">
        <div className="w-full max-w-md px-4 sm:px-0">
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome to FinancePro</h1>
                <p className="text-muted-foreground">Let's set up your account</p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="currentBalance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Balance</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                            <Input
                              type="number"
                              step="0.01"
                              className="pl-7"
                              placeholder="0.00"
                              {...field}
                              disabled={isLoading}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Complete Setup"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Onboarding;
