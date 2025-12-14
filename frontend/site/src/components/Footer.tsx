import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">EcoMart</h1>
                <p className="text-xs text-gray-400">Premium Shopping</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Your trusted destination for fresh vegetables, fruits, groceries, jewelry, and more. 
              Quality products at unbeatable prices.
            </p>
            <div className="flex space-x-4">
              <Button size="sm" variant="ghost" className="w-10 h-10 p-0">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button size="sm" variant="ghost" className="w-10 h-10 p-0">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button size="sm" variant="ghost" className="w-10 h-10 p-0">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button size="sm" variant="ghost" className="w-10 h-10 p-0">
                <Youtube className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Contact</a></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">FAQ</a></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Shipping Info</a></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Returns</a></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Categories</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Fresh Vegetables</a></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Fruits</a></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Grocery Items</a></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Jewellery</a></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Grains & Cereals</a></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Festival Items</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-emerald-400 mt-0.5" />
                <span className="text-gray-300">123 Commerce St, Business District, NY 10001</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-300">support@ecomart.com</span>
              </li>
            </ul>

            <div className="mt-6">
              <h4 className="font-medium mb-2">Newsletter</h4>
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                />
                <Button className="bg-emerald-600 hover:bg-emerald-700 px-6">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-800" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-400 text-sm">
            © 2024 EcoMart. All rights reserved. Designed with ❤️ for premium shopping experience.
          </p>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}