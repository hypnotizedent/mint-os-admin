/**
 * Customer Landing Page
 * Modern Vercel/Linear inspired design
 * Public entry point for customers
 * Routes: / (root)
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { 
  Clock, 
  ShieldCheck, 
  Palette,
  Printer, 
  ArrowRight,
  Package,
  Truck,
  Sparkles,
  Star,
  ChevronRight,
  Zap,
  Users,
  CheckCircle2,
  Calculator,
  Upload,
  Eye
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3 }
};

// Feature data
const features = [
  {
    icon: Clock,
    title: 'Lightning Fast',
    description: '3-day turnaround on most orders. Rush options available when you need it faster.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: ShieldCheck,
    title: 'Quality Guaranteed',
    description: 'Premium materials and professional printing. 100% satisfaction or we make it right.',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: Palette,
    title: 'Easy Design',
    description: 'Intuitive online designer or upload your own artwork. See your design in real-time.',
    gradient: 'from-purple-500 to-pink-500'
  }
];

// How it works steps
const steps = [
  {
    number: '01',
    icon: Palette,
    title: 'Design Your Product',
    description: 'Use our intuitive online designer or upload your own artwork'
  },
  {
    number: '02',
    icon: Calculator,
    title: 'Get Instant Quote',
    description: 'See transparent pricing as you customize your order'
  },
  {
    number: '03',
    icon: Upload,
    title: 'Place Your Order',
    description: 'Secure checkout with multiple payment options'
  },
  {
    number: '04',
    icon: Truck,
    title: 'Track & Receive',
    description: 'Real-time updates from production to your door'
  }
];

// Testimonials
const testimonials = [
  {
    quote: "Incredible turnaround time and quality. Our team shirts looked amazing and arrived right on schedule.",
    author: "Sarah Mitchell",
    role: "Marketing Director",
    company: "TechStart Inc",
    rating: 5
  },
  {
    quote: "The online designer made it so easy to visualize our custom hoodies before ordering. Highly recommend!",
    author: "James Thompson",
    role: "Event Coordinator",
    company: "EventPro Solutions",
    rating: 5
  },
  {
    quote: "Best print shop I've worked with. The quality is consistently excellent and pricing is transparent.",
    author: "Maria Garcia",
    role: "Brand Manager",
    company: "Urban Designs Co",
    rating: 5
  }
];

// Stats
const stats = [
  { value: '50K+', label: 'Orders Delivered' },
  { value: '99%', label: 'Satisfaction Rate' },
  { value: '3 Day', label: 'Avg Turnaround' },
  { value: '24/7', label: 'Order Tracking' }
];

export function CustomerLanding() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Printer className="text-primary-foreground w-5 h-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight hidden sm:inline">PrintShop OS</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/designer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Designer
            </Link>
            <Link to="/track" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Track Order
            </Link>
            <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </Link>
          </nav>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login/customer" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/designer">
              <Button size="sm" className="gap-1.5">
                <Sparkles className="w-4 h-4" />
                Start Designing
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-3xl opacity-30" />
        </div>
        
        <motion.div 
          className="container mx-auto text-center max-w-4xl"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <motion.div variants={fadeInUp}>
            <Badge variant="secondary" className="mb-6 gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Now with 2-day rush options
            </Badge>
          </motion.div>
          
          <motion.h1 
            variants={fadeInUp}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            Custom Apparel
            <br />
            <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Made Simple
            </span>
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Design online, get instant quotes, and track your order every step of the way.
            Premium custom printing delivered in as fast as 3 days.
          </motion.p>
          
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/designer">
              <Button size="lg" className="w-full sm:w-auto gap-2 h-12 px-8 text-base">
                Start Designing
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/track">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 h-12 px-8 text-base">
                <Package className="w-4 h-4" />
                Track Order
              </Button>
            </Link>
          </motion.div>
          
          {/* Trust indicators */}
          <motion.div 
            variants={fadeInUp}
            className="flex items-center justify-center gap-6 mt-12 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              No minimums
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Free shipping over $100
            </div>
            <div className="flex items-center gap-1.5 hidden sm:flex">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              100% satisfaction
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've streamlined the custom printing process to deliver exceptional quality with unmatched speed.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-6"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={scaleIn}>
                <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors group">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <motion.div 
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Badge variant="outline" className="mb-4">Process</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From design to delivery in four simple steps
            </p>
          </motion.div>
          
          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
          >
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="relative"
              >
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-border -translate-y-1/2">
                    <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                
                <div className="text-center">
                  <div className="relative inline-flex mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <step.icon className="w-7 h-7 text-primary" aria-hidden="true" />
                    </div>
                    <span 
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center"
                      aria-label={`Step ${index + 1} of ${steps.length}`}
                    >
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Interactive Pricing Preview */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div 
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Badge variant="outline" className="mb-4">Pricing</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Transparent Pricing</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              No hidden fees. See your exact price before you order.
            </p>
          </motion.div>
          
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={scaleIn}
          >
            <Card className="border-border/50 overflow-hidden">
              <CardContent className="p-0">
                <div className="grid lg:grid-cols-2">
                  {/* Pricing calculator preview */}
                  <div className="p-8 lg:p-12 bg-muted/30">
                    <h3 className="text-xl font-semibold mb-6">Quick Price Estimate</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <span className="text-muted-foreground">T-Shirts (25 qty)</span>
                        <span className="font-medium">$8.99 each</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <span className="text-muted-foreground">Front print (1 color)</span>
                        <span className="font-medium">Included</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <span className="text-muted-foreground">Setup fee</span>
                        <span className="font-medium text-green-600">Waived</span>
                      </div>
                      <div className="flex justify-between items-center py-4">
                        <span className="text-lg font-semibold">Estimated Total</span>
                        <span className="text-2xl font-bold text-primary">$224.75</span>
                      </div>
                    </div>
                    <Link to="/designer">
                      <Button className="w-full mt-6 gap-2">
                        Get Exact Quote
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                  
                  {/* Benefits */}
                  <div className="p-8 lg:p-12 bg-gradient-to-br from-primary/5 to-primary/10">
                    <h3 className="text-xl font-semibold mb-6">What's Included</h3>
                    <ul className="space-y-4">
                      {[
                        'Free design assistance',
                        'Digital proof before printing',
                        'Premium quality materials',
                        'Bulk discount pricing',
                        'Free shipping over $100',
                        'Satisfaction guarantee'
                      ].map((item, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Badge variant="outline" className="mb-4">
              <Users className="w-3.5 h-3.5 mr-1" />
              Testimonials
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by Customers</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it — hear from our satisfied customers.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-6"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={scaleIn}>
                <Card className="h-full border-border/50">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.author}</p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
        </div>
        
        <motion.div 
          className="container mx-auto text-center max-w-3xl"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Create Something Amazing?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Start designing your custom apparel today. No minimums, no hassle, just great prints.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/designer">
              <Button size="lg" className="w-full sm:w-auto gap-2 h-12 px-8">
                <Sparkles className="w-4 h-4" />
                Start Designing
              </Button>
            </Link>
            <Link to="/login/customer">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 h-12 px-8">
                <Eye className="w-4 h-4" />
                View My Orders
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                  <Printer className="text-primary-foreground w-5 h-5" />
                </div>
                <span className="text-lg font-semibold">PrintShop OS</span>
              </Link>
              <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                Professional custom printing for businesses and individuals. Quality you can count on.
              </p>
              <div className="flex gap-2">
                <ThemeToggle />
              </div>
            </div>
            
            {/* Products */}
            <div>
              <h4 className="font-semibold mb-4 text-sm">Products</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/designer" className="hover:text-foreground transition-colors">T-Shirts</Link></li>
                <li><Link to="/designer" className="hover:text-foreground transition-colors">Hoodies</Link></li>
                <li><Link to="/designer" className="hover:text-foreground transition-colors">Hats</Link></li>
                <li><Link to="/designer" className="hover:text-foreground transition-colors">Bags</Link></li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4 text-sm">Support</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link to="/track" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    Track Order
                  </Link>
                </li>
                <li><Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
                <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
                <li>
                  <Link to="/shipping" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    Shipping Info
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Account */}
            <div>
              <h4 className="font-semibold mb-4 text-sm">Account</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/login/customer" className="hover:text-foreground transition-colors">Customer Login</Link></li>
                <li><Link to="/login/employee" className="hover:text-foreground transition-colors">Employee Login</Link></li>
                <li><Link to="/login/admin" className="hover:text-foreground transition-colors">Admin Login</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} PrintShop OS. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default CustomerLanding;
