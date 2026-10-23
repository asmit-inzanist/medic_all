import { useState, useEffect, useCallback } from 'react';
// Note: Medicine search temporarily disabled - tables don't exist in current schema

interface MedicineSearchResult {
  id: string;
  name: string;
  brand: string;
  category: string;
  strength: string;
  form: string;
  manufacturer: string;
  requires_prescription: boolean;
  pharmacy_name: string;
  pharmacy_address: string;
  pharmacy_rating: number;
  pharmacy_reviews: number;
  pharmacy_delivery_time: string;
  pharmacy_phone: string;
  price: number;
  original_price: number;
  stock_quantity: number;
  is_available: boolean;
  distance?: number;
}

interface UseMedicineSearchOptions {
  searchTerm?: string;
  category?: string;
  sortBy?: 'price-low' | 'price-high' | 'rating' | 'delivery' | 'distance';
  userLocation?: { latitude: number; longitude: number } | null;
  maxDistance?: number; // in kilometers
}

export const useMedicineSearch = (options: UseMedicineSearchOptions = {}) => {
  const [medicines, setMedicines] = useState<MedicineSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const {
    searchTerm = '',
    category = 'all',
    sortBy = 'distance',
    userLocation,
    maxDistance = 10
  } = options;

  // Fetch available categories
  const fetchCategories = useCallback(async () => {
    // Temporarily disabled - medicine tables don't exist in current schema
    setCategories(['All', 'Pain Relief', 'Antibiotics', 'Vitamins', 'Cold & Flu']);
  }, []);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Search medicines based on location and filters
  const searchMedicines = useCallback(async () => {
    setIsLoading(true);
    // Temporarily disabled - medicine tables don't exist in current schema
    // Return mock data for now
    setTimeout(() => {
      setMedicines([]);
      setIsLoading(false);
    }, 500);
  }, [searchTerm, category, sortBy, userLocation, maxDistance]);

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Search medicines when options change
  useEffect(() => {
    searchMedicines();
  }, [searchMedicines]);

  return {
    medicines,
    isLoading,
    error,
    categories,
    searchMedicines,
  };
};