'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export interface GoogleUser {
  _id: string;
  fullName: string;
  email: string;
  imageUrl?: string;
  phone?: string;
  linkedIn?: string;
  github?: string;
  portfolioUrl?: string;
  address?: string;
  dateOfBirth?: string;
  about?: string;
  skills?: string[];
  experience?: string[];
  education?: Array<{ institution: string; degree?: string; startDate?: string; endDate?: string; details?: string }>;
  projects?: Array<{ title: string; description: string; link?: string; technologies?: string[] }>;
}

interface GoogleAuthContextType {
  user: GoogleUser | null;
  loading: boolean;
  loginError: string | null;
  logout: () => void;
  renderGoogleButton: (elementId: string) => void;
  triggerGoogleOneTap: () => void;
  mockLogin: (username: string) => Promise<void>;
}

const GoogleAuthContext = createContext<GoogleAuthContextType | undefined>(undefined);

const loadGoogleScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).google) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
};

export const GoogleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);

  useEffect(() => {
    const initGsi = async () => {
      const loaded = await loadGoogleScript();
      setScriptLoaded(loaded);

      // Retrieve persistent user from localStorage if available
      const savedUser = localStorage.getItem('cvfolio_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.removeItem('cvfolio_user');
        }
      }
      setLoading(false);
    };
    initGsi();
  }, []);

  const handleCredentialResponse = async (response: any) => {
    setLoading(true);
    setLoginError(null);
    try {
      const res = await authAPI.googleLogin(response.credential);
      const authenticatedUser = res.data.user;
      setUser(authenticatedUser);
      localStorage.setItem('cvfolio_user', JSON.stringify(authenticatedUser));
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setLoginError(err.response?.data?.error || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const renderGoogleButton = (elementId: string) => {
    if (typeof window === 'undefined' || !(window as any).google) return;

    // Use environment variable or fallback to a mock client ID for testing
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1048556942006-mock-client-id.apps.googleusercontent.com';

    (window as any).google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      auto_select: false,
    });

    const element = document.getElementById(elementId);
    if (element) {
      (window as any).google.accounts.id.renderButton(element, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        logo_alignment: 'left',
      });
    }
  };

  const triggerGoogleOneTap = () => {
    if (typeof window === 'undefined' || !(window as any).google || user) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return; // Only trigger one tap if a real Client ID is provided

    (window as any).google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
    });
    (window as any).google.accounts.id.prompt();
  };

  const mockLogin = async (username: string) => {
    setLoading(true);
    setLoginError(null);
    try {
      const mockToken = `mock-google-token-${username.toLowerCase().replace(/\s+/g, '-')}`;
      const res = await authAPI.googleLogin(mockToken);
      const authenticatedUser = res.data.user;
      setUser(authenticatedUser);
      localStorage.setItem('cvfolio_user', JSON.stringify(authenticatedUser));
    } catch (err: any) {
      console.error('Mock Sign-In Error:', err);
      setLoginError('Mock login failed.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cvfolio_user');
  };

  return (
    <GoogleAuthContext.Provider
      value={{
        user,
        loading,
        loginError,
        logout,
        renderGoogleButton,
        triggerGoogleOneTap,
        mockLogin,
      }}
    >
      {children}
    </GoogleAuthContext.Provider>
  );
};

export const useGoogleAuth = () => {
  const context = useContext(GoogleAuthContext);
  if (context === undefined) {
    throw new Error('useGoogleAuth must be used within a GoogleAuthProvider');
  }
  return context;
};
