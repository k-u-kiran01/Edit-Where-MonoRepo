import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../lib/apiClient";
export function useLoginHook() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authView, setAuthView] = useState<'landing' | 'login'>('landing');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true); // ⚡ New!
  const backend_url = import.meta.env.VITE_BACKEND_URL;
  // 1. Automatically check for a valid cookie on load
  const checkSession = useCallback(async () => {
    setIsCheckingSession(true);
    try {
      const data = await apiClient('/auth/me')

      if (data) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Session check failed:", error);
      setIsLoggedIn(false);
    } finally {
      setIsCheckingSession(false);
    }
  }, [backend_url]);

  // Fire the check exactly once when the app mounts
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // 2. Login Actions
  const sendOtp = async () => {
    if (!email) return;
    setIsLoading(true);
    try {
      const data = await apiClient('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) return null;
    setIsLoading(true);
    try {
      const data = await apiClient('/auth/validate-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })
      setIsLoggedIn(true); 
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setIsLoading(false);
      return true;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient('/auth/logout',{
        method : 'POST'
      })
    } catch (error) {
      console.error("Failed to logout:", error);
    } finally {
      setIsLoggedIn(false);
      setAuthView('landing');
      setEmail('');
      setOtp('');
      setIsLoading(false);
    }
  };

  return { 
    isLoggedIn, 
    isCheckingSession, // Export this so App.tsx can use it!
    authView, 
    setAuthView, 
    email, 
    setEmail, 
    otp, 
    setOtp,
    sendOtp,
    verifyOtp,
    logout,
    isLoading,
    setIsLoggedIn
  };
}