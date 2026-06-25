import { createContext, useContext, useState,useRef } from 'react';
import type { ReactNode } from 'react';

// Define types
export interface User {
  role: string;
  email: string;
  name: string;
  profile_picture_url: string;
}

export interface Shop {
  id: number;
  name: string;
}

interface UserContextType {
  userInfo: User | null;
  shop: Shop | null;
  login: (userData: User, shopData: Shop | null) => void;
  logout: () => void;
  updateUser: (newUserData: Partial<User>) => void;
  updateShop: (newShopData: Partial<Shop>) => void;
  isInitialized: boolean;
  setIsInitialized: React.Dispatch<React.SetStateAction<boolean>>; 
}

// Create Context
const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [userInfo, setUser] = useState<User | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const login = (userData: User, shopData: Shop | null = null) => {
    setUser(userData);
    setShop(shopData);
  };

  const logout = () => {
    setUser(null);
    setShop(null);
  };

  const updateUser = (newUserData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...newUserData } : null);
  };

  const updateShop = (newShopData: Partial<Shop>) => {
    setShop(prev => prev ? { ...prev, ...newShopData } : null);
  };

  return (
    <UserContext.Provider
      value={{
        userInfo,
        shop,
        login,
        logout,
        updateUser,
        updateShop,
        isInitialized,
        setIsInitialized,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom Hook
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  return context;
};