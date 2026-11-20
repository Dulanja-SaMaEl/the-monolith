import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { portalStore, UserProfile } from '../lib/portalStore';

interface AuthContextType {
  user: UserProfile | null;
  role: 'admin' | 'client' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; role?: 'admin' | 'client' }>;
  logout: () => Promise<void>;
  switchDemoRole: (targetRole: 'admin' | 'client') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('monolith_active_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              const u: UserProfile = {
                id: profile.id,
                email: profile.email,
                full_name: profile.full_name,
                role: profile.role,
                company_name: profile.company_name,
                phone: profile.phone,
                avatar_url: profile.avatar_url,
              };
              setUser(u);
              localStorage.setItem('monolith_active_user', JSON.stringify(u));
            }
          }
        } catch (err) {
          console.warn('Supabase session fetch bypassed:', err);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (
    email: string,
    password = ''
  ): Promise<{ success: boolean; error?: string; role?: 'admin' | 'client' }> => {
    setIsLoading(true);

    // 1. Try Supabase Auth if online and configured
    if (isSupabaseConfigured && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const activeProfile: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            full_name: profile?.full_name || 'Authenticated User',
            role: profile?.role || 'client',
            company_name: profile?.company_name || 'Client Enterprise',
            phone: profile?.phone,
          };

          setUser(activeProfile);
          localStorage.setItem('monolith_active_user', JSON.stringify(activeProfile));
          setIsLoading(false);
          return { success: true, role: activeProfile.role };
        }
      } catch (e) {
        console.warn('Supabase auth failed, trying local fallback:', e);
      }
    }

    // 2. Local Fallback Demo Auth
    const users = portalStore.getUsers();
    const matched = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (matched) {
      setUser(matched);
      localStorage.setItem('monolith_active_user', JSON.stringify(matched));
      setIsLoading(false);
      return { success: true, role: matched.role };
    }

    // If typing any client-like email, auto-create demo client
    if (email.includes('@')) {
      const isCompanyAdmin = email.includes('admin') || email.includes('monolith.lk');
      const newUser = portalStore.addUser({
        email,
        full_name: email.split('@')[0].toUpperCase(),
        role: isCompanyAdmin ? 'admin' : 'client',
        company_name: isCompanyAdmin ? 'Monolith LK Executive Cluster' : 'Enterprise Partner Client',
      });
      setUser(newUser);
      localStorage.setItem('monolith_active_user', JSON.stringify(newUser));
      setIsLoading(false);
      return { success: true, role: newUser.role };
    }

    setIsLoading(false);
    return { success: false, error: 'Invalid credentials. Please enter a valid email address.' };
  };

  const logout = async (): Promise<void> => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
    }
    setUser(null);
    localStorage.removeItem('monolith_active_user');
  };

  const switchDemoRole = (targetRole: 'admin' | 'client'): void => {
    const users = portalStore.getUsers();
    const found = users.find((u) => u.role === targetRole);
    if (found) {
      setUser(found);
      localStorage.setItem('monolith_active_user', JSON.stringify(found));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
