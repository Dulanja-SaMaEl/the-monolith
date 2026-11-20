import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { portalStore, UserProfile } from '../lib/portalStore';

interface AuthContextType {
  user: UserProfile | null;
  role: 'admin' | 'client' | null;
  isAuthenticated: boolean;
  isLiveAuth: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: 'admin' | 'client' }>;
  loginDemo: (targetRole: 'admin' | 'client') => { success: boolean; role: 'admin' | 'client' };
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
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const [isLiveAuth, setIsLiveAuth] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setIsLiveAuth(true);
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            const metaRole = session.user.user_metadata?.role as 'admin' | 'client' | undefined;
            const u: UserProfile = {
              id: session.user.id,
              email: profile?.email || session.user.email || '',
              full_name: profile?.full_name || session.user.user_metadata?.full_name || 'Authenticated User',
              role: (profile?.role || metaRole || 'client') as 'admin' | 'client',
              company_name: profile?.company_name || session.user.user_metadata?.company_name || '',
              phone: profile?.phone,
              avatar_url: profile?.avatar_url,
            };
            setUser(u);
            localStorage.setItem('monolith_active_user', JSON.stringify(u));
          }
        } catch (err) {
          console.warn('Supabase session check skipped:', err);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; role?: 'admin' | 'client' }> => {
    setIsLoading(true);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          // If real Supabase auth failed (e.g. wrong password or user not seeded yet), surface clear message
          setIsLoading(false);
          return {
            success: false,
            error: `${error.message}. Please verify your credentials or contact administrator.`,
          };
        }

        if (data.user) {
          setIsLiveAuth(true);
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const metaRole = data.user.user_metadata?.role as 'admin' | 'client' | undefined;
          const activeProfile: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            full_name: profile?.full_name || data.user.user_metadata?.full_name || 'Authenticated User',
            role: (profile?.role || metaRole || 'client') as 'admin' | 'client',
            company_name: profile?.company_name || data.user.user_metadata?.company_name || 'Client Enterprise',
            phone: profile?.phone,
          };

          setUser(activeProfile);
          localStorage.setItem('monolith_active_user', JSON.stringify(activeProfile));
          setIsLoading(false);
          return { success: true, role: activeProfile.role };
        }
      } catch (e: any) {
        setIsLoading(false);
        return { success: false, error: e?.message || 'Supabase connection error.' };
      }
    }

    // Offline Demo Auth fallback when Supabase URL/key is not configured
    const users = portalStore.getUsers();
    const matched = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setIsLiveAuth(false);
      setUser(matched);
      localStorage.setItem('monolith_active_user', JSON.stringify(matched));
      setIsLoading(false);
      return { success: true, role: matched.role };
    }

    setIsLoading(false);
    return { success: false, error: 'Invalid credentials.' };
  };

  const loginDemo = (targetRole: 'admin' | 'client'): { success: boolean; role: 'admin' | 'client' } => {
    setIsLiveAuth(false);
    const users = portalStore.getUsers();
    const found = users.find((u) => u.role === targetRole) || users[0];
    setUser(found);
    localStorage.setItem('monolith_active_user', JSON.stringify(found));
    return { success: true, role: found.role };
  };

  const logout = async (): Promise<void> => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
    }
    setIsLiveAuth(false);
    setUser(null);
    localStorage.removeItem('monolith_active_user');
  };

  const switchDemoRole = (targetRole: 'admin' | 'client'): void => {
    loginDemo(targetRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: Boolean(user),
        isLiveAuth,
        isLoading,
        login,
        loginDemo,
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
