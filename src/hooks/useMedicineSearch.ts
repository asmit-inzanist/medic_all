import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('category')
        .order('category');

      if (error) throw error;

      const uniqueCategories = [...new Set(data.map(item => item.category))];
      setCategories(['All', ...uniqueCategories]);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
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
    if (!userLocation) {
      // If no location, show all medicines
      setIsLoading(true);
      try {
        let query = supabase
          .from('pharmacy_inventory')
          .select(`
            id,
            price,
            original_price,
            stock_quantity,
            is_available,
            medicines!inner (
              id,
              name,
              brand,
              category,
              strength,
              form,
              manufacturer,
              requires_prescription
            ),
            pharmacies!inner (
              name,
              address,
              rating,
              total_reviews,
              delivery_time,
              phone,
              latitude,
              longitude
            )
          `)
          .eq('is_available', true);

        // Apply search filter
        if (searchTerm) {
          query = query.or(
            `medicines.name.ilike.%${searchTerm}%,medicines.brand.ilike.%${searchTerm}%,medicines.category.ilike.%${searchTerm}%`,
          );
        }

        // Apply category filter
        if (category !== 'all') {
          query = query.eq('medicines.category', category);
        }

        const { data, error } = await query;

        if (error) throw error;

        const results: MedicineSearchResult[] = data.map((item: any) => ({
          id: item.medicines.id,
          name: item.medicines.name,
          brand: item.medicines.brand,
          category: item.medicines.category,
          strength: item.medicines.strength,
          form: item.medicines.form,
          manufacturer: item.medicines.manufacturer,
          requires_prescription: item.medicines.requires_prescription,
          pharmacy_name: item.pharmacies.name,
          pharmacy_address: item.pharmacies.address,
          pharmacy_rating: parseFloat(item.pharmacies.rating),
          pharmacy_reviews: item.pharmacies.total_reviews,
          pharmacy_delivery_time: item.pharmacies.delivery_time,
          pharmacy_phone: item.pharmacies.phone,
          price: parseFloat(item.price),
          original_price: parseFloat(item.original_price),
          stock_quantity: item.stock_quantity,
          is_available: item.is_available,
        }));

        setMedicines(results);
      } catch (err) {
        console.error('Error searching medicines:', err);
        setError('Failed to search medicines');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First, get all pharmacies with their distances
      const { data: pharmacyData, error: pharmacyError } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('is_active', true);

      if (pharmacyError) throw pharmacyError;

      // Calculate distances and filter by maxDistance
      const nearbyPharmacies = pharmacyData
        .map(pharmacy => ({
          ...pharmacy,
          distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            parseFloat(pharmacy.latitude.toString()),
            parseFloat(pharmacy.longitude.toString())
          )
        }))
        .filter(pharmacy => pharmacy.distance <= maxDistance)
        .sort((a, b) => a.distance - b.distance);

      if (nearbyPharmacies.length === 0) {
        setMedicines([]);
        setIsLoading(false);
        return;
      }

      const nearbyPharmacyIds = nearbyPharmacies.map(p => p.id);

      // Now search for medicines in nearby pharmacies
      let query = supabase
        .from('pharmacy_inventory')
        .select(`
          id,
          price,
          original_price,
          stock_quantity,
          is_available,
          pharmacy_id,
          medicines!inner (
            id,
            name,
            brand,
            category,
            strength,
            form,
            manufacturer,
            requires_prescription
          ),
          pharmacies!inner (
            name,
            address,
            rating,
            total_reviews,
            delivery_time,
            phone,
            latitude,
            longitude
          )
        `)
        .eq('is_available', true)
        .in('pharmacy_id', nearbyPharmacyIds);

      // Apply search filter
      if (searchTerm) {
        query = query.or(
          `medicines.name.ilike.%${searchTerm}%,medicines.brand.ilike.%${searchTerm}%,medicines.category.ilike.%${searchTerm}%`,
        );
      }

      // Apply category filter
      if (category !== 'all') {
        query = query.eq('medicines.category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Map results and add distance information
      const results: MedicineSearchResult[] = data.map((item: any) => {
        const pharmacy = nearbyPharmacies.find(p => p.id === item.pharmacy_id);
        return {
          id: item.medicines.id,
          name: item.medicines.name,
          brand: item.medicines.brand,
          category: item.medicines.category,
          strength: item.medicines.strength,
          form: item.medicines.form,
          manufacturer: item.medicines.manufacturer,
          requires_prescription: item.medicines.requires_prescription,
          pharmacy_name: item.pharmacies.name,
          pharmacy_address: item.pharmacies.address,
          pharmacy_rating: parseFloat(item.pharmacies.rating),
          pharmacy_reviews: item.pharmacies.total_reviews,
          pharmacy_delivery_time: item.pharmacies.delivery_time,
          pharmacy_phone: item.pharmacies.phone,
          price: parseFloat(item.price),
          original_price: parseFloat(item.original_price),
          stock_quantity: item.stock_quantity,
          is_available: item.is_available,
          distance: pharmacy?.distance || 0,
        };
      });

      // Sort results
      const sortedResults = [...results].sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
          case 'rating':
            return b.pharmacy_rating - a.pharmacy_rating;
          case 'delivery':
            return a.pharmacy_delivery_time.localeCompare(b.pharmacy_delivery_time);
          case 'distance':
          default:
            return (a.distance || 0) - (b.distance || 0);
        }
      });

      setMedicines(sortedResults);
    } catch (err) {
      console.error('Error searching medicines:', err);
      setError('Failed to search medicines');
    } finally {
      setIsLoading(false);
    }
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