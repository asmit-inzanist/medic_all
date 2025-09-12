import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Mic, Upload, History, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your AI Health Assistant. I can help you with symptom analysis, health advice, and medical information. Please note that I'm not a replacement for professional medical care. How can I assist you today?",
      timestamp: new Date(),
      suggestions: [
        "I have a headache",
        "Check my symptoms",
        "Medication reminders",
        "Health tips"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const responses = {
      headache: "I understand you're experiencing a headache. Here are some initial suggestions:\n\n• Stay hydrated (drink water)\n• Rest in a quiet, dark room\n• Apply a cold or warm compress\n• Consider over-the-counter pain relief\n\n⚠️ **Seek immediate medical attention if:**\n• Sudden, severe headache unlike any before\n• Headache with fever, stiff neck, or rash\n• Headache after head injury\n\nWould you like me to help you find nearby healthcare providers?",
      symptoms: "I'd be happy to help analyze your symptoms. Please tell me:\n\n1. What specific symptoms are you experiencing?\n2. When did they start?\n3. How severe are they (1-10 scale)?\n4. Any recent changes in medication or activities?\n\nThis information will help me provide better guidance. Remember, this is for informational purposes only.",
      medication: "I can help you with medication reminders and information. Please tell me:\n\n• What medications do you currently take?\n• Do you need help setting up reminders?\n• Are you experiencing any side effects?\n\n💊 **Important:** Always consult your healthcare provider before making changes to your medication routine.",
      default: "Thank you for your question. I'm here to help with health-related information and guidance. Could you please provide more details about your specific concern? The more information you share, the better I can assist you.\n\n🏥 **Remember:** For urgent medical issues, please contact emergency services or visit your nearest healthcare facility."
    };

    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('headache') || lowerMessage.includes('head pain')) {
      return responses.headache;
    } else if (lowerMessage.includes('symptom') || lowerMessage.includes('feel sick') || lowerMessage.includes('not well')) {
      return responses.symptoms;
    } else if (lowerMessage.includes('medication') || lowerMessage.includes('medicine') || lowerMessage.includes('pill')) {
      return responses.medication;
    } else {
      return responses.default;
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Simulate AI response
      const response = await simulateResponse(content);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response,
        timestamp: new Date(),
        suggestions: [
          "Find nearby doctors",
          "Emergency contacts",
          "More health tips",
          "Medication reminders"
        ]
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "I'm sorry, I encountered an error. Please try again or contact support if the issue persists.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { text: "I have a headache", icon: "🤕" },
    { text: "Check medication interactions", icon: "💊" },
    { text: "Symptom checker", icon: "🩺" },
    { text: "Find nearby doctor", icon: "👨‍⚕️" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-primary/10 rounded-lg mr-4">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">AI Health Assistant</h1>
              <p className="text-muted-foreground">Your 24/7 healthcare companion for health guidance and support</p>
            </div>
          </div>
          
          {/* Disclaimer */}
          <Card className="border-warning/20 bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                <div className="text-sm">
                  <p className="text-warning font-medium mb-1">Medical Disclaimer</p>
                  <p className="text-muted-foreground">
                    This AI assistant provides general health information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical concerns.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <Card className="h-[600px] flex flex-col">
          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    {message.type === 'bot' ? (
                      <div className="bg-primary/10 flex items-center justify-center w-full h-full">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    ) : (
                      <div className="bg-secondary flex items-center justify-center w-full h-full">
                        <User className="h-4 w-4 text-secondary-foreground" />
                      </div>
                    )}
                  </Avatar>

                  <div className={`flex-1 max-w-[80%] ${message.type === 'user' ? 'text-right' : ''}`}>
                    <div
                      className={`inline-block p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    </div>
                    
                    <div className={`text-xs text-muted-foreground mt-1 ${
                      message.type === 'user' ? 'text-right' : ''
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {/* Suggestions */}
                    {message.suggestions && message.type === 'bot' && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => handleSendMessage(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <div className="bg-primary/10 flex items-center justify-center w-full h-full">
                      <Bot className="h-4 w-4 text-primary animate-pulse" />
                    </div>
                  </Avatar>
                  <div className="bg-secondary text-secondary-foreground p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          <div className="p-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 justify-start"
                  onClick={() => handleSendMessage(action.text)}
                >
                  <span className="mr-1">{action.icon}</span>
                  {action.text}
                </Button>
              ))}
            </div>

            {/* Input */}
            <div className="flex space-x-2">
              <Button variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Mic className="h-4 w-4" />
              </Button>
              <div className="flex-1 flex space-x-2">
                <Input
                  placeholder="Type your health question or describe your symptoms..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage(inputValue)}
                  disabled={isLoading}
                />
                <Button 
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim() || isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="text-center p-6">
            <History className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Health History</h3>
            <p className="text-muted-foreground mb-4">Track your medical history and share with doctors</p>
            <Button variant="outline">View History</Button>
          </Card>

          <Card className="text-center p-6">
            <Bot className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Symptom Checker</h3>
            <p className="text-muted-foreground mb-4">Advanced AI-powered symptom analysis and recommendations</p>
            <Button variant="outline">Start Check</Button>
          </Card>

          <Card className="text-center p-6">
            <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Emergency Guide</h3>
            <p className="text-muted-foreground mb-4">Quick access to emergency procedures and contacts</p>
            <Button variant="outline">View Guide</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;