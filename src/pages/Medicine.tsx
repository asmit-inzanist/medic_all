import { useState } from 'react';
import { Search, Filter, ShoppingCart, Star, MapPin, Truck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Medicine = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState(0);

  const medicines = [
    {
      id: 1,
      name: 'Paracetamol 500mg',
      category: 'Pain Relief',
      price: 12.99,
      originalPrice: 15.99,
      pharmacy: 'HealthPlus Pharmacy',
      rating: 4.8,
      reviews: 234,
      inStock: true,
      delivery: '30 mins',
      distance: '0.8 miles',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&h=150&fit=crop'
    },
    {
      id: 2,
      name: 'Vitamin D3 1000 IU',
      category: 'Vitamins',
      price: 24.99,
      originalPrice: 29.99,
      pharmacy: 'MediCare Plus',
      rating: 4.9,
      reviews: 456,
      inStock: true,
      delivery: '45 mins',
      distance: '1.2 miles',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=150&h=150&fit=crop'
    },
    {
      id: 3,
      name: 'Amoxicillin 250mg',
      category: 'Antibiotics',
      price: 18.50,
      originalPrice: 22.00,
      pharmacy: 'QuickMeds',
      rating: 4.7,
      reviews: 189,
      inStock: false,
      delivery: '2 hours',
      distance: '2.1 miles',
      image: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=150&h=150&fit=crop'
    },
    {
      id: 4,
      name: 'Ibuprofen 400mg',
      category: 'Pain Relief',
      price: 8.99,
      originalPrice: 10.99,
      pharmacy: 'HealthPlus Pharmacy',
      rating: 4.6,
      reviews: 321,
      inStock: true,
      delivery: '30 mins',
      distance: '0.8 miles',
      image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=150&h=150&fit=crop'
    }
  ];

  const categories = ['All', 'Pain Relief', 'Vitamins', 'Antibiotics', 'Heart Health', 'Diabetes', 'Cold & Flu'];

  const addToCart = (medicineId: number) => {
    setCartItems(cartItems + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Medicine Marketplace</h1>
          <p className="text-muted-foreground">Find and order medications from verified pharmacies near you</p>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search medicines, brands, or conditions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="md:col-span-2">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category.toLowerCase()}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="delivery">Fastest Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Button className="w-full">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Shopping Cart Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button size="lg" className="rounded-full shadow-lg relative">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Cart
            {cartItems > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0">
                {cartItems}
              </Badge>
            )}
          </Button>
        </div>

        {/* Medicine Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {medicines.map((medicine) => (
            <Card key={medicine.id} className="group hover:shadow-hover transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="aspect-square bg-gradient-card rounded-lg mb-3 overflow-hidden">
                  <img 
                    src={medicine.image} 
                    alt={medicine.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <Badge variant="secondary" className="w-fit text-xs">
                  {medicine.category}
                </Badge>
              </CardHeader>
              
              <CardContent className="pt-0">
                <CardTitle className="text-lg mb-2 line-clamp-2">
                  {medicine.name}
                </CardTitle>
                
                <div className="flex items-center mb-3">
                  <div className="flex items-center mr-3">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium">{medicine.rating}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({medicine.reviews})
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {medicine.pharmacy} • {medicine.distance}
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Truck className="h-4 w-4 mr-1" />
                    Delivery in {medicine.delivery}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-lg font-bold text-primary">
                      ${medicine.price}
                    </span>
                    {medicine.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through ml-2">
                        ${medicine.originalPrice}
                      </span>
                    )}
                  </div>
                  
                  <Badge 
                    variant={medicine.inStock ? "success" : "destructive"}
                    className="text-xs"
                  >
                    {medicine.inStock ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                </div>

                <Button 
                  className="w-full" 
                  disabled={!medicine.inStock}
                  onClick={() => addToCart(medicine.id)}
                >
                  {medicine.inStock ? 'Add to Cart' : 'Notify When Available'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center p-6">
            <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Quick Refill</h3>
            <p className="text-muted-foreground mb-4">Reorder your previous prescriptions with one click</p>
            <Button variant="outline">View History</Button>
          </Card>

          <Card className="text-center p-6">
            <Search className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Prescription</h3>
            <p className="text-muted-foreground mb-4">Upload your prescription and we'll find the medicines</p>
            <Button variant="outline">Upload Now</Button>
          </Card>

          <Card className="text-center p-6">
            <Truck className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Track Orders</h3>
            <p className="text-muted-foreground mb-4">Track your medicine deliveries in real-time</p>
            <Button variant="outline">Track Order</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Medicine;