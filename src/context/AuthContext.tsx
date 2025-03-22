
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  hasTwoFactor: boolean;
  setupTwoFactor: () => Promise<{url: string, secret: string}>;
  verifyTwoFactor: (token: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasTwoFactor, setHasTwoFactor] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // Check if user has 2FA enabled
        if (session?.user) {
          checkTwoFactorStatus(session.user.id);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      // Check if user has 2FA enabled
      if (session?.user) {
        checkTwoFactorStatus(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkTwoFactorStatus = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('has_two_factor')
        .eq('id', userId)
        .single();
      
      setHasTwoFactor(data?.has_two_factor || false);
    } catch (error) {
      console.error("Error checking 2FA status:", error);
    }
  };

  const setupTwoFactor = async () => {
    try {
      // In a real app, you would call a backend API to generate a TOTP secret
      // For now, we'll simulate this with a placeholder
      const secret = 'EXAMPLESECRETKEY';
      const url = `otpauth://totp/FinanceApp:${user?.email}?secret=${secret}&issuer=FinanceApp`;
      
      // Update user profile with 2FA enabled
      if (user) {
        await supabase
          .from('profiles')
          .update({ has_two_factor: true })
          .eq('id', user.id);
        
        setHasTwoFactor(true);
      }
      
      return { url, secret };
    } catch (error) {
      console.error("Error setting up 2FA:", error);
      throw error;
    }
  };

  const verifyTwoFactor = async (token: string) => {
    try {
      // In a real app, you would verify the token against the stored secret
      // For demo purposes, accept any 6-digit code
      const isValid = /^\d{6}$/.test(token);
      
      if (isValid) {
        toast.success("Two-factor authentication verified successfully");
        return true;
      } else {
        toast.error("Invalid verification code");
        return false;
      }
    } catch (error) {
      console.error("Error verifying 2FA:", error);
      return false;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      signOut, 
      hasTwoFactor, 
      setupTwoFactor, 
      verifyTwoFactor 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
