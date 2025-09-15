import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Mic, MicOff, Upload, History, AlertCircle, Languages, X, FileText, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  attachments?: UploadedFile[];
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string; // base64 or text content
  preview?: string; // thumbnail for images
}

// Speech Recognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

const AIAssistant = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Supported languages for speech recognition
  const supportedLanguages = [
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'hi-IN', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
    { code: 'pa-IN', name: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳' }
  ];

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = selectedLanguage;
        
        recognitionRef.current.onstart = () => {
          setIsRecording(true);
        };
        
        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(transcript);
          setIsTranscribing(false);
        };
        
        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event);
          setIsRecording(false);
          setIsTranscribing(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsRecording(false);
          setIsTranscribing(false);
        };
      }
    }
  }, [selectedLanguage]);

  const handleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setIsTranscribing(true);
      recognitionRef.current.start();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingFile(true);
    
    Array.from(files).forEach((file) => {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/webp',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        alert(`File type ${file.type} is not supported. Please upload PDF, images, or text files.`);
        setIsProcessingFile(false);
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size should be less than 10MB');
        setIsProcessingFile(false);
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const newFile: UploadedFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          content: content,
          preview: file.type.startsWith('image/') ? content : undefined
        };

        setUploadedFiles(prev => [...prev, newFile]);
        setIsProcessingFile(false);
      };

      reader.onerror = () => {
        alert('Error reading file');
        setIsProcessingFile(false);
      };

      // Read file based on type
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else if (file.type === 'text/plain') {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file); // For PDFs and other docs
      }
    });

    // Reset file input
    if (event.target) {
      event.target.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

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

  const callGeminiAPI = async (userMessage: string, attachments?: any[]): Promise<string> => {
    try {
      console.log('🚀 Frontend: Calling AI with message:', userMessage);
      console.log('📎 Frontend: Attachments count:', attachments?.length || 0);
      
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
          conversationHistory: messages.slice(-4), // Send last 4 messages for context
          attachments: attachments || []
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

    // Add user message with attachments
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
      attachments: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare attachments for API
      const attachmentsForAPI = uploadedFiles.map(file => ({
        name: file.name,
        mimeType: file.type,
        base64Data: file.content?.split(',')[1] // Remove data:image/jpeg;base64, prefix
      }));

      // Call Gemini AI through Supabase Edge Function with attachments
      const response = await callGeminiAPI(content, attachmentsForAPI);
      
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
      
      // Clear uploaded files after successful message
      setUploadedFiles([]);
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
                      
                      {/* Display attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-current/20">
                          <div className="text-xs opacity-75 mb-2">📎 Attachments ({message.attachments.length})</div>
                          <div className="flex flex-wrap gap-1">
                            {message.attachments.map((file) => (
                              <div key={file.id} className="flex items-center space-x-1 bg-black/10 rounded px-2 py-1">
                                {file.type.startsWith('image/') ? (
                                  file.preview && (
                                    <img 
                                      src={file.preview} 
                                      alt={file.name}
                                      className="w-4 h-4 object-cover rounded"
                                    />
                                  )
                                ) : (
                                  <FileText className="w-4 h-4" />
                                )}
                                <span className="text-xs truncate max-w-20">{file.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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

            {/* Uploaded Files Preview */}
            {uploadedFiles.length > 0 && (
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Uploaded Documents ({uploadedFiles.length})</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setUploadedFiles([])}
                    className="text-xs h-6"
                  >
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="relative group">
                      <div className="flex items-center space-x-2 bg-background p-2 rounded border">
                        {file.type.startsWith('image/') ? (
                          <div className="relative">
                            <img 
                              src={file.preview} 
                              alt={file.name}
                              className="w-8 h-8 object-cover rounded"
                            />
                            <ImageIcon className="w-3 h-3 absolute -top-1 -right-1 bg-background rounded-full p-0.5" />
                          </div>
                        ) : (
                          <FileText className="w-8 h-8 text-muted-foreground" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate max-w-24">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(1)}KB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="flex space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.doc,.docx"
                className="hidden"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={triggerFileUpload}
                disabled={isProcessingFile}
                title="Upload medical documents"
              >
                <Upload className={`h-4 w-4 ${isProcessingFile ? 'animate-pulse' : ''}`} />
              </Button>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-32">
                  <SelectValue>
                    <div className="flex items-center space-x-1">
                      <Languages className="h-3 w-3" />
                      <span className="text-xs">
                        {supportedLanguages.find(lang => lang.code === selectedLanguage)?.flag}
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {supportedLanguages.map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      <div className="flex items-center space-x-2">
                        <span>{language.flag}</span>
                        <span>{language.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleVoiceRecording}
                disabled={isLoading}
                className={isRecording ? "bg-red-100 text-red-600" : ""}
                title={`Record in ${supportedLanguages.find(lang => lang.code === selectedLanguage)?.name}`}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
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