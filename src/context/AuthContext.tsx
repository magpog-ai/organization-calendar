import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { auth, db } from '../firebase/config';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  user: { username: string } | null;
  authLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This function checks Firestore to see if a user has admin privileges
const checkAdminStatus = async (email: string | null): Promise<boolean> => {
  if (!email) return false;
  
  try {
    console.log(`Checking admin status for ${email}...`);
    // Check the 'admins' collection in Firestore to see if this email is listed
    const adminRef = await db.collection('admins').doc(email).get();
    
    console.log(`Admin check result for ${email}:`, adminRef.exists);
    
    // If the document exists, this user is an admin
    return adminRef.exists;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: any) => {
      setAuthLoading(true);
      if (firebaseUser) {
        const email = firebaseUser.email;
        console.log(`User authenticated: ${email}`);
        
        // Check if user is an admin from Firestore
        const adminStatus = await checkAdminStatus(email);
        console.log(`Admin status for ${email}: ${adminStatus}`);
        
        setIsAuthenticated(true);
        setIsAdmin(adminStatus);
        setUser({ 
          username: email?.split('@')[0] || 'user' 
        });
      } else {
        console.log('No user authenticated');
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await auth.signInWithEmailAndPassword(email, password);
      console.log(`Login successful for ${email}`);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      console.log('User logged out');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isAdmin, 
      login, 
      logout, 
      user, 
      authLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 