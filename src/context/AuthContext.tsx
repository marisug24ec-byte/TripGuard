// TripGuard AI - Authentication Context (Supabase Auth + Demo Mode)
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabaseManager } from '../services/supabaseClient';
import { storageService } from '../services/storageService';

interface AuthContextType {
  user: UserProfile | null;
  isDemoMode: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  toggleDemoMode: (enabled: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(storageService.isDemoMode());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    initAuth();
  }, [isDemoMode]);

  const initAuth = async () => {
    setIsLoading(true);
    const client = supabaseManager.getClient();

    if (client && !isDemoMode) {
      try {
        const { data: { session } } = await client.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Traveler',
            email: session.user.email || '',
            created_at: session.user.created_at,
          });
        } else {
          // If no active session in Supabase, provide guest/demo user
          setUser(storageService.getCurrentUser());
        }
      } catch (err) {
        console.warn('[AuthContext] Session retrieval error, falling back to local demo profile:', err);
        setUser(storageService.getCurrentUser());
      }
    } else {
      // Local demo mode
      setUser(storageService.getCurrentUser());
    }
    setIsLoading(false);
  };

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const client = supabaseManager.getClient();
    if (client && !isDemoMode && password) {
      try {
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            name: data.user.user_metadata?.name || email.split('@')[0],
            email: data.user.email || email,
            created_at: data.user.created_at,
          };
          setUser(profile);
          storageService.setCurrentUser(profile);
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    // Demo / Offline login simulation
    const profile: UserProfile = {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0].replace('.', ' '),
      email,
      created_at: new Date().toISOString(),
    };
    setUser(profile);
    storageService.setCurrentUser(profile);
    return { success: true };
  };

  const register = async (name: string, email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const client = supabaseManager.getClient();
    if (client && !isDemoMode && password) {
      try {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            name,
            email,
            created_at: data.user.created_at,
          };
          setUser(profile);
          storageService.setCurrentUser(profile);
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    // Demo register
    const profile: UserProfile = {
      id: `usr_${Date.now()}`,
      name,
      email,
      created_at: new Date().toISOString(),
    };
    setUser(profile);
    storageService.setCurrentUser(profile);
    return { success: true };
  };

  const logout = async () => {
    const client = supabaseManager.getClient();
    if (client && !isDemoMode) {
      try {
        await client.auth.signOut();
      } catch (e) {}
    }
    const defaultUser = storageService.getCurrentUser();
    setUser(defaultUser);
  };

  const toggleDemoMode = (enabled: boolean) => {
    storageService.setDemoMode(enabled);
    setIsDemoMode(enabled);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isDemoMode,
        isLoading,
        login,
        register,
        logout,
        toggleDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
