import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { 
  Camera, 
  Upload, 
  FileText, 
  MessageCircle, 
  User,
  LogOut,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Scan,
  Heart,
  Activity,
  Zap,
  History,
  Plus,
  Mic,
  MicOff,
  Volume2,
  Bot,
  Send
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// Simple chat components
import OCRService, { type HealthAnalysis } from '../services/ocrService';

interface DashboardProps {
  onLogout: () => void;
}

interface ReceiptDisplayData {
  id: string;
  image: string;
  text: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    category: string;
    nutrition?: {
      carbohydrates: number;
      protein: number;
      fats: number;
      fiber: number;
      sugar: number;
      sodium: number;
      calories: number;
    };
  }>;
  timestamp: Date;
  analysis: HealthAnalysis;
  redFlags?: Array<{ title: string; detail: string; severity: 'low' | 'medium' | 'high' }>;
  budgetSwaps?: Array<{ item: string; swap: string; savings: string }>;
  healthySwaps?: Array<{ item: string; swap: string; reason: string }>;
  mealPlan?: Array<{ 
    name: string; 
    uses: string[]; 
    prep_time: string; 
    difficulty: 'easy' | 'medium' | 'hard'; 
    nutrition_benefits: string; 
  }>;
  alternativeMealPlan?: Array<{ 
    name: string; 
    uses: string[]; 
    prep_time: string; 
    difficulty: 'easy' | 'medium' | 'hard'; 
    nutrition_benefits: string; 
  }>;
  ingredientAnalysis?: Array<{ 
    ingredient: string; 
    health_benefits: string; 
    nutritional_value: string; 
    cooking_tips: string; 
  }>;
  nutrients?: Array<{ name: string; amount: string; daily_value_percent: string }>;
  macros?: {
    calories: string | number;
    protein_g: string | number;
    carbs_g: string | number;
    fat_g: string | number;
    fiber_g: string | number;
    sugar_g: string | number;
    sodium_mg: string | number;
  };
  overallHealthScore?: number;
  suggestions?: Array<{ 
    category: string; 
    title: string; 
    description: string; 
    priority: 'low' | 'medium' | 'high'; 
  }>;
  warnings?: Array<{ 
    type: string; 
    message: string; 
    severity: 'low' | 'medium' | 'high'; 
  }>;
}


