import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  X, 
  Send, 
  Bot,
  User
} from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm Astrea, your AI health assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputText),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const getAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('drug') || input.includes('medication') || input.includes('interaction')) {
      return "I can help you understand drug-food interactions! When you scan a receipt, I'll check for any potential conflicts between your medications and the food items. For example, grapefruit can interact with certain medications like statins.";
    }
    
    if (input.includes('allerg') || input.includes('allergy')) {
      return "Allergen detection is one of my key features! I'll scan your receipts for any ingredients that might trigger allergic reactions based on your allergy profile. Make sure to keep your health profile updated with all your known allergies.";
    }
    
    if (input.includes('receipt') || input.includes('scan')) {
      return "To scan a receipt, simply tap the camera button on the main page and take a photo of your grocery or restaurant receipt. I'll use OCR technology to extract the text and analyze it for potential health concerns.";
    }
    
    if (input.includes('health') || input.includes('diet') || input.includes('nutrition')) {
      return "I can provide personalized health insights based on your health profile! I'll help you align your food choices with your dietary goals and health conditions. What specific aspect of your health would you like to discuss?";
    }
    
    if (input.includes('newsletter') || input.includes('monthly')) {
      return "Our monthly newsletter provides personalized insights and recommendations based on your health profile, medication regimen, and dietary preferences. You can subscribe using the newsletter signup on the main page!";
    }
    
    return "That's a great question! I'm here to help with all aspects of food safety, drug interactions, allergen detection, and health-conscious eating. Feel free to ask me about scanning receipts, understanding food labels, or any health concerns you might have.";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md h-[600px] bg-card border border-primary/20 rounded-lg shadow-2xl glow-effect">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary/20">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Astrea AI</h3>
              <p className="text-xs text-muted-foreground">Your health assistant</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[400px]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start space-x-2 max-w-[80%] ${
                  message.isUser ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  message.isUser ? 'bg-primary' : 'bg-primary/20'
                }`}>
                  {message.isUser ? (
                    <User className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <Bot className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div
                  className={`px-3 py-2 rounded-lg ${
                    message.isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="px-3 py-2 rounded-lg bg-muted text-foreground">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-primary/20">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Astrea anything..."
              className="flex-1 bg-background/50 border-primary/50 text-foreground placeholder:text-muted-foreground"
              disabled={isTyping}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!inputText.trim() || isTyping}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
