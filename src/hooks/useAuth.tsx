import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'listing_editor' | 'agent' | 'user';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  roles: AppRole[];
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = roles.includes('admin');

  const fetchUserRoles = async (userId: string): Promise<AppRole[]> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      return (data || []).map(r => r.role as AppRole);
    } catch (err) {
      console.error('Error fetching user roles:', err);
      return [];
    }
  };

  useEffect(() => {
    let isMounted = true;

    const refreshRoles = async (userId: string) => {
      const userRoles = await fetchUserRoles(userId);
      if (isMounted) setRoles(userRoles);
    };

    // Listener for ONGOING auth changes (does NOT control isLoading)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        // Fire-and-forget; avoid blocking UI and avoid toggling global loading state.
        void refreshRoles(nextSession.user.id);
      } else {
        setRoles([]);
      }
    });

    // INITIAL load (controls isLoading) — wait for role check before marking ready
    const initializeAuth = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          await refreshRoles(initialSession.user.id);
        } else {
          setRoles([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    // If sign-in succeeded, wait for the role check so roles are set before returning
    if (!error && data.user) {
      const userRoles = await fetchUserRoles(data.user.id);
      setUser(data.user);
      setSession(data.session);
      setRoles(userRoles);
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRoles([]);
  };

  const hasRole = (role: AppRole) => roles.includes(role);
  const hasAnyRole = (checkRoles: AppRole[]) => checkRoles.some(r => roles.includes(r));

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isAdmin, 
      roles, 
      isLoading, 
      signIn, 
      signUp, 
      signOut,
      hasRole,
      hasAnyRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
