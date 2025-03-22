
import { useState } from "react";
import { Bell, Moon, Sun, Globe, Shield, CreditCard, Smartphone, QrCode } from "lucide-react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const Settings = () => {
  const { user, hasTwoFactor, setupTwoFactor, verifyTwoFactor } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if dark mode is already set
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    transactionAlerts: true,
    marketUpdates: false,
    weeklyReports: true,
  });

  const [showSetupTwoFactorDialog, setShowSetupTwoFactorDialog] = useState(false);
  const [showVerifyTwoFactorDialog, setShowVerifyTwoFactorDialog] = useState(false);
  const [twoFactorQRUrl, setTwoFactorQRUrl] = useState("");
  const [twoFactorSecret, setTwoFactorSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  
  const toggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    
    if (newValue) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    toast.success(`${newValue ? "Dark" : "Light"} mode enabled`);
  };
  
  const handleNotificationChange = (key) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    
    toast.success("Notification settings updated");
  };

  const handleSetupTwoFactor = async () => {
    try {
      const { url, secret } = await setupTwoFactor();
      setTwoFactorQRUrl(url);
      setTwoFactorSecret(secret);
      setShowSetupTwoFactorDialog(true);
    } catch (error) {
      console.error("Error setting up 2FA:", error);
      toast.error("Failed to set up two-factor authentication");
    }
  };

  const handleVerifyTwoFactor = async () => {
    setIsVerifying(true);
    try {
      const isValid = await verifyTwoFactor(verificationCode);
      if (isValid) {
        setShowVerifyTwoFactorDialog(false);
        setShowSetupTwoFactorDialog(false);
        toast.success("Two-factor authentication enabled successfully");
      } else {
        toast.error("Invalid verification code. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying 2FA:", error);
      toast.error("Failed to verify two-factor authentication");
    }
    setIsVerifying(false);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-28 sm:pt-32 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Customize your account preferences</p>
        </div>
        
        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="grid grid-cols-3 md:grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          
          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how the app looks for you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {isDarkMode ? (
                      <Moon className="h-5 w-5 text-primary" />
                    ) : (
                      <Sun className="h-5 w-5 text-primary" />
                    )}
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-sm text-muted-foreground">
                        {isDarkMode ? "Currently using dark theme" : "Switch to dark theme"}
                      </p>
                    </div>
                  </div>
                  <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Globe className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Language</p>
                      <p className="text-sm text-muted-foreground">
                        Choose your preferred language
                      </p>
                    </div>
                  </div>
                  <select className="flex h-10 w-32 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Bell className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications
                      </p>
                    </div>
                  </div>
                  <Switch 
                    checked={notificationSettings.emailNotifications} 
                    onCheckedChange={() => handleNotificationChange('emailNotifications')} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications on your device
                      </p>
                    </div>
                  </div>
                  <Switch 
                    checked={notificationSettings.pushNotifications} 
                    onCheckedChange={() => handleNotificationChange('pushNotifications')} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Transaction Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified about new transactions
                      </p>
                    </div>
                  </div>
                  <Switch 
                    checked={notificationSettings.transactionAlerts} 
                    onCheckedChange={() => handleNotificationChange('transactionAlerts')} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your account security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-4">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">
                        Change your password
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="mt-2">Change Password</Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-4">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        {hasTwoFactor 
                          ? "Two-factor authentication is enabled" 
                          : "Add an extra layer of security to your account"}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={hasTwoFactor ? () => setShowVerifyTwoFactorDialog(true) : handleSetupTwoFactor}
                  >
                    {hasTwoFactor ? "Manage 2FA" : "Enable 2FA"}
                  </Button>
                </div>
                
                <div className="pt-4 border-t">
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Preferences Settings */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>App Preferences</CardTitle>
                <CardDescription>Customize your app experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col space-y-4">
                  <Label className="text-base font-medium">Default Currency</Label>
                  <select className="flex h-10 w-full md:w-1/3 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                  </select>
                </div>
                
                <div className="flex flex-col space-y-4">
                  <Label className="text-base font-medium">Date Format</Label>
                  <select className="flex h-10 w-full md:w-1/3 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                    <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                    <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Two-Factor Setup Dialog */}
        <Dialog open={showSetupTwoFactorDialog} onOpenChange={setShowSetupTwoFactorDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
              <DialogDescription>
                Scan the QR code below with your authenticator app (like Google Authenticator or Authy) and enter the verification code.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center space-y-4 py-4">
              <div className="border border-border rounded-lg p-2 bg-white">
                <QrCode className="h-48 w-48 text-black" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Can't scan the QR code? Use this code in your authenticator app: <span className="font-mono font-bold">{twoFactorSecret}</span>
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <InputOTP
                maxLength={6}
                value={verificationCode}
                onChange={setVerificationCode}
                render={({ slots }) => (
                  <InputOTPGroup className="gap-2">
                    {slots.map((slot, index) => (
                      <InputOTPSlot key={index} {...slot} index={index} />
                    ))}
                  </InputOTPGroup>
                )}
              />
            </div>
            <DialogFooter className="sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowSetupTwoFactorDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button"
                onClick={handleVerifyTwoFactor}
                disabled={verificationCode.length !== 6 || isVerifying}
              >
                {isVerifying ? "Verifying..." : "Verify"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Two-Factor Verification Dialog */}
        <Dialog open={showVerifyTwoFactorDialog} onOpenChange={setShowVerifyTwoFactorDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Verify Two-Factor Authentication</DialogTitle>
              <DialogDescription>
                Enter the verification code from your authenticator app to verify your identity.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col space-y-2 py-4">
              <Label htmlFor="verification-code">Verification Code</Label>
              <InputOTP
                maxLength={6}
                value={verificationCode}
                onChange={setVerificationCode}
                render={({ slots }) => (
                  <InputOTPGroup className="gap-2">
                    {slots.map((slot, index) => (
                      <InputOTPSlot key={index} {...slot} index={index} />
                    ))}
                  </InputOTPGroup>
                )}
              />
            </div>
            <DialogFooter className="sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowVerifyTwoFactorDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button"
                onClick={handleVerifyTwoFactor}
                disabled={verificationCode.length !== 6 || isVerifying}
              >
                {isVerifying ? "Verifying..." : "Verify"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Settings;
