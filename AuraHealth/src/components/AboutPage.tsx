import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Camera, 
  Brain, 
  Shield, 
  MessageCircle, 
  Mail,
  Smartphone,
  Receipt,
  AlertTriangle,
  CheckCircle,
  Star,
  Users,
  Heart,
  Zap
} from 'lucide-react';

interface AboutPageProps {
  onBackToHome: () => void;
  onNavigateToDashboard: () => void;
  onSubscribeNewsletter: (email: string) => void;
}

export function AboutPage({ onBackToHome, onNavigateToDashboard, onSubscribeNewsletter }: AboutPageProps) {
  return (
    <div className="min-h-screen galaxy-bg">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={onBackToHome}
                className="text-foreground hover:text-primary mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-primary text-glow">About Aura Health</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={onNavigateToDashboard}
                className="bg-primary hover:bg-primary/90 text-primary-foreground glow-effect"
              >
                Try Aura Now
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground text-glow mb-6">
            About Aura Health
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your AI-powered companion for safer, more informed food choices
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground text-glow mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Aura Health bridges the gap between what we buy and what's safe for our bodies. 
              We believe that every receipt tells a story about your health, and with the power of AI, 
              we can help you make better decisions before those choices impact your wellbeing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-primary/20 glow-effect">
              <Heart className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-3">Preventive Health</h3>
              <p className="text-muted-foreground">
                Transform everyday receipts into powerful tools for preventive health and dietary awareness.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-primary/20 glow-effect">
              <Users className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-3">Personalized Care</h3>
              <p className="text-muted-foreground">
                Every analysis is tailored to your unique health profile, medications, and dietary goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground text-glow mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Our AI-powered system analyzes your receipts in real-time to provide instant health insights
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">1. Upload Receipt</h3>
              <p className="text-muted-foreground">
                Simply scan or upload a photo of your grocery or restaurant receipt using your device's camera.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">2. AI Analysis</h3>
              <p className="text-muted-foreground">
                Our advanced OCR technology extracts text data and compares it against your personalized health profile.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">3. Get Insights</h3>
              <p className="text-muted-foreground">
                Receive clear warnings about potential interactions and suggestions for safer alternatives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground text-glow mb-4">Key Features</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <AlertTriangle className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Drug-Food Interactions</h3>
                  <p className="text-muted-foreground">
                    Identify potential interactions between your medications and food items. 
                    For example, warn about grapefruit juice when taking Atorvastatin.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Allergen Detection</h3>
                  <p className="text-muted-foreground">
                    Spot hidden allergens and ingredients that could trigger allergic reactions 
                    based on your allergy profile.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Star className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Health Goals Alignment</h3>
                  <p className="text-muted-foreground">
                    Ensure your purchases align with your dietary preferences and wellness objectives.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <MessageCircle className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">AI Chatbot Astrea</h3>
                  <p className="text-muted-foreground">
                    Get instant answers to your health and nutrition questions with our intelligent AI assistant.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Mail className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Monthly Newsletter</h3>
                  <p className="text-muted-foreground">
                    Receive personalized insights and recommendations based on your health profile and preferences.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Smartphone className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Progressive Web App</h3>
                  <p className="text-muted-foreground">
                    Works offline and installs like a native app on desktop and mobile devices.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground text-glow mb-6">Built with Modern Technology</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Aura Health is built using Next.js, TypeScript, Tailwind CSS, and next-pwa for a seamless, 
            fast, and reliable experience across all devices.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-primary/20">
              <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Next.js</p>
            </div>
            <div className="p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-primary/20">
              <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">TypeScript</p>
            </div>
            <div className="p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-primary/20">
              <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Tailwind CSS</p>
            </div>
            <div className="p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-primary/20">
              <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">PWA Ready</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground text-glow mb-4">
            Ready to Transform Your Health Journey?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of users who are making safer, more informed food choices every day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={onNavigateToDashboard}
              className="bg-primary hover:bg-primary/90 text-primary-foreground glow-effect text-lg px-8 py-3"
            >
              <Camera className="w-5 h-5 mr-2" />
              Start Scanning Receipts
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onNavigateToDashboard}
              className="bg-transparent border-primary text-primary hover:bg-primary hover:text-background glow-effect text-lg px-8 py-3"
            >
              <Receipt className="w-5 h-5 mr-2" />
              Go to Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-primary/20">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">
            © 2024 Aura Health. Making every receipt a step toward better health.
          </p>
        </div>
      </footer>
    </div>
  );
}
