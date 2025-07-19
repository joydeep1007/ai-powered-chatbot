'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Bot, User, ChevronDown, Sun, Moon } from 'lucide-react';

type Message = {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: Date;
};

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only auto-scroll if user is at the bottom
    if (isAtBottom && scrollAreaRef.current) {
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages, isAtBottom]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const bottomThreshold = 50; // pixels from bottom
    const isNearBottom = scrollHeight - scrollTop - clientHeight < bottomThreshold;
    
    setIsAtBottom(isNearBottom);
    setShowScrollToBottom(!isNearBottom && messages.length > 0);
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
    setIsAtBottom(true);
    setShowScrollToBottom(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage.content,
          conversationHistory: messages
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botReply]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className={`flex items-center justify-center min-h-screen p-4 transition-colors duration-300 ${
      isMounted && isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <Card className={`w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl transition-colors duration-300 ${
        isMounted && isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <CardHeader className={`text-white rounded-t-lg transition-colors duration-300 ${
          isMounted && isDarkMode 
            ? 'bg-gradient-to-r from-gray-700 to-gray-600' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-600'
        }`}>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Bot className="w-6 h-6" />
            Gubluxxy
            <span className="text-sm font-normal opacity-80 ml-auto mr-3">
              Powered by Gemini
            </span>
            {isMounted && (
              <Button
                onClick={toggleDarkMode}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 transition-colors duration-200"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex flex-col flex-1 overflow-hidden p-0 relative">
          <div 
            className={`flex-1 overflow-y-auto p-4 scroll-smooth transition-colors duration-300 ${
              isMounted && isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
            onScroll={handleScroll}
            ref={scrollAreaRef}
          >
            <div className="flex flex-col gap-4">
              {messages.length === 0 && (
                <div className={`text-center py-8 transition-colors duration-300 ${
                  isMounted && isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Welcome to Gubluxxy AI!</p>
                  <p className="text-sm">Start a conversation by typing a message below.</p>
                </div>
              )}
              
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[70%] px-4 py-3 rounded-2xl transition-colors duration-300 ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                        : isMounted && isDarkMode 
                          ? 'bg-gray-700 text-gray-100 border border-gray-600'
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>
                    <div
                      className={`text-xs mt-2 opacity-70 transition-colors duration-300 ${
                        msg.sender === 'user' 
                          ? 'text-blue-100' 
                          : isMounted && isDarkMode 
                            ? 'text-gray-400' 
                            : 'text-gray-500'
                      }`}
                    >
                      {isMounted ? formatTime(msg.timestamp) : ''}
                    </div>
                  </div>
                  
                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className={`rounded-2xl px-4 py-3 transition-colors duration-300 ${
                    isMounted && isDarkMode 
                      ? 'bg-gray-700 border border-gray-600' 
                      : 'bg-gray-100 border border-gray-200'
                  }`}>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={scrollRef} />
            </div>
          </div>

          {/* Scroll to bottom button */}
          {showScrollToBottom && (
            <Button
              onClick={scrollToBottom}
              className="absolute bottom-20 right-6 w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-all duration-200 z-10"
              size="sm"
            >
              <ChevronDown className="w-5 h-5" />
            </Button>
          )}

          <div className={`border-t p-4 transition-colors duration-300 ${
            isMounted && isDarkMode 
              ? 'bg-gray-800 border-gray-600' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={isLoading}
                className={`flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                  isMounted && isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
              <Button 
                onClick={handleSend} 
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all duration-200"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
