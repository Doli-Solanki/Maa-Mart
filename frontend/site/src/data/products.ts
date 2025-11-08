import { Product } from '@/types';

export const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Organic Tomatoes',
    price: 4.99,
    originalPrice: 6.99,
    image: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg',
    category: 'Fresh Vegetables',
    categoryId: 'fresh-vegetables',
    rating: 4.8,
    reviews: 124,
    inStock: true,
    featured: true,
    description: 'Fresh, organic tomatoes grown locally'
  },
  {
    id: '2',
    name: 'Red Apples',
    price: 3.49,
    image: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg',
    category: 'Fruits',
    categoryId: 'fruits',
    rating: 4.6,
    reviews: 89,
    inStock: true,
    featured: true,
    description: 'Crisp and sweet red apples'
  },
  {
    id: '3',
    name: 'Basmati Rice',
    price: 12.99,
    image: 'https://images.pexels.com/photos/4022086/pexels-photo-4022086.jpeg',
    category: 'Grains & Cereals',
    categoryId: 'grains-cereals',
    rating: 4.9,
    reviews: 156,
    inStock: true,
    description: 'Premium quality basmati rice'
  },
  {
    id: '4',
    name: 'Gold Necklace',
    price: 299.99,
    originalPrice: 399.99,
    image: 'https://images.pexels.com/photos/1927574/pexels-photo-1927574.jpeg',
    category: 'Jewellery',
    categoryId: 'jewellery',
    rating: 4.7,
    reviews: 45,
    inStock: true,
    featured: true,
    description: 'Elegant gold-plated necklace'
  },
  {
    id: '5',
    name: 'Fresh Bananas',
    price: 2.99,
    image: 'https://images.pexels.com/photos/2238309/pexels-photo-2238309.jpeg',
    category: 'Fruits',
    categoryId: 'fruits',
    rating: 4.5,
    reviews: 67,
    inStock: true,
    description: 'Ripe yellow bananas'
  },
  {
    id: '6',
    name: 'LED String Lights',
    price: 15.99,
    image: 'https://images.pexels.com/photos/2363/lights-party-dancing-music.jpg',
    category: 'Festival Items',
    categoryId: 'festival-items',
    rating: 4.4,
    reviews: 78,
    inStock: true,
    description: 'Colorful LED lights for celebrations'
  },
  {
    id: '7',
    name: 'Tool Kit Set',
    price: 49.99,
    image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg',
    category: 'Household Hardware',
    categoryId: 'household-hardware',
    rating: 4.6,
    reviews: 92,
    inStock: true,
    description: 'Complete household tool kit'
  },
  {
    id: '8',
    name: 'Organic Pasta',
    price: 5.49,
    image: 'https://images.pexels.com/photos/1527603/pexels-photo-1527603.jpeg',
    category: 'Grocery Items',
    categoryId: 'grocery-items',
    rating: 4.3,
    reviews: 134,
    inStock: true,
    description: 'Whole wheat organic pasta'
  }
];