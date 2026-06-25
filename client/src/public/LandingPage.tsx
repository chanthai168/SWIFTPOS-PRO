// App.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Zap, 
  Shield, 
  Users, 
  ChevronRight, 
  Star, 
  Menu, 
  X,
  CheckCircle,
  Smartphone,
  Cloud,
  Headphones,
  ArrowRight,
  CreditCard,
  QrCode,
  RefreshCw
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { loginWithRedirect } = useAuth0();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-white py-5'
      }`}>
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-red-400 rounded-xl p-1.5">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
              SWIfTPOS
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-indigo-600 transition-colors">Features</a>
            <a href="#testimonials" className="text-gray-600 hover:text-indigo-600 transition-colors">Testimonials</a>
            <a href="#pricing" className="text-gray-600 hover:text-indigo-600 transition-colors">Pricing</a>
            <button onClick={() => loginWithRedirect()} className="px-5 py-2 text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors">
              Sign in
            </button>
            <button onClick={() => loginWithRedirect({authorizationParams:{screen_hint:'signup'}})} className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
              Sign up
            </button>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b shadow-lg py-4 px-4 flex flex-col gap-3">
            <a href="#features" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#testimonials" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>Testimonials</a>
            <a href="#pricing" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>Pricing</a>
            <hr className="my-2" />
            <button className="px-4 py-2 text-indigo-600 font-medium text-left hover:bg-indigo-50 rounded-lg">Sign In</button>
            <button className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700">Start Free Trial</button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-4 md:px-6 overflow-hidden">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-indigo-50 rounded-full px-3 py-1 mb-6">
                <Zap className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-600">Trusted by 10,000+ businesses</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Manage Something & 
                <span className="bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent"> POS</span>
                <br />All in Many Place
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Streamline your retail operations with our all-in-one inventory management and point of sale system. Start selling smarter today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button className="px-8 py-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                  Start 14-Day Free Trial
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
                  Watch Demo
                </button>
              </div>
              <div className="flex items-center gap-6 justify-center lg:justify-start mt-8">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center">
                      <Users className="w-5 h-5 text-indigo-600" />
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">No credit card</span> required
                </div>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-3xl blur-3xl opacity-30"></div>
                <div className="relative bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="bg-gray-800 px-4 py-3 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="text-xs text-gray-400 ml-2">StockFlow Dashboard</div>
                  </div>
                  <img 
                    src="../../public/image.png" 
                    alt="Dashboard Preview"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to run your business
            </h2>
            <p className="text-lg text-gray-600">
              Powerful features that help you manage inventory, process sales, and grow your business.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 md:px-6 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why smart businesses choose StockFlow
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{benefit.title}</h4>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-gray-600">Rated 4.9/5 by 2,000+ users</span>
                </div>
                <div className="space-y-4">
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                      <p className="text-gray-600 italic">"{testimonial.text}"</p>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">{testimonial.name[0]}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{testimonial.name}</div>
                          <div className="text-sm text-gray-500">{testimonial.role}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 md:px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-600">
              Choose the plan that's right for your business. All plans include a 14-day free trial.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`rounded-2xl p-8 ${
                plan.popular 
                  ? 'bg-red-500 text-white shadow-xl scale-105 md:scale-105' 
                  : 'bg-gray-50 border border-gray-200'
              }`}>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className={plan.popular ? 'text-indigo-200' : 'text-gray-500'}>/month</span>
                </div>
                <p className={`mb-6 ${plan.popular ? 'text-indigo-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                <button className={`w-full py-3 rounded-lg font-semibold mb-8 transition-all ${
                  plan.popular
                    ? 'bg-white text-indigo-600 hover:bg-gray-100'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}>
                  Start Free Trial
                </button>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className={`w-5 h-5 ${plan.popular ? 'text-indigo-200' : 'text-indigo-600'}`} />
                      <span className={plan.popular ? 'text-indigo-50' : 'text-gray-600'}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-400 to-red-500 px-4 md:px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to transform your business?
          </h2>
          <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of small business owners who trust StockFlow to manage their inventory and sales.
          </p>
          <button className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2">
            Start Your Free Trial Today
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-indigo-200 text-sm mt-4">No credit card required · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-indigo-600 rounded-xl p-1.5">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">StockFlow</span>
              </div>
              <p className="text-sm">The all-in-one inventory and POS solution for small businesses.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 StockFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Data Arrays
const features = [
  { icon: <Package className="w-6 h-6 text-indigo-600" />, title: "Inventory Management", description: "Track stock levels, set low stock alerts, and manage multiple locations from one dashboard." },
  { icon: <ShoppingCart className="w-6 h-6 text-indigo-600" />, title: "Point of Sale", description: "Fast, intuitive POS system that works online or offline. Accept all payment types." },
  { icon: <BarChart3 className="w-6 h-6 text-indigo-600" />, title: "Analytics & Reports", description: "Get insights into sales trends, best-selling products, and business performance." },
  { icon: <Smartphone className="w-6 h-6 text-indigo-600" />, title: "Mobile App", description: "Manage your business from anywhere with our iOS and Android apps." },
  { icon: <Users className="w-6 h-6 text-indigo-600" />, title: "Multi-User Access", description: "Add unlimited team members with role-based permissions." },
  { icon: <Cloud className="w-6 h-6 text-indigo-600" />, title: "Cloud Sync", description: "Real-time synchronization across all devices and locations." },
];

const stats = [
  { value: "10,000+", label: "Active Businesses" },
  { value: "50M+", label: "Transactions Processed" },
  { value: "99.9%", label: "Uptime Guarantee" },
  { value: "24/7", label: "Customer Support" },
];

const benefits = [
  { title: "Save time with automation", description: "Automate stock updates, purchase orders, and low stock alerts." },
  { title: "Reduce human error", description: "Barcode scanning and real-time inventory tracking eliminates mistakes." },
  { title: "Increase sales", description: "Upsell products and manage promotions directly from your POS." },
];

const testimonials = [
  { name: "Sarah Johnson", role: "Owner, Boutique Store", text: "StockFlow transformed how we manage inventory. We've reduced stockouts by 90%!" },
  { name: "Mike Chen", role: "Manager, Coffee Shop", text: "The POS is incredibly fast and the reporting features are a game changer." },
];

const pricingPlans = [
  { name: "Starter", price: 9.99, description: "Perfect for small businesses just getting started.", features: ["Up to 500 products", "Basic reporting", "Email support", "Single location"], popular: false },
  { name: "Professional", price: 59, description: "Most popular for growing businesses.", features: ["Unlimited products", "Advanced analytics", "Priority support", "Multi-location sync", "API access"], popular: true },
  { name: "Enterprise", price: 159, description: "For large businesses with complex needs.", features: ["Custom integrations", "Dedicated account manager", "24/7 phone support", "Custom training", "SLA guarantee"], popular: false },
];

export default LandingPage;