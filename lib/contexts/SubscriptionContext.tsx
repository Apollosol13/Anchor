import React, { createContext, useContext, ReactNode } from 'react';

interface SubscriptionContextType {
  isSubscribed: boolean;
  subscriptionType: string | null;
  isLoading: boolean;
  availablePackages: any[];
  purchasePackage: (pkg: any) => Promise<{ success: boolean }>;
  restorePurchases: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  // Always return subscribed (premium features disabled for now)
  const isSubscribed = true;
  const subscriptionType = 'free';
  const isLoading = false;

  return (
    <SubscriptionContext.Provider
      value={{
        isSubscribed,
        subscriptionType,
        isLoading,
        availablePackages: [],
        purchasePackage: async () => ({ success: true }),
        restorePurchases: async () => {},
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
