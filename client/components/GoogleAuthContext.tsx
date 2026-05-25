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
  googleClientId: string | null;
  updateClientId: (newClientId: string | null) => void;
  hasClientId: boolean;
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
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);

  useEffect(() => {
    const initGsi = async () => {
      const loaded = await loadGoogleScript();
      setScriptLoaded(loaded);

      if (typeof window !== 'undefined') {
        setGoogleClientId(localStorage.getItem('cvfolio_google_client_id'));
      }

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
      const activeClientId = googleClientId || (typeof window !== 'undefined' ? localStorage.getItem('cvfolio_google_client_id') : null) || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || undefined;
      const res = await authAPI.googleLogin(response.credential, activeClientId);
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

    // Use dynamic client ID or environment variable or fallback to a mock client ID for testing
    const clientId = googleClientId || (typeof window !== 'undefined' ? localStorage.getItem('cvfolio_google_client_id') : null) || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1048556942006-mock-client-id.apps.googleusercontent.com';

    (window as any).google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      auto_select: false,
    });

    const element = document.getElementById(elementId);
    if (element) {
      // Clear any existing children to prevent multiple buttons rendering on re-initialization
      element.innerHTML = '';
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

    const clientId = googleClientId || (typeof window !== 'undefined' ? localStorage.getItem('cvfolio_google_client_id') : null) || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
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
      const activeClientId = googleClientId || (typeof window !== 'undefined' ? localStorage.getItem('cvfolio_google_client_id') : null) || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || undefined;
      const res = await authAPI.googleLogin(mockToken, activeClientId);
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

  const updateClientId = (newClientId: string | null) => {
    if (typeof window !== 'undefined') {
      if (newClientId && newClientId.trim()) {
        localStorage.setItem('cvfolio_google_client_id', newClientId.trim());
        setGoogleClientId(newClientId.trim());
      } else {
        localStorage.removeItem('cvfolio_google_client_id');
        setGoogleClientId(null);
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cvfolio_user');
  };

  const activeClientId = googleClientId || (typeof window !== 'undefined' ? localStorage.getItem('cvfolio_google_client_id') : null) || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const hasClientId = !!activeClientId && activeClientId !== '1048556942006-mock-client-id.apps.googleusercontent.com';

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
        googleClientId,
        updateClientId,
        hasClientId,
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
