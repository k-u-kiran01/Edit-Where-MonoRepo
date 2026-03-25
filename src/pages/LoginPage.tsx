import React, { useState } from 'react';
import { ArrowLeft, Mail, KeyRound, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';

// 1. Import your custom hook!
import { useLoginHook } from '../hooks/useLoginHook';
import { useNavigate } from 'react-router-dom';

interface LoginPageProps {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

export function LoginPage({setIsLoggedIn}:LoginPageProps) {
  const navigate = useNavigate();
  // 2. Extract exactly what this page needs from the hook
  const { 
    email, 
    setEmail, 
    otp, 
    setOtp, 
    isLoading, 
    sendOtp, 
    verifyOtp 
  } = useLoginHook();

  // 3. Keep purely visual/UI state local to the component
  const [step, setStep] = useState<'email' | 'otp'>('email');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Let the hook do the heavy lifting
    await sendOtp(); 
    
    // Move to the next step once the hook's API call succeeds
    setStep('otp');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;
    
    // Let the hook verify the code
    const res = await verifyOtp(); 
    
    // Trigger the success callback to change routes/views
    if(res)
        setIsLoggedIn(true);
    navigate('/workspaces');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute top-6 left-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={()=>navigate('/')}
          className="text-muted-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Button>
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-6">
            <div className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">
            {step === 'email' ? 'Welcome back' : 'Check your email'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {step === 'email'
              ? 'Enter your email to sign in to your account'
              : `We sent a 6-digit code to ${email}`}
          </p>
        </div>

        <Card className="border-border/50 shadow-xl shadow-black/5">
          <CardContent className="pt-6">
            {step === 'email' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Continue with Email
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="otp"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    One-time password
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="000000"
                      className="pl-9 font-mono tracking-widest"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                      }
                      required
                      autoFocus
                      maxLength={6}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || otp.length < 6}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Verify & Sign In
                </Button>
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Use a different email
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}