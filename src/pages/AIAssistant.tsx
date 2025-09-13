import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Mic, Upload, History, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const AIAssistant = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize messages with translation
  useEffect(() => {
    setMessages([{
      id: '1',
      type: 'bot',
      content: t('aiAssistant.initialMessage'),
      timestamp: new Date(),
      suggestions: [
        t('aiAssistant.suggestions.headache'),
        t('aiAssistant.suggestions.checkSymptoms'),
        t('aiAssistant.suggestions.medicationReminders'),
        t('aiAssistant.suggestions.healthTips')
      ]
    }]);
  }, [t]); // Re-run when translations change

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const callGeminiAPI = async (userMessage: string): Promise<string> => {
    try {
      console.log('🚀 Frontend: Calling AI with message:', userMessage);
      
      // Get user profile data for personalization
      let userProfile = null;
      if (user) {
        console.log('👤 Frontend: Getting user profile...');
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        userProfile = profile;
        console.log('👤 Frontend: User profile retrieved:', !!userProfile);
      }

      console.log('📡 Frontend: Calling Supabase function...');
      
      // Check if this is the first user message (after the initial bot greeting)
      const userMessages = messages.filter(m => m.type === 'user');
      const isFirstUserMessage = userMessages.length === 0;
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: userMessage,
          userProfile: userProfile,
          isFirstMessage: isFirstUserMessage,
          conversationHistory: messages.slice(-4) // Send last 4 messages for context
        }
      });

      console.log('📡 Frontend: Function response:', { data, error });

      if (error) {
        console.error('❌ Frontend: Function error:', error);
        return getFallbackResponse(userMessage);
      }

      if (data && data.response) {
        console.log('✅ Frontend: Successfully got AI response');
        return data.response;
      } else {
        console.log('⚠️ Frontend: No response from function, using fallback');
        return getFallbackResponse(userMessage);
      }
    } catch (error) {
      console.error('💥 Frontend: Error in callGeminiAPI:', error);
      return getFallbackResponse(userMessage);
    }
  };

  const getFallbackResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('back pain') || lowerMessage.includes('backache')) {
      return "I understand you're experiencing back pain. Here are some general recommendations:\n\n• Rest and avoid activities that worsen the pain\n• Apply ice for acute pain or heat for muscle tension\n• Gentle stretching and movement as tolerated\n• Over-the-counter pain relievers as directed\n\n⚠️ **Seek medical attention if:**\n• Pain is severe or getting worse\n• Pain radiates down your leg\n• You experience numbness or weakness\n• Pain follows an injury\n\nWould you like help finding nearby healthcare providers?";
    } else if (lowerMessage.includes('headache') || lowerMessage.includes('head pain')) {
      return "I understand you're experiencing a headache. Here are some initial suggestions:\n\n• Stay hydrated (drink water)\n• Rest in a quiet, dark room\n• Apply a cold or warm compress\n• Consider over-the-counter pain relief\n\n⚠️ **Seek immediate medical attention if:**\n• Sudden, severe headache unlike any before\n• Headache with fever, stiff neck, or rash\n• Headache after head injury\n\nWould you like me to help you find nearby healthcare providers?";
    } else if (lowerMessage.includes('symptom') || lowerMessage.includes('feel sick') || lowerMessage.includes('not well')) {
      return "I'd be happy to help analyze your symptoms. Please tell me:\n\n1. What specific symptoms are you experiencing?\n2. When did they start?\n3. How severe are they (1-10 scale)?\n4. Any recent changes in medication or activities?\n\nThis information will help me provide better guidance. Remember, this is for informational purposes only.";
    } else {
      return "Thank you for your question. I'm here to help with health-related information and guidance. Could you please provide more details about your specific concern?\n\n🏥 **Remember:** For urgent medical issues, please contact emergency services or visit your nearest healthcare facility.\n\nI'm currently experiencing some technical difficulties, but I'm working to provide you with the best possible assistance.";
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
      // Call Gemini AI through Supabase Edge Function
      const response = await callGeminiAPI(content);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response,
        timestamp: new Date(),
        suggestions: [
          t('aiAssistant.suggestions.findDoctors'),
          t('aiAssistant.suggestions.emergencyContacts'),
          t('aiAssistant.suggestions.moreHealthTips'),
          t('aiAssistant.suggestions.medicationReminders')
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
    { text: t('aiAssistant.suggestions.headache'), icon: "🤕" },
    { text: "Check medication interactions", icon: "💊" },
    { text: t('aiAssistant.suggestions.checkSymptoms'), icon: "🩺" },
    { text: t('aiAssistant.suggestions.findDoctors'), icon: "👨‍⚕️" }
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
              <h1 className="text-3xl font-bold text-foreground">{t('aiAssistant.title')}</h1>
              <p className="text-muted-foreground">{t('aiAssistant.subtitle')}</p>
            </div>
          </div>
          
          {/* Disclaimer */}
          <Card className="border-warning/20 bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                <div className="text-sm">
                  <p className="text-warning font-medium mb-1">{t('aiAssistant.disclaimer')}</p>
                  <p className="text-muted-foreground">
                    {t('aiAssistant.disclaimerText')}
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
                  placeholder={t('aiAssistant.placeholder')}
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
            <h3 className="text-lg font-semibold mb-2">{t('aiAssistant.quickInfo.healthHistory')}</h3>
            <p className="text-muted-foreground mb-4">{t('aiAssistant.quickInfo.healthHistoryDesc')}</p>
            <Button variant="outline">{t('aiAssistant.quickInfo.viewHistory')}</Button>
          </Card>

          <Card className="text-center p-6">
            <Bot className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('aiAssistant.quickInfo.symptomChecker')}</h3>
            <p className="text-muted-foreground mb-4">{t('aiAssistant.quickInfo.symptomCheckerDesc')}</p>
            <Button variant="outline">{t('aiAssistant.quickInfo.startCheck')}</Button>
          </Card>

          <Card className="text-center p-6">
            <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('aiAssistant.quickInfo.emergencyGuide')}</h3>
            <p className="text-muted-foreground mb-4">{t('aiAssistant.quickInfo.emergencyGuideDesc')}</p>
            <Button variant="outline">{t('aiAssistant.quickInfo.viewGuide')}</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;