interface HealthProfile {
  diagnoses: string[];
  medications: string[];
  allergies: string[];
  dietaryRestrictions: string[];
  healthGoals: string[];
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [receipts, setReceipts] = useState<ReceiptDisplayData[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [aiModel, setAiModel] = useState('openrouter');
  const [activeTab, setActiveTab] = useState('main');
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [healthProfile, setHealthProfile] = useState<HealthProfile>({
    diagnoses: [],
    medications: [],
    allergies: [],
    dietaryRestrictions: [],
    healthGoals: []
  });
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [tempHealthProfile, setTempHealthProfile] = useState<HealthProfile>({
    diagnoses: [],
    medications: [],
    allergies: [],
    dietaryRestrictions: [],
    healthGoals: []
  });

  // Chat functionality
  const [messages, setMessages] = useState<Array<{id: string, role: 'user' | 'assistant', content: string}>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    const newMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: userMessage
    };
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, newMessage],
          receiptContext: receipts.length > 0 ? receipts[0] : null,
          healthProfile: healthProfile,
          aiModel: aiModel
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: data.response
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(0));
  const [currentSpeech, setCurrentSpeech] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'assistant', content: string, timestamp: Date}>>([]);
  const [audioLevel, setAudioLevel] = useState<number>(0);


  // Reset UI when new image is selected
  const resetUI = () => {
    setSelectedImage(null);
    setReceipts([]);
    setAnalysisHistory([]);
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      // Stop any ongoing recording
      if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
      
      // Stop any playing audio
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      
      // Close WebSocket
      if (websocket) {
        websocket.close();
      }
      
      // Close audio context safely
      if (audioContext && audioContext.state !== 'closed') {
        try {
          audioContext.close();
        } catch (error) {
          console.log('AudioContext already closed or error closing:', error);
        }
      }
    };
  }, [websocket, audioContext, mediaRecorder, isRecording]);

  // Real-time audio conversation using WebSocket
  const connectToGeminiLive = async () => {
    try {
      // Initialize AudioContext for audio processing
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(audioCtx);

      console.log('🔌 Connecting to real-time audio processing...');
      
      // Create a real WebSocket connection to our backend
      const ws = new WebSocket('ws://localhost:8000/ws/gemini-live');
      
      ws.onopen = () => {
        console.log('✅ WebSocket connected to backend');
        setIsConnected(true);
        startAudioVisualization();
        
        // Send initial setup message
        ws.send(JSON.stringify({
          type: 'setup',
          data: {
            receipt_context: receipts.length > 0 ? receipts[0] : null,
            health_profile: healthProfile,
            conversation_history: conversationHistory.slice(-5)
          }
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Received WebSocket message:', data);
          
          if (data.type === 'setup_complete') {
            console.log('✅ WebSocket setup complete:', data.message);
          } else if (data.type === 'text_response') {
            // Handle text response and convert to speech
            console.log('🗣️ Received text response:', data.text);
            speakText(data.text);
          } else if (data.type === 'audio_response') {
            // Play the audio response
            if (data.audio_data) {
              playAudioResponse(data.audio_data);
            } else if (data.text_response) {
              speakText(data.text_response);
            }
          } else if (data.type === 'error') {
            console.error('❌ WebSocket error:', data.message);
            // Show error in UI
            setCurrentSpeech(`Error: ${data.message}`);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setWebsocket(null);
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
      };

      setWebsocket(ws);
    } catch (error) {
      console.error('Error connecting to real-time audio:', error);
    }
  };

  const disconnectFromGeminiLive = () => {
    // Stop any ongoing recording
    if (mediaRecorder && isRecording) {
      stopRecording();
    }
    
    // Stop any playing audio
    stopAudio();
    
    // Close WebSocket
    if (websocket) {
      websocket.close();
      setWebsocket(null);
    }
    
    // Close audio context safely
    if (audioContext && audioContext.state !== 'closed') {
      try {
        audioContext.close();
      } catch (error) {
        console.log('AudioContext already closed or error closing:', error);
      }
    }
    setAudioContext(null);
    
    // Reset states
    setIsConnected(false);
    setIsProcessing(false);
    setIsPlaying(false);
    setCurrentSpeech('');
    setAudioLevel(0);
    
    console.log('🔌 Disconnected from Gemini Live');
  };

  const startRecording = async () => {
    if (!isConnected) {
      await connectToGeminiLive();
      return;
    }

    // Stop any playing audio when starting to record
    stopAudio();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000, // Standard sample rate for speech recognition
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Set up audio level monitoring
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const monitorAudioLevel = () => {
        if (isRecording) {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average);
          requestAnimationFrame(monitorAudioLevel);
        }
      };
      monitorAudioLevel();
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      let hasProcessedAudio = false;
      
      recorder.ondataavailable = async (event) => {
        console.log('🎤 Audio data available:', event.data.size, 'bytes');
        
        // Only process if we have audio data and we're not already processing
        if (event.data.size > 0 && !isProcessing && !hasProcessedAudio && websocket) {
          hasProcessedAudio = true;
          setIsProcessing(true);
          
          console.log('🔄 Processing audio chunk via WebSocket...');
          
          // Convert audio to base64 and send via WebSocket
          const reader = new FileReader();
          reader.onload = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            console.log('📊 Audio base64 length:', base64Audio.length);
            
            // Check if we have meaningful audio data
            if (base64Audio.length < 100) {
              console.log('⚠️ Audio data too small, might be empty');
              setIsProcessing(false);
              hasProcessedAudio = false;
              return;
            }
            
            try {
              console.log('📤 Sending audio via WebSocket...');
              
              // Send audio data via WebSocket
              websocket.send(JSON.stringify({
                type: 'audio_data',
                data: {
                  audio_data: base64Audio,
                  receipt_context: receipts.length > 0 ? receipts[0] : null,
                  health_profile: healthProfile,
                  conversation_history: conversationHistory.slice(-5)
                }
              }));
              
              // Add user message to conversation history
              setConversationHistory(prev => [...prev, {role: 'user', content: '[Audio message]', timestamp: new Date()}]);
              
            } catch (error) {
              console.error('💥 Error sending audio via WebSocket:', error);
            } finally {
              setIsProcessing(false);
              hasProcessedAudio = false; // Reset for next recording
            }
          };
          reader.readAsDataURL(event.data);
        } else if (event.data.size === 0) {
          console.log('⚠️ Empty audio data received');
        } else if (isProcessing) {
          console.log('⏳ Already processing audio, skipping...');
        } else if (!websocket) {
          console.log('⚠️ WebSocket not connected, cannot send audio');
        }
      };
      
      // Start recording with manual stop (no automatic chunks)
      recorder.start(); // Start recording without time slices
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      console.log('🎤 Started audio recording for conversation with Astrea');
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      console.log('🛑 Stopping audio recording...');
      
      // Stop the media recorder
      mediaRecorder.stop();
      
      // Stop all audio tracks
      mediaRecorder.stream.getTracks().forEach(track => {
        track.stop();
        console.log('🔇 Stopped audio track');
      });
      
      setIsRecording(false);
      setMediaRecorder(null);
      
      console.log('✅ Stopped recording, processing audio...');
    }
  };

  const playAudioResponse = async (base64Audio: string) => {
    try {
      if (!audioContext) return;
      
      console.log('Playing audio response from Astrea...');
      
      // Convert base64 to ArrayBuffer
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Try to decode the audio data
      try {
        const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
        
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
        
        console.log('Audio response playing successfully');
      } catch (decodeError) {
        console.log('Audio decode failed, trying alternative playback method');
        
        // Fallback: Create audio element for playback
        const audioBlob = new Blob([bytes], { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        audio.play().catch(playError => {
          console.error('Audio playback failed:', playError);
        });
      }
      
      // Audio response is now handled by the visualizer
    } catch (error) {
      console.error('Error playing audio response:', error);
    }
  };

  const speakText = async (text: string) => {
    try {
      if (!('speechSynthesis' in window)) {
        console.log('Speech synthesis not supported');
        return;
      }

      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      setIsPlaying(true);
      setCurrentSpeech(text);

      // Add to conversation history
      setConversationHistory(prev => [...prev, {role: 'assistant', content: text, timestamp: new Date()}]);

      const utterance = new SpeechSynthesisUtterance(text);
      
      // More human-like speech parameters
      utterance.rate = 0.85; // Slower, more natural pace
      utterance.pitch = 1.1; // Slightly higher pitch for female voice
      utterance.volume = 0.9; // Higher volume for clarity
      
      // Add natural pauses and emphasis
      const processedText = text
        .replace(/\./g, '. ') // Add space after periods
        .replace(/,/g, ', ') // Add space after commas
        .replace(/:/g, ': ') // Add space after colons
        .replace(/;/g, '; ') // Add space after semicolons
        .replace(/\?/g, '? ') // Add space after questions
        .replace(/!/g, '! '); // Add space after exclamations
      
      utterance.text = processedText;

      // Try to use a more natural female voice for Astrea
      const voices = window.speechSynthesis.getVoices();
      const preferredVoices = [
        'Samantha', 'Karen', 'Victoria', 'Alex', 'Fiona',
        'Female', 'Woman', 'Google UK English Female',
        'Google US English Female', 'Microsoft Zira Desktop'
      ];
      
      const femaleVoice = voices.find(voice => 
        preferredVoices.some(preferred => 
          voice.name.includes(preferred)
        )
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
        console.log('Using voice:', femaleVoice.name);
      } else {
        console.log('Using default voice');
      }

      utterance.onstart = () => {
        console.log('Astrea is speaking...');
        setIsPlaying(true);
      };

      utterance.onend = () => {
        console.log('Astrea finished speaking');
        setIsPlaying(false);
        setCurrentSpeech('');
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsPlaying(false);
        setCurrentSpeech('');
      };

      // Add slight delay for more natural conversation flow
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 200);

    } catch (error) {
      console.error('Error with text-to-speech:', error);
      setIsPlaying(false);
      setCurrentSpeech('');
    }
  };

  const stopAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentSpeech('');
    }
  };

  const startAudioVisualization = () => {
    if (!audioContext) return;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    setAudioData(dataArray);

    const visualize = () => {
      analyser.getByteFrequencyData(dataArray);
      setAudioData(new Uint8Array(dataArray));
      requestAnimationFrame(visualize);
    };
    visualize();
  };

  // Audio Visualizer Component
  const AudioVisualizer = () => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      if (isRecording && audioLevel > 0) {
        // Show real-time audio level
        const barHeight = (audioLevel / 255) * height;
        const x = 0;
        const y = height - barHeight;

        // Create gradient based on audio level
        const gradient = ctx.createLinearGradient(0, y, 0, height);
        if (audioLevel > 100) {
          gradient.addColorStop(0, '#ef4444'); // red for high level
          gradient.addColorStop(1, '#dc2626');
        } else if (audioLevel > 50) {
          gradient.addColorStop(0, '#f59e0b'); // orange for medium level
          gradient.addColorStop(1, '#d97706');
        } else {
          gradient.addColorStop(0, '#10b981'); // green for low level
          gradient.addColorStop(1, '#059669');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, barHeight);
        
        // Add audio level text
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.fillText(`Audio Level: ${Math.round(audioLevel)}`, 10, 20);
      } else if (audioData.length > 0) {
        // Show frequency data if available
        const barWidth = width / audioData.length;
        for (let i = 0; i < audioData.length; i++) {
          const barHeight = (audioData[i] / 255) * height;
          const x = i * barWidth;
          const y = height - barHeight;

          // Create gradient
          const gradient = ctx.createLinearGradient(0, y, 0, height);
          gradient.addColorStop(0, '#10b981'); // emerald-500
          gradient.addColorStop(1, '#059669'); // emerald-600

          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, barWidth - 1, barHeight);
        }
      } else {
        // Show idle state
        ctx.fillStyle = '#6b7280';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Audio Visualizer', width / 2, height / 2);
        ctx.fillText('Start recording to see audio levels', width / 2, height / 2 + 20);
      }
    }, [audioData, audioLevel, isRecording]);

    return (
      <div className="w-full h-32 bg-slate-900 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={400}
          height={128}
          className="w-full h-full"
        />
      </div>
    );
  };

  // Chart data for nutritional macronutrients
  const getNutritionalChartData = () => {
    if (receipts.length === 0) return [];
    
    // Calculate nutritional macronutrients
    const nutritionData = {
      carbohydrates: 0,
      protein: 0,
      fats: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      calories: 0
    };

    receipts.forEach(receipt => {
      receipt.items.forEach(item => {
        const quantity = item.quantity || 1;
        
        // Check if item has nutritional data from Gemini
        if (item.nutrition) {
          nutritionData.carbohydrates += (item.nutrition.carbohydrates || 0) * quantity;
          nutritionData.protein += (item.nutrition.protein || 0) * quantity;
          nutritionData.fats += (item.nutrition.fats || 0) * quantity;
          nutritionData.fiber += (item.nutrition.fiber || 0) * quantity;
          nutritionData.sugar += (item.nutrition.sugar || 0) * quantity;
          nutritionData.sodium += (item.nutrition.sodium || 0) * quantity;
          nutritionData.calories += (item.nutrition.calories || 0) * quantity;
        } else {
          // Fallback to estimated values based on category
          const category = item.category.toLowerCase();
          switch (category) {
            case 'fruits':
              nutritionData.carbohydrates += quantity * 15;
              nutritionData.fiber += quantity * 3;
              nutritionData.sugar += quantity * 12;
              nutritionData.calories += quantity * 60;
              break;
            case 'vegetables':
              nutritionData.carbohydrates += quantity * 5;
              nutritionData.fiber += quantity * 4;
              nutritionData.calories += quantity * 25;
              break;
            case 'dairy':
              nutritionData.protein += quantity * 8;
              nutritionData.fats += quantity * 5;
              nutritionData.calories += quantity * 80;
              break;
            case 'meat':
              nutritionData.protein += quantity * 25;
              nutritionData.fats += quantity * 10;
              nutritionData.sodium += quantity * 200;
              nutritionData.calories += quantity * 200;
              break;
            case 'bakery':
              nutritionData.carbohydrates += quantity * 20;
              nutritionData.fiber += quantity * 2;
              nutritionData.sugar += quantity * 5;
              nutritionData.calories += quantity * 150;
              break;
            case 'beverages':
              nutritionData.carbohydrates += quantity * 12;
              nutritionData.sugar += quantity * 10;
              nutritionData.calories += quantity * 50;
              break;
            case 'nuts':
              nutritionData.fats += quantity * 15;
              nutritionData.protein += quantity * 6;
              nutritionData.fiber += quantity * 3;
              nutritionData.calories += quantity * 180;
              break;
            default:
              nutritionData.carbohydrates += quantity * 10;
              nutritionData.calories += quantity * 100;
          }
        }
      });
    });

    // Convert to chart data format with realistic nutritional values
    return [
      { name: 'Carbohydrates', value: Math.round(nutritionData.carbohydrates), color: '#f59e0b', unit: 'g' },
      { name: 'Protein', value: Math.round(nutritionData.protein), color: '#ef4444', unit: 'g' },
      { name: 'Fats', value: Math.round(nutritionData.fats), color: '#8b5cf6', unit: 'g' },
      { name: 'Fiber', value: Math.round(nutritionData.fiber), color: '#22c55e', unit: 'g' },
      { name: 'Sugar', value: Math.round(nutritionData.sugar), color: '#f97316', unit: 'g' },
      { name: 'Sodium', value: Math.round(nutritionData.sodium), color: '#06b6d4', unit: 'mg' },
      { name: 'Calories', value: Math.round(nutritionData.calories), color: '#84cc16', unit: 'kcal' }
    ].filter(item => item.value > 0); // Only show categories with data
  };

  const getCategoryChartData = () => {
    if (receipts.length === 0) return [];
    
    const categoryCount: { [key: string]: number } = {};
    receipts.forEach(receipt => {
      receipt.items.forEach(item => {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      });
    });

    return Object.entries(categoryCount).map(([category, count]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: count,
      color: getCategoryColor(category)
    }));
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'fruits': '#10b981',
      'vegetables': '#22c55e',
      'dairy': '#3b82f6',
      'meat': '#ef4444',
      'bakery': '#f59e0b',
      'beverages': '#8b5cf6',
      'nuts': '#d97706',
      'general': '#6b7280'
    };
    return colors[category] || '#6b7280';
  };

  // Load analysis history
  const loadAnalysisHistory = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/history`);
      if (response.ok) {
        const data = await response.json();
        setAnalysisHistory(data.analyses || []);
      }
    } catch (error) {
      console.error('Failed to load analysis history:', error);
    }
  };

  // Load history on component mount
  React.useEffect(() => {
    loadAnalysisHistory();
  }, []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Reset UI when new image is selected
      resetUI();
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        console.log('FileReader result length:', imageData.length);
        console.log('FileReader result preview:', imageData.substring(0, 100));
        console.log('File size:', file.size);
        console.log('File type:', file.type);
        setSelectedImage(imageData);
        processReceipt(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const processReceipt = async (imageData: string) => {
    setIsScanning(true);
    
    try {
      console.log('Processing receipt with Gemini directly...');
      console.log('Image data length:', imageData.length);
      console.log('Image data preview:', imageData.substring(0, 100) + '...');
      
      // Validate image data
      if (!imageData || imageData.length < 100) {
        throw new Error('Invalid image data: Image too small or empty');
      }
      
      if (!imageData.startsWith('data:image/')) {
        throw new Error('Invalid image data: Not a valid image data URL');
      }
      
      // Process receipt with OCR service - this will now use Gemini directly
      const receiptData = await OCRService.processReceipt(imageData);
      console.log('Gemini Results:', receiptData);
      
      // Use the health analysis from the backend
      const analysis: HealthAnalysis = receiptData.healthAnalysis || {
        red_flags: [],
        budget_swaps: [],
        healthy_swaps: [],
        meal_plan: [],
        alternative_meal_plan: [],
        ingredient_analysis: [],
        nutrients: [],
        macros: {
          calories: 0,
          protein_g: 0,
          carbs_g: 0,
          fat_g: 0,
          fiber_g: 0,
          sugar_g: 0,
          sodium_mg: 0
        },
        overall_health_score: 0,
        suggestions: [],
        warnings: []
      };
      
      const newReceipt: ReceiptDisplayData = {
        id: Date.now().toString(),
        image: imageData,
        text: receiptData.rawText,
        items: receiptData.items,
        timestamp: new Date(),
        analysis,
        redFlags: receiptData.redFlags,
        budgetSwaps: receiptData.budgetSwaps,
        healthySwaps: receiptData.healthySwaps,
        mealPlan: receiptData.mealPlan,
        alternativeMealPlan: receiptData.alternativeMealPlan,
        ingredientAnalysis: receiptData.ingredientAnalysis,
        nutrients: receiptData.nutrients,
        macros: receiptData.macros,
        overallHealthScore: receiptData.overallHealthScore,
        suggestions: receiptData.suggestions,
        warnings: receiptData.warnings
      };

      console.log('Adding receipt to list:', newReceipt);
      setReceipts(prev => [newReceipt, ...prev]);
      
      // Refresh analysis history
      loadAnalysisHistory();
    } catch (error) {
      console.error('Error processing receipt:', error);
      console.error('Full error details:', error);
      alert(`Failed to process receipt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsScanning(false);
    }
  };

  // Health profile modal handlers
  const handleOpenHealthModal = () => {
    setTempHealthProfile(healthProfile);
    setIsHealthModalOpen(true);
  };

  const handleSaveHealthProfile = () => {
    setHealthProfile(tempHealthProfile);
    setIsHealthModalOpen(false);
  };

  const handleCancelHealthModal = () => {
    setTempHealthProfile(healthProfile);
    setIsHealthModalOpen(false);
  };


  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Aura Health</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">AI-Powered Receipt Analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={onLogout}
                variant="ghost"
                size="sm"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col h-full">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* File Upload Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Scan className="w-5 h-5 mr-2" />
                    Scan Receipt
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1"
                      disabled={isScanning}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      disabled={isScanning}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Camera
                    </Button>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  {isScanning && (
                    <div className="flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <Loader2 className="w-5 h-5 animate-spin text-slate-600 dark:text-slate-400 mr-2" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Processing receipt...</span>
                    </div>
                  )}

                  {selectedImage && (
                    <div className="mt-4">
                      <img
                        src={selectedImage}
                        alt="Receipt"
                        className="w-full max-h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-600"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Health Profile Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Health Profile
                  </CardTitle>
                  <CardDescription>
                    Manage your health information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={isHealthModalOpen} onOpenChange={setIsHealthModalOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={handleOpenHealthModal}
                        className="w-full"
                        variant="outline"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Update Health Info
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
                      <DialogHeader>
                        <DialogTitle>Health Profile</DialogTitle>
                        <DialogDescription>
                          Update your health information to get personalized recommendations
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div>
                          <Label htmlFor="diagnoses">Diagnoses</Label>
                          <Textarea
                            id="diagnoses"
                            placeholder="Enter your medical diagnoses (one per line)"
                            value={tempHealthProfile.diagnoses.join('\n')}
                            onChange={(e) => setTempHealthProfile(prev => ({
                              ...prev,
                              diagnoses: e.target.value.split('\n').filter(d => d.trim())
                            }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="medications">Medications</Label>
                          <Textarea
                            id="medications"
                            placeholder="Enter your current medications (one per line)"
                            value={tempHealthProfile.medications.join('\n')}
                            onChange={(e) => setTempHealthProfile(prev => ({
                              ...prev,
                              medications: e.target.value.split('\n').filter(m => m.trim())
                            }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="allergies">Allergies</Label>
                          <Textarea
                            id="allergies"
                            placeholder="Enter your allergies (one per line)"
                            value={tempHealthProfile.allergies.join('\n')}
                            onChange={(e) => setTempHealthProfile(prev => ({
                              ...prev,
                              allergies: e.target.value.split('\n').filter(a => a.trim())
                            }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
                          <Textarea
                            id="dietaryRestrictions"
                            placeholder="Enter your dietary restrictions (one per line)"
                            value={tempHealthProfile.dietaryRestrictions.join('\n')}
                            onChange={(e) => setTempHealthProfile(prev => ({
                              ...prev,
                              dietaryRestrictions: e.target.value.split('\n').filter(d => d.trim())
                            }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="healthGoals">Health Goals</Label>
                          <Textarea
                            id="healthGoals"
                            placeholder="Enter your health goals (one per line)"
                            value={tempHealthProfile.healthGoals.join('\n')}
                            onChange={(e) => setTempHealthProfile(prev => ({
                              ...prev,
                              healthGoals: e.target.value.split('\n').filter(g => g.trim())
                            }))}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={handleCancelHealthModal}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveHealthProfile}>
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              {/* AI Model Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    AI Model
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <select
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm"
                  >
                    <option value="openrouter">OpenRouter (Claude)</option>
                    <option value="gemini">Google Gemini</option>
                  </select>
                </CardContent>
              </Card>

              {/* Health Overview Chart */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <PieChart className="w-4 h-4 mr-2" />
                    Health Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Overall Score</span>
                      <Badge variant="secondary">
                        {receipts.length > 0 
                          ? Math.round(receipts.reduce((acc, r) => acc + (r.overallHealthScore || 0), 0) / receipts.length)
                          : 0}%
                      </Badge>
                    </div>
                    <Progress 
                      value={receipts.length > 0 
                        ? Math.round(receipts.reduce((acc, r) => acc + (r.overallHealthScore || 0), 0) / receipts.length)
                        : 0} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{receipts.length}</div>
                      <div className="text-xs text-slate-500">Receipts</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="text-2xl font-bold text-red-500">
                        {receipts.reduce((acc, r) => acc + (r.analysis?.warnings?.length || 0), 0)}
                      </div>
                      <div className="text-xs text-slate-500">Warnings</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ingredient Analysis */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Activity className="w-4 h-4 mr-2" />
                    Ingredient Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {receipts.length > 0 && receipts[0].ingredientAnalysis && receipts[0].ingredientAnalysis.length > 0 ? (
                      receipts[0].ingredientAnalysis.slice(0, 3).map((ingredient, index) => (
                        <div key={index} className="border rounded-lg p-2">
                          <div className="font-medium text-xs text-slate-900 dark:text-slate-100">
                            {ingredient.ingredient}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {ingredient.health_benefits}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        No ingredient analysis available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Overall Health Score */}
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-green-500" />
                    Health Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                      {receipts.length > 0 && receipts[0].overallHealthScore ? receipts[0].overallHealthScore : 0}/100
                    </div>
                    <Progress 
                      value={receipts.length > 0 && receipts[0].overallHealthScore ? receipts[0].overallHealthScore : 0} 
                      className="w-full" 
                    />
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                      {receipts.length > 0 && receipts[0].overallHealthScore ? 
                        (receipts[0].overallHealthScore >= 80 ? 'Excellent nutritional balance' :
                         receipts[0].overallHealthScore >= 60 ? 'Good nutritional balance' :
                         receipts[0].overallHealthScore >= 40 ? 'Fair nutritional balance' :
                         'Needs improvement') : 'No data available'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Receipts */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Recent Receipts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {receipts.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">No receipts scanned yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {receipts.map((receipt) => (
                        <div key={receipt.id} className="flex items-start space-x-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors">
                          <img
                            src={receipt.image}
                            alt="Receipt"
                            className="w-10 h-10 object-cover rounded border border-slate-200 dark:border-slate-600 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="w-2 h-2 bg-slate-600 rounded-full flex-shrink-0"></div>
                              <span className="text-xs text-slate-500">
                                {receipt.timestamp.toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                              {receipt.overallHealthScore || 0}% Health
                            </p>
                            <p className="text-xs text-slate-500">
                              {receipt.analysis?.warnings?.length || 0} warnings
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <div className="border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="main" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Receipt Analysis</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat with Astrea</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center space-x-2">
                  <History className="w-4 h-4" />
                  <span>History</span>
                </TabsTrigger>
                <TabsTrigger value="live" className="flex items-center space-x-2">
                  <Mic className="w-4 h-4" />
                  <span>Gemini Live</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Main Tab Content */}
            <TabsContent value="main" className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  {receipts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center min-h-[400px]">
                      <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                        <Scan className="w-12 h-12 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                        No Receipts Analyzed Yet
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
                        Upload your first receipt to get started with AI-powered health analysis and insights.
                      </p>
                      <Button onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Receipt
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Health Overview Charts */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Nutritional Macronutrients Pie Chart */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <PieChart className="w-5 h-5 mr-2" />
                              Nutritional Macronutrients
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={getNutritionalChartData()}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                  >
                                    {getNutritionalChartData().map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <Tooltip 
                                    formatter={(value: any, name: any, props: any) => [
                                      `${value}${props.payload.unit || ''}`, 
                                      name
                                    ]}
                                  />
                                  <Legend />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Category Distribution */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <Activity className="w-5 h-5 mr-2" />
                              Category Distribution
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={getCategoryChartData()}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" />
                                  <YAxis />
                                  <Tooltip />
                                  <Bar dataKey="value" fill="#3b82f6" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Meal Plan Card - Main Analysis Area */}
                      {receipts.length > 0 && receipts[0].mealPlan && receipts[0].mealPlan.length > 0 && (
                        <Card className="mt-6">
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <Heart className="w-5 h-5 mr-2" />
                              AI Suggested Meal Plan
                            </CardTitle>
                            <CardDescription>
                              Personalized meal suggestions based on your purchases
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                              {receipts[0].mealPlan.map((meal, index) => (
                                <div key={index} className="border rounded-lg p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                                      <Heart className="w-4 h-4 mr-2 text-green-600" />
                                      {meal.name}
                                    </h4>
                                    <div className="flex space-x-2">
                                      <Badge variant="outline" className="text-xs">
                                        {meal.difficulty}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {meal.prep_time}
                                      </Badge>
                                    </div>
                                  </div>
                                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                    {meal.nutrition_benefits}
                                  </p>
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Suggested Uses:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {meal.uses.map((use, useIndex) => (
                                        <Badge key={useIndex} variant="secondary" className="text-xs">
                                          {use}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Red Flags Card */}
                      {receipts.length > 0 && receipts[0].redFlags && receipts[0].redFlags.length > 0 && (
                        <Card className="mt-6">
                          <CardHeader>
                            <CardTitle className="flex items-center text-red-600">
                              <AlertTriangle className="w-5 h-5 mr-2" />
                              Health Red Flags
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {receipts[0].redFlags.map((flag, index) => (
                                <div key={index} className={`border-l-4 pl-4 py-2 rounded-r ${
                                  flag.severity === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                                  flag.severity === 'medium' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' :
                                  'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                                }`}>
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className={`font-semibold ${
                                      flag.severity === 'high' ? 'text-red-800 dark:text-red-200' :
                                      flag.severity === 'medium' ? 'text-orange-800 dark:text-orange-200' :
                                      'text-yellow-800 dark:text-yellow-200'
                                    }`}>
                                      {flag.title}
                                    </h4>
                                    <Badge 
                                      variant={flag.severity === 'high' ? 'destructive' : 
                                              flag.severity === 'medium' ? 'default' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {flag.severity}
                                    </Badge>
                                  </div>
                                  <p className={`text-sm ${
                                    flag.severity === 'high' ? 'text-red-700 dark:text-red-300' :
                                    flag.severity === 'medium' ? 'text-orange-700 dark:text-orange-300' :
                                    'text-yellow-700 dark:text-yellow-300'
                                  }`}>
                                    {flag.detail}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Budget Swaps Card */}
                      {receipts.length > 0 && receipts[0].budgetSwaps && receipts[0].budgetSwaps.length > 0 && (
                        <Card className="mt-6">
                          <CardHeader>
                            <CardTitle className="flex items-center text-green-600">
                              <CheckCircle className="w-5 h-5 mr-2" />
                              Budget-Friendly Swaps
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {receipts[0].budgetSwaps.map((swap, index) => (
                                <div key={index} className="flex items-start space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                      <strong>{swap.item}</strong> → {swap.swap}
                                    </p>
                                    <p className="text-xs text-green-600 dark:text-green-400">
                                      Save: {swap.savings}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Alternative Meal Plan Card */}
                      {receipts.length > 0 && receipts[0].alternativeMealPlan && receipts[0].alternativeMealPlan.length > 0 && (
                        <Card className="mt-6">
                          <CardHeader>
                            <CardTitle className="flex items-center text-blue-600">
                              <Heart className="w-5 h-5 mr-2" />
                              Alternative Meal Plans
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {receipts[0].alternativeMealPlan.map((meal, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                                      {meal.name}
                                    </h4>
                                    <div className="flex space-x-2">
                                      <Badge variant="outline" className="text-xs">
                                        {meal.difficulty}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {meal.prep_time}
                                      </Badge>
                                    </div>
                                  </div>
                                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                    {meal.nutrition_benefits}
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {meal.uses.map((ingredient, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {ingredient}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Suggestions Card */}
                      {receipts.length > 0 && receipts[0].suggestions && receipts[0].suggestions.length > 0 && (
                        <Card className="mt-6">
                          <CardHeader>
                            <CardTitle className="flex items-center text-purple-600">
                              <Zap className="w-5 h-5 mr-2" />
                              Health Suggestions
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {receipts[0].suggestions.map((suggestion, index) => (
                                <div key={index} className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50 dark:bg-purple-900/20">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-semibold text-purple-800 dark:text-purple-200">
                                      {suggestion.title}
                                    </h4>
                                    <Badge 
                                      variant={suggestion.priority === 'high' ? 'destructive' : 
                                              suggestion.priority === 'medium' ? 'default' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {suggestion.priority}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-purple-700 dark:text-purple-300">
                                    {suggestion.description}
                                  </p>
                                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                    Category: {suggestion.category}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Warnings Card */}
                      {receipts.length > 0 && receipts[0].warnings && receipts[0].warnings.length > 0 && (
                        <Card className="mt-6">
                          <CardHeader>
                            <CardTitle className="flex items-center text-orange-600">
                              <AlertTriangle className="w-5 h-5 mr-2" />
                              Important Warnings
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {receipts[0].warnings.map((warning, index) => (
                                <div key={index} className={`border-l-4 pl-4 py-2 rounded-r ${
                                  warning.severity === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                                  warning.severity === 'medium' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' :
                                  'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                                }`}>
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className={`font-semibold ${
                                      warning.severity === 'high' ? 'text-red-800 dark:text-red-200' :
                                      warning.severity === 'medium' ? 'text-orange-800 dark:text-orange-200' :
                                      'text-yellow-800 dark:text-yellow-200'
                                    }`}>
                                      {warning.type}
                                    </h4>
                                    <Badge 
                                      variant={warning.severity === 'high' ? 'destructive' : 
                                              warning.severity === 'medium' ? 'default' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {warning.severity}
                                    </Badge>
                                  </div>
                                  <p className={`text-sm ${
                                    warning.severity === 'high' ? 'text-red-700 dark:text-red-300' :
                                    warning.severity === 'medium' ? 'text-orange-700 dark:text-orange-300' :
                                    'text-yellow-700 dark:text-yellow-300'
                                  }`}>
                                    {warning.message}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Individual Receipt Analysis */}
                      {receipts.map((receipt) => (
                        <Card key={receipt.id} className="overflow-hidden">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <CardTitle className="flex items-center space-x-2 mb-2">
                                  <FileText className="w-5 h-5 flex-shrink-0" />
                                  <span>Receipt Analysis</span>
                                  <Badge variant={receipt.overallHealthScore && receipt.overallHealthScore >= 80 ? "default" : "destructive"}>
                                    {receipt.overallHealthScore || 0}%
                                  </Badge>
                                </CardTitle>
                                <CardDescription>
                                  Scanned on {receipt.timestamp.toLocaleString()}
                                </CardDescription>
                              </div>
                              <img
                                src={receipt.image}
                                alt="Receipt"
                                className="w-20 h-20 object-cover rounded border border-slate-200 dark:border-slate-600 flex-shrink-0 ml-4"
                              />
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {/* Items List */}
                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm">Items Purchased</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {receipt.items.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                      <div className="flex items-center space-x-2">
                                        <Badge variant="outline" className="text-xs">
                                          {item.category}
                                        </Badge>
                                        <span className="text-sm text-slate-900 dark:text-slate-100">{item.name}</span>
                                      </div>
                                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">${item.price.toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>

                            {/* Warnings and Suggestions Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Warnings */}
                              {(receipt.analysis?.warnings?.length || 0) > 0 && (
                                <Card className="border-red-200 dark:border-red-800">
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center text-red-600 dark:text-red-400">
                                      <AlertTriangle className="w-4 h-4 mr-2" />
                                      Warnings ({receipt.analysis?.warnings?.length || 0})
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                      {(receipt.analysis?.warnings || []).map((warning, index) => (
                                        <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                          <p className="text-sm text-red-800 dark:text-red-200">{typeof warning === 'string' ? warning : warning.message}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              )}

                              {/* Suggestions */}
                              {(receipt.analysis?.suggestions?.length || 0) > 0 && (
                                <Card className="border-green-200 dark:border-green-800">
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center text-green-600 dark:text-green-400">
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Suggestions ({receipt.analysis?.suggestions?.length || 0})
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                      {(receipt.analysis?.suggestions || []).map((suggestion, index) => (
                                        <div key={index} className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                          <p className="text-sm text-green-800 dark:text-green-200">{typeof suggestion === 'string' ? suggestion : suggestion.description}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </div>

                            {/* Raw Text */}
                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm">Extracted Text</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="max-h-64 overflow-y-auto">
                                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono">
                                      {receipt.text}
                                    </pre>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Chat Tab Content */}
            <TabsContent value="chat" className="flex-1 flex flex-col min-h-0">
              {/* Chat Messages Container */}
              <div className="flex-1 flex flex-col min-h-0">
                {messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center">
                      <MessageCircle className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                        Start a conversation with Astrea
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        Ask about your receipt data, get nutrition advice, or discuss your health goals.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                      {messages.map((message: any) => (
                        <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-lg px-4 py-3 ${
                            message.role === 'user' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                          }`}>
                            {message.role === 'assistant' && (
                              <div className="flex items-center space-x-2 mb-2">
                                <Bot className="w-4 h-4" />
                                <span className="text-sm font-medium">Astrea</span>
                              </div>
                            )}
                            <div className="text-sm">
                              {message.role === 'assistant' ? (
                                <ReactMarkdown 
                                  components={{
                                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                    ul: ({ children }) => <ul className="mb-2 list-disc list-inside space-y-1">{children}</ul>,
                                    ol: ({ children }) => <ol className="mb-2 list-decimal list-inside space-y-1">{children}</ol>,
                                    li: ({ children }) => <li className="mb-1">{children}</li>,
                                    strong: ({ children }) => <strong className="font-semibold text-slate-900 dark:text-slate-100">{children}</strong>,
                                    em: ({ children }) => <em className="italic">{children}</em>,
                                    code: ({ children }) => <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                                    pre: ({ children }) => <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-xs overflow-x-auto my-2">{children}</pre>,
                                    blockquote: ({ children }) => <blockquote className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 italic my-2 text-slate-600 dark:text-slate-400">{children}</blockquote>,
                                    h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-slate-900 dark:text-slate-100">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-slate-900 dark:text-slate-100">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-slate-900 dark:text-slate-100">{children}</h3>,
                                    h4: ({ children }) => <h4 className="text-sm font-semibold mb-1 text-slate-800 dark:text-slate-200">{children}</h4>,
                                    a: ({ children, href }) => <a href={href} className="text-blue-500 hover:text-blue-600 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                                    table: ({ children }) => <table className="w-full border-collapse border border-slate-300 dark:border-slate-600 my-2">{children}</table>,
                                    th: ({ children }) => <th className="border border-slate-300 dark:border-slate-600 px-2 py-1 bg-slate-100 dark:bg-slate-700 text-left font-semibold">{children}</th>,
                                    td: ({ children }) => <td className="border border-slate-300 dark:border-slate-600 px-2 py-1">{children}</td>,
                                  }}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              ) : (
                                message.content
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="max-w-[80%] rounded-lg px-4 py-3 bg-slate-100 dark:bg-slate-800">
                            <div className="flex items-center space-x-2">
                              <Bot className="w-4 h-4 text-green-500" />
                              <span className="text-sm font-medium">Astrea</span>
                            </div>
                            <div className="mt-2 flex items-center space-x-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-slate-500 text-sm">Thinking...</span>
                            </div>
                          </div>
                        </div>
                        )}
                        {/* Auto-scroll target */}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>
                  )}
                </div>

              {/* Chat Input */}
              <div className="p-6 border-t">
                <form onSubmit={handleSubmit} className="flex items-end space-x-2">
                  <Textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask Astrea about your receipt data..."
                    className="flex-1 min-h-[60px] resize-none"
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading || !input.trim()}
                    className="px-4 py-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* History Tab Content */}
            <TabsContent value="history" className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Analysis History</h2>
                    <p className="text-slate-600 dark:text-slate-400">View your past receipt analyses and health insights</p>
                  </div>

                  {analysisHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <History className="w-16 h-16 text-slate-400 mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No Analysis History</h3>
                      <p className="text-slate-600 dark:text-slate-400">Upload some receipts to see your analysis history here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {analysisHistory.map((analysis, index) => (
                        <Card key={analysis.metadata?.analysis_id || index} className="overflow-hidden">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <CardTitle className="flex items-center space-x-2 mb-2">
                                  <FileText className="w-5 h-5 flex-shrink-0" />
                                  <span>Analysis #{analysis.metadata?.analysis_id || 'Unknown'}</span>
                                  <Badge variant={analysis.health_analysis?.health_score >= 80 ? "default" : "destructive"}>
                                    {analysis.health_analysis?.health_score || 0}%
                                  </Badge>
                                </CardTitle>
                                <CardDescription>
                                  {analysis.store_name || 'Unknown Store'} • {analysis.date} at {analysis.time}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Items List */}
                            <div>
                              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">Items Analyzed</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {analysis.receipt_data?.items?.map((item: any, itemIndex: number) => (
                                  <div key={itemIndex} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                      <Badge variant="outline" className="text-xs">
                                        {item.category || 'general'}
                                      </Badge>
                                      <span className="text-sm text-slate-900 dark:text-slate-100">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">${item.price?.toFixed(2) || '0.00'}</span>
                                  </div>
                                )) || []}
                              </div>
                            </div>

                            {/* Health Analysis Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                  {analysis.health_analysis?.warnings?.length || 0}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">Warnings</div>
                              </div>
                              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                  {analysis.health_analysis?.suggestions?.length || 0}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">Suggestions</div>
                              </div>
                              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                  {analysis.receipt_data?.items?.length || 0}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">Items</div>
                              </div>
                            </div>

                            {/* Key Warnings */}
                            {analysis.health_analysis?.warnings?.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">Key Warnings</h4>
                                <div className="space-y-2">
                                  {analysis.health_analysis.warnings.slice(0, 3).map((warning: string, warningIndex: number) => (
                                    <div key={warningIndex} className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-200">
                                      {warning}
                                    </div>
                                  ))}
                                  {analysis.health_analysis.warnings.length > 3 && (
                                    <div className="text-sm text-slate-500">
                                      +{analysis.health_analysis.warnings.length - 3} more warnings
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Gemini Live Tab Content */}
            <TabsContent value="live" className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Gemini Live Audio Conversation</h2>
                    <p className="text-slate-600 dark:text-slate-400">Have a real-time audio-to-audio conversation with Astrea about your receipt data</p>
                  </div>

                  {/* Connection Controls */}
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Mic className="w-5 h-5 mr-2" />
                        Gemini Live Connection
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <Button
                            onClick={isConnected ? disconnectFromGeminiLive : connectToGeminiLive}
                            className={`flex items-center space-x-2 ${
                              isConnected 
                                ? 'bg-red-500 hover:bg-red-600' 
                                : 'bg-green-500 hover:bg-green-600'
                            }`}
                          >
                            {isConnected ? (
                              <>
                                <MicOff className="w-4 h-4" />
                                <span>Disconnect</span>
                              </>
                            ) : (
                              <>
                                <Mic className="w-4 h-4" />
                                <span>Connect to Gemini Live</span>
                              </>
                            )}
                          </Button>
                          
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {isConnected ? 'Connected to Gemini Live' : 'Disconnected'}
                            </span>
                          </div>
                        </div>

                        {isConnected && (
                          <div className="space-y-4">
                            {/* Audio Control Buttons */}
                            <div className="flex items-center space-x-4">
                              <Button
                                onClick={isRecording ? stopRecording : startRecording}
                                disabled={isProcessing}
                                className={`flex items-center space-x-2 ${
                                  isRecording 
                                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                                    : isProcessing
                                    ? 'bg-yellow-500 hover:bg-yellow-600 animate-pulse'
                                    : 'bg-blue-500 hover:bg-blue-600'
                                }`}
                              >
                                {isRecording ? (
                                  <>
                                    <MicOff className="w-4 h-4" />
                                    <span>Stop Recording</span>
                                  </>
                                ) : isProcessing ? (
                                  <>
                                    <Mic className="w-4 h-4" />
                                    <span>Processing...</span>
                                  </>
                                ) : (
                                  <>
                                    <Mic className="w-4 h-4" />
                                    <span>Start Recording</span>
                                  </>
                                )}
                              </Button>

                              <Button
                                onClick={stopAudio}
                                disabled={!isPlaying}
                                className={`flex items-center space-x-2 ${
                                  isPlaying 
                                    ? 'bg-orange-500 hover:bg-orange-600' 
                                    : 'bg-slate-400 hover:bg-slate-500'
                                }`}
                              >
                                <Volume2 className="w-4 h-4" />
                                <span>Stop Audio</span>
                              </Button>
                            </div>

                            {/* Status Display */}
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${
                                isRecording ? 'bg-red-500 animate-pulse' : 
                                isProcessing ? 'bg-yellow-500 animate-pulse' : 
                                isPlaying ? 'bg-green-500 animate-pulse' : 
                                'bg-slate-400'
                              }`}></div>
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                {isRecording ? 'Recording...' : 
                                 isProcessing ? 'Processing audio...' : 
                                 isPlaying ? 'Astrea is speaking...' : 
                                 'Ready to record'}
                              </span>
                            </div>

                            {/* Current Speech Display */}
                            {currentSpeech && (
                              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Astrea is saying:</p>
                                <p className="text-slate-900 dark:text-slate-100 italic">"{currentSpeech}"</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Audio Visualizer */}
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Mic className="w-5 h-5 mr-2" />
                        Audio Visualizer
                      </CardTitle>
                      <CardDescription>
                        Real-time audio visualization - speak naturally and see the audio response
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Audio Visualizer */}
                        <AudioVisualizer />
                        
                        {/* Instructions */}
                        <div className="text-center py-4 text-slate-500">
                          <Mic className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                          <p className="text-sm">
                            {!isConnected ? 'Connect to start your audio conversation with Astrea' :
                             isRecording ? 'Speak now - your voice is being recorded' :
                             isProcessing ? 'Processing your audio...' :
                             isPlaying ? 'Astrea is responding...' :
                             'Click "Start Recording" to begin speaking'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Current Receipt Context */}
                  {receipts.length > 0 && (
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <FileText className="w-5 h-5 mr-2" />
                          Current Receipt Context
                        </CardTitle>
                        <CardDescription>
                          This data will be available to Gemini during your conversation
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-slate-900 dark:text-slate-100">Store: {receipts[0].text.split('\n')[0] || 'Unknown'}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {receipts[0].items.length} items • Total: ${receipts[0].items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {receipts[0].items.slice(0, 8).map((item, index) => (
                              <div key={index} className="p-2 bg-slate-50 dark:bg-slate-800 rounded text-xs">
                                <div className="font-medium">{item.name}</div>
                                <div className="text-slate-500">${item.price.toFixed(2)}</div>
                              </div>
                            ))}
                            {receipts[0].items.length > 8 && (
                              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded text-xs text-center">
                                +{receipts[0].items.length - 8} more
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}