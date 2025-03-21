
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Process the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (data.session) {
          // Check if user is onboarded
          const { data: profileData } = await supabase
            .from('profiles')
            .select('is_onboarded')
            .eq('id', data.session.user.id)
            .single();
          
          toast.success("Login successful");
          
          // Redirect based on onboarding status
          if (profileData && !profileData.is_onboarded) {
            navigate("/onboarding");
          } else {
            navigate("/dashboard");
          }
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        toast.error("Authentication failed");
        navigate("/login");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
