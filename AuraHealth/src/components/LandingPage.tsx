import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmailService } from "@/services/emailService";
import { 
  Mail, 
  Camera, 
  Shield, 
  Brain, 
  Menu,
  X,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Globe,
  Download,
  Play,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Apple,
  Target
} from 'lucide-react';

interface LandingPageProps {
  onNavigateToAbout: () => void;
  onNavigateToDashboard: () => void;
  onSubscribeNewsletter: (email: string) => void;
}

export function LandingPage({ onNavigateToAbout, onNavigateToDashboard, onSubscribeNewsletter }: LandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Carousel data
  const carouselSlides = [
    {
      id: 1,
      title: "Smart Receipt Analysis",
      description: "Upload your grocery receipts and get instant AI-powered nutritional analysis",
      image: "🍎",
      color: "from-green-400 to-emerald-500"
    },
    {
      id: 2,
      title: "Health Safety First",
      description: "Detect drug interactions, allergens, and dietary conflicts automatically",
      image: "🛡️",
      color: "from-blue-400 to-cyan-500"
    },
    {
      id: 3,
      title: "Personalized Insights",
      description: "Get meal plans, budget swaps, and health recommendations tailored to you",
      image: "💡",
      color: "from-purple-400 to-pink-500"
    }
  ];

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [carouselSlides.length]);

  const handleNavigateToDashboard = () => {
    console.log('LandingPage: Navigating to dashboard...');
    onNavigateToDashboard();
  };

  const handleNavigateToAbout = () => {
    console.log('LandingPage: Navigating to about...');
    onNavigateToAbout();
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter form submitted with email:', email);
    
    if (email) {
      try {
        console.log('Attempting to subscribe to newsletter...');
        const result = await EmailService.subscribeToNewsletter(email, 'Valued User');
        console.log('Newsletter subscription result:', result);
        
        if (result.success) {
          setIsSubscribed(true);
          setEmail('');
          setTimeout(() => setIsSubscribed(false), 3000);
          // Also call the original callback for any additional handling
          onSubscribeNewsletter(email);
        } else {
          console.error('Newsletter subscription failed:', result.message);
          // You could add a toast notification here
        }
      } catch (error) {
        console.error('Newsletter subscription error:', error);
        // You could add a toast notification here
      }
    } else {
      console.log('No email provided');
    }
  };

  return (
    <div className="min-h-screen galaxy-bg overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/30 backdrop-blur-xl border-b border-primary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <img 
                    src="/logo.png" 
                    alt="Aura Health Logo" 
                    className="w-10 h-10 rounded-xl"
                  />
                  <h1 className="text-3xl font-bold text-white text-glow">Aura Health</h1>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <button
                  onClick={handleNavigateToAbout}
                  className="text-foreground hover:text-primary px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-primary/10"
                >
                  About
                </button>
                <Button 
                  onClick={handleNavigateToDashboard}
                  className="bg-gradient-to-r from-[#14967f] to-[#095d7e] hover:from-[#14967f]/90 hover:to-[#095d7e]/90 text-white px-6 py-2 rounded-2xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Try Aura Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-foreground hover:text-primary"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/40 backdrop-blur-xl border-t border-primary/30">
            <div className="px-4 pt-4 pb-6 space-y-3">
              <button
                onClick={() => {
                  handleNavigateToAbout();
                  setIsMenuOpen(false);
                }}
                className="text-foreground hover:text-primary block px-4 py-3 rounded-lg text-base font-medium hover:bg-primary/10 w-full text-left"
              >
                About
              </button>
              <Button 
                onClick={() => {
                  handleNavigateToDashboard();
                  setIsMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-[#14967f] to-[#095d7e] hover:from-[#14967f]/90 hover:to-[#095d7e]/90 text-white px-6 py-3 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Try Aura Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section with Carousel */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left relative z-10">
              {/* Badge */}
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-[#e2fcd6] to-[#ccecee] border border-[#14967f]/30 text-[#095d7e] text-sm font-medium mb-8 shadow-lg">
                <Sparkles className="w-5 h-5 mr-2" />
                AI-Powered Health Analysis
              </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white text-glow mb-8 leading-tight">
              Smart Health
              <span className="block ">Made Simple</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/95 mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed drop-shadow-md">
              Upload your grocery receipts and get instant nutritional analysis, meal planning, 
              and personalized health insights powered by advanced AI technology.
            </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start mb-16">
                <Button 
                  size="lg" 
                  onClick={handleNavigateToDashboard}
                  className="bg-gradient-to-r from-[#14967f] to-[#095d7e] hover:from-[#14967f]/90 hover:to-[#095d7e]/90 text-white px-8 py-4 rounded-2xl text-lg font-semibold group shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Camera className="w-6 h-6 mr-3" />
                  Start Scanning Receipts
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleNavigateToDashboard}
                  className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white hover:text-[#095d7e] px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 group shadow-lg hover:shadow-xl"
                >
                  <Play className="w-6 h-6 mr-3" />
                  Watch Demo
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto lg:mx-0">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-theme-accent mb-2 drop-shadow-lg">10K+</div>
                  <div className="text-white/90 drop-shadow-md">Receipts Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-theme-light mb-2 drop-shadow-lg">95%</div>
                  <div className="text-white/90 drop-shadow-md">Accuracy Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-theme-accent mb-2 drop-shadow-lg">50+</div>
                  <div className="text-white/90 drop-shadow-md">Drug Interactions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-theme-light mb-2 drop-shadow-lg">24/7</div>
                  <div className="text-white/90 drop-shadow-md">AI Support</div>
                </div>
              </div>
            </div>

            {/* Right Content - Carousel */}
            <div className="relative">
              <div className="relative h-96 lg:h-[500px] overflow-hidden rounded-3xl bg-gradient-to-br from-[#f1f9ff] to-[#ccecee] p-8 shadow-2xl">
                {/* Carousel Slides */}
                <div className="relative h-full">
                  {carouselSlides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-500 ${
                        index === currentSlide 
                          ? 'opacity-100 translate-x-0' 
                          : index < currentSlide 
                            ? 'opacity-0 -translate-x-full' 
                            : 'opacity-0 translate-x-full'
                      }`}
                    >
                      <div className={`w-32 h-32 rounded-full bg-gradient-to-r ${slide.color} flex items-center justify-center text-6xl mb-8 shadow-lg`}>
                        {slide.image}
                      </div>
                      <h3 className="text-3xl font-bold text-[#095d7e] mb-4">{slide.title}</h3>
                      <p className="text-lg text-[#14967f] max-w-md">{slide.description}</p>
                    </div>
                  ))}
                </div>

                {/* Carousel Navigation */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {carouselSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentSlide 
                          ? 'bg-[#14967f] scale-125' 
                          : 'bg-[#ccecee] hover:bg-[#14967f]/50'
                      }`}
                    />
                  ))}
                </div>

                {/* Carousel Arrows */}
                <button
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
                >
                  <ChevronLeft className="w-6 h-6 text-[#095d7e]" />
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % carouselSlides.length)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
                >
                  <ChevronRight className="w-6 h-6 text-[#095d7e]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-[#14967f]/60" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-glow mb-6 drop-shadow-lg">
              How It Works
            </h2>
            <p className="text-xl text-white/95 max-w-3xl mx-auto drop-shadow-md">
              Transform your everyday receipts into powerful health insights with our AI-powered analysis
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Feature 1 */}
            <div className="group text-center p-8 rounded-2xl vibrant-card border border-[#14967f]/20 glow-effect hover:glow-effect transition-all duration-300 hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-br from-[#14967f] to-[#095d7e] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-[#095d7e] mb-4">1. Scan Receipt</h3>
              <p className="text-[#14967f] text-lg leading-relaxed">
                Upload or scan your grocery or restaurant receipt using your device's camera with our advanced OCR technology
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group text-center p-8 rounded-2xl vibrant-card border border-[#14967f]/20 glow-effect hover:glow-effect transition-all duration-300 hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-br from-[#095d7e] to-[#14967f] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-[#095d7e] mb-4">2. AI Analysis</h3>
              <p className="text-[#14967f] text-lg leading-relaxed">
                Our advanced AI analyzes items against your health profile, medications, and allergies in real-time
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group text-center p-8 rounded-2xl vibrant-card border border-[#14967f]/20 glow-effect hover:glow-effect transition-all duration-300 hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-br from-[#14967f] to-[#095d7e] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-[#095d7e] mb-4">3. Get Insights</h3>
              <p className="text-[#14967f] text-lg leading-relaxed">
                Receive clear warnings and safer alternatives for potential health conflicts with actionable recommendations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#f1f9ff] to-[#e2fcd6] relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-[#095d7e] text-glow mb-6">
              Why Choose Aura Health?
            </h2>
            <p className="text-xl text-[#14967f] max-w-3xl mx-auto">
              Join thousands of users who trust Aura Health for their food safety and wellness journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 group">
              <div className="w-16 h-16 bg-gradient-to-br from-[#14967f] to-[#095d7e] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#095d7e] mb-3">Drug Interactions</h3>
              <p className="text-[#14967f]">
                Identify potential medication conflicts with your food choices instantly
              </p>
            </div>

            <div className="text-center p-6 group">
              <div className="w-16 h-16 bg-gradient-to-br from-[#e2fcd6] to-[#14967f] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <CheckCircle className="w-8 h-8 text-[#095d7e]" />
              </div>
              <h3 className="text-xl font-semibold text-[#095d7e] mb-3">Allergen Detection</h3>
              <p className="text-[#14967f]">
                Spot hidden allergens and ingredients that could trigger reactions
              </p>
            </div>

            <div className="text-center p-6 group">
              <div className="w-16 h-16 bg-gradient-to-br from-[#ccecee] to-[#14967f] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Target className="w-8 h-8 text-[#095d7e]" />
              </div>
              <h3 className="text-xl font-semibold text-[#095d7e] mb-3">Health Goals</h3>
              <p className="text-[#14967f]">
                Align your purchases with your dietary and wellness objectives
              </p>
            </div>

            <div className="text-center p-6 group">
              <div className="w-16 h-16 bg-gradient-to-br from-[#14967f] to-[#095d7e] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#095d7e] mb-3">PWA Ready</h3>
              <p className="text-[#14967f]">
                Works offline and installs like a native app on any device
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#095d7e] text-glow mb-6">
              Download Aura Health
            </h2>
            <p className="text-xl text-[#14967f] max-w-3xl mx-auto">
              Get the full experience with our mobile app. Available on all platforms.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* App Preview */}
            <div className="relative">
              <div className="relative h-96 bg-gradient-to-br from-[#f1f9ff] to-[#ccecee] rounded-3xl p-8 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#14967f]/10 to-[#095d7e]/10 rounded-3xl"></div>
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-[#14967f] to-[#095d7e] rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-lg">
                    📱
                  </div>
                  <h3 className="text-2xl font-bold text-[#095d7e] mb-4">Mobile App</h3>
                  <p className="text-[#14967f] text-lg">Scan receipts on the go with our intuitive mobile interface</p>
                </div>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-[#095d7e] mb-6">Get Started Today</h3>
                
                <div className="space-y-4">
                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-[#14967f] to-[#095d7e] hover:from-[#14967f]/90 hover:to-[#095d7e]/90 text-white px-8 py-4 rounded-2xl text-lg font-semibold group shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Apple className="w-6 h-6 mr-3" />
                    Download for iOS
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white hover:text-[#095d7e] px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 group shadow-lg hover:shadow-xl"
                  >
                    <Smartphone className="w-6 h-6 mr-3" />
                    Download for Android
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#e2fcd6] rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-[#14967f]" />
                  </div>
                  <span className="text-[#095d7e] font-medium">Offline receipt scanning</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#e2fcd6] rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-[#14967f]" />
                  </div>
                  <span className="text-[#095d7e] font-medium">Real-time health alerts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#e2fcd6] rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-[#14967f]" />
                  </div>
                  <span className="text-[#095d7e] font-medium">Personalized meal plans</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#e2fcd6] rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-[#14967f]" />
                  </div>
                  <span className="text-[#095d7e] font-medium">Sync across devices</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-[#e2fcd6]/30 to-[#ccecee]/30 rounded-3xl p-12 border border-[#14967f]/30 glow-effect">
            <h2 className="text-4xl md:text-5xl font-bold text-[#095d7e] text-glow mb-6">
              Ready to Transform Your Health Journey?
            </h2>
            <p className="text-xl text-[#14967f] mb-8 max-w-2xl mx-auto">
              Join thousands of users who are making safer, more informed food choices every day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleNavigateToDashboard}
                className="bg-gradient-to-r from-[#14967f] to-[#095d7e] hover:from-[#14967f]/90 hover:to-[#095d7e]/90 text-white px-8 py-4 rounded-2xl text-lg font-semibold group shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Camera className="w-6 h-6 mr-3" />
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleNavigateToAbout}
                className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white hover:text-[#095d7e] px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#f1f9ff] to-[#e2fcd6]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#095d7e] text-glow mb-4">
            Stay Informed with Monthly Insights
          </h2>
          <p className="text-lg text-[#14967f] mb-8">
            Get personalized health recommendations, dietary insights, and wellness tips 
            delivered to your inbox every month.
          </p>
          
          <form onSubmit={handleSubscribe} className="max-w-md mx-auto relative z-10">
            <div className="flex gap-3 items-center">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/80 border-[#14967f]/50 text-[#095d7e] placeholder:text-[#14967f]/70 rounded-xl flex-1 cursor-text"
                required
              />
              <Button 
                type="submit" 
                onClick={(e) => {
                  console.log('Subscribe button clicked');
                  e.preventDefault();
                  handleSubscribe(e);
                }}
                className="bg-gradient-to-r from-[#14967f] to-[#095d7e] hover:from-[#14967f]/90 hover:to-[#095d7e]/90 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <Mail className="w-4 h-4 mr-2" />
                Subscribe
              </Button>
            </div>
            {isSubscribed && (
              <p className="text-[#14967f] mt-3 text-sm font-medium">
                ✓ Thank you for subscribing! Check your email for confirmation.
              </p>
            )}
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[#14967f]/20 bg-gradient-to-br from-[#095d7e] to-[#14967f]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/logo.png" 
                  alt="Aura Health Logo" 
                  className="w-10 h-10 rounded-xl"
                />
                <h3 className="text-2xl font-bold text-white text-glow">Aura Health</h3>
              </div>
              <p className="text-white/80 mb-4 max-w-md">
                Making every receipt a step toward better health with AI-powered analysis and personalized insights.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                  <Globe className="w-4 h-4 mr-2" />
                  Website
                </Button>
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-white/80">
                <li><button onClick={onNavigateToDashboard} className="hover:text-white transition-colors">Dashboard</button></li>
                <li><button onClick={onNavigateToAbout} className="hover:text-white transition-colors">About</button></li>
                <li><button className="hover:text-white transition-colors">Features</button></li>
                <li><button className="hover:text-white transition-colors">Pricing</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-white/80">
                <li><button className="hover:text-white transition-colors">Help Center</button></li>
                <li><button className="hover:text-white transition-colors">Contact Us</button></li>
                <li><button className="hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button className="hover:text-white transition-colors">Terms of Service</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/80">
            <p>© 2024 Aura Health. Making every receipt a step toward better health.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}