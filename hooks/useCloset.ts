import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ClosetItem, WishlistItem, PlannerEntry, UserProfile, DayOfWeek, ThriftItem } from '../types';

interface ClosetContextType {
  closetItems: ClosetItem[];
  thriftItems: ThriftItem[];
  wishlistItems: WishlistItem[];
  plannerEntries: Record<DayOfWeek, string[]>;
  userProfile: UserProfile;
  earnings: number;
  loading: boolean;
  addToCloset: (item: ClosetItem) => boolean;
  removeFromCloset: (id: string) => void;
  incrementWornCount: (id: string) => void;
  addThriftItem: (item: ThriftItem) => void;
  removeThriftItem: (id: string) => void;
  markAsSold: (id: string, price: number) => void;
  updateWishlist: (items: WishlistItem[]) => void;
  addToWishlist: (item: WishlistItem) => void;
  updatePlanner: (day: DayOfWeek, itemIds: string[]) => void;
  updateProfile: (profile: UserProfile) => void;
  getTotalValue: () => number;
  refreshItems: () => void;
}

const ClosetContext = createContext<ClosetContextType | undefined>(undefined);

export const ClosetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [closetItems, setClosetItems] = useState<ClosetItem[]>([]);
  const [thriftItems, setThriftItems] = useState<ThriftItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [plannerEntries, setPlannerEntries] = useState<Record<DayOfWeek, string[]>>({
    Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
  });
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Cherie',
    styleGoal: 'Coquette Minimalist',
    sizes: { top: 'S', bottom: '26', shoe: '7' }
  });
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    try {
      const storedCloset = localStorage.getItem('noir_closet');
      const storedThrift = localStorage.getItem('noir_thrift');
      const storedWishlist = localStorage.getItem('noir_wishlist');
      const storedPlanner = localStorage.getItem('noir_planner');
      const storedProfile = localStorage.getItem('noir_profile');
      const storedEarnings = localStorage.getItem('noir_earnings');
      
      if (storedCloset) {
        const parsed = JSON.parse(storedCloset);
        // Ensure migration for older items
        const migrated = parsed.map((item: any) => ({
          ...item,
          timesWorn: item.timesWorn || 0,
        }));
        setClosetItems(migrated);
      } else {
        setClosetItems([]);
      }

      if (storedThrift) {
        setThriftItems(JSON.parse(storedThrift));
      } else {
        setThriftItems([]);
      }

      if (storedWishlist) setWishlistItems(JSON.parse(storedWishlist));
      
      if (storedPlanner) setPlannerEntries(JSON.parse(storedPlanner));

      if (storedProfile) setUserProfile(JSON.parse(storedProfile));

      if (storedEarnings) setEarnings(parseFloat(storedEarnings));
      
      // Initialize default wishlist if empty
      if (!storedWishlist) {
        const defaults: WishlistItem[] = [
           { id: 'def-1', name: 'Camel Trench Coat', season: 'Autumn', isPurchased: false },
           { id: 'def-2', name: 'Cashmere Turtleneck', season: 'Winter', isPurchased: false },
           { id: 'def-3', name: 'Linen Wide Leg Trousers', season: 'Summer', isPurchased: false },
           { id: 'def-4', name: 'Structured Leather Tote', season: 'Year-Round', isPurchased: false },
        ];
        setWishlistItems(defaults);
        localStorage.setItem('noir_wishlist', JSON.stringify(defaults));
      }
    } catch (e) {
      console.error("Failed to load closet data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load from LocalStorage on mount
  useEffect(() => {
    loadData();
    // Listen for storage events (cross-tab sync)
    const handleStorageChange = () => loadData();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadData]);

  const addToCloset = (item: ClosetItem) => {
    try {
      const updated = [...closetItems, { ...item, timesWorn: 0 }];
      setClosetItems(updated);
      localStorage.setItem('noir_closet', JSON.stringify(updated));
      return true;
    } catch (e) {
      alert("Storage quota exceeded. Please delete some items.");
      return false;
    }
  };

  const removeFromCloset = (id: string) => {
    const updated = closetItems.filter(i => i.id !== id);
    setClosetItems(updated);
    localStorage.setItem('noir_closet', JSON.stringify(updated));
  };

  const incrementWornCount = (id: string) => {
    const updated = closetItems.map(item => {
      if (item.id === id) {
        return { ...item, timesWorn: (item.timesWorn || 0) + 1 };
      }
      return item;
    });
    setClosetItems(updated);
    localStorage.setItem('noir_closet', JSON.stringify(updated));
  };

  // Thrift Actions
  const addThriftItem = (item: ThriftItem) => {
    const updated = [item, ...thriftItems];
    setThriftItems(updated);
    localStorage.setItem('noir_thrift', JSON.stringify(updated));
  };

  const removeThriftItem = (id: string) => {
    const updated = thriftItems.filter(i => i.id !== id);
    setThriftItems(updated);
    localStorage.setItem('noir_thrift', JSON.stringify(updated));
  };

  const markAsSold = (id: string, price: number) => {
    // Remove from active listings
    removeThriftItem(id);
    // Add to earnings
    const newEarnings = earnings + price;
    setEarnings(newEarnings);
    localStorage.setItem('noir_earnings', newEarnings.toString());
  };

  const updateWishlist = (items: WishlistItem[]) => {
    setWishlistItems(items);
    localStorage.setItem('noir_wishlist', JSON.stringify(items));
  };

  const addToWishlist = (item: WishlistItem) => {
    const updated = [...wishlistItems, item];
    setWishlistItems(updated);
    localStorage.setItem('noir_wishlist', JSON.stringify(updated));
  };

  const updatePlanner = (day: DayOfWeek, itemIds: string[]) => {
    const updated = { ...plannerEntries, [day]: itemIds };
    setPlannerEntries(updated);
    localStorage.setItem('noir_planner', JSON.stringify(updated));
  };

  const updateProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('noir_profile', JSON.stringify(profile));
  }

  const getTotalValue = () => {
    return closetItems.reduce((sum, item) => sum + item.price, 0);
  };

  return React.createElement(ClosetContext.Provider, {
    value: {
      closetItems,
      thriftItems,
      wishlistItems,
      plannerEntries,
      userProfile,
      earnings,
      addToCloset,
      removeFromCloset,
      incrementWornCount,
      addThriftItem,
      removeThriftItem,
      markAsSold,
      updateWishlist,
      addToWishlist,
      updatePlanner,
      updateProfile,
      getTotalValue,
      loading,
      refreshItems: loadData
    }
  }, children);
};

export const useCloset = () => {
  const context = useContext(ClosetContext);
  if (context === undefined) {
    throw new Error('useCloset must be used within a ClosetProvider');
  }
  return context;
};
