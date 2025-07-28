'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Bot, User, ChevronDown, Sun, Moon, Paperclip, X, FileText } from 'lucide-react';
import { PDFProcessingResult } from '@/lib/pdfProcessor';

type Message = {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: Date;
  pdfContext?: string;
};

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [uploadedPDF, setUploadedPDF] = useState<PDFProcessingResult | null>(null);
  const [isProcessingPDF, setIsProcessingPDF] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
    // Focus input field when component first mounts
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
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

  useEffect(() => {
    // Focus input field when loading stops (AI response completed)
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file only.');
      return;
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('PDF file is too large. Please upload a file smaller than 10MB.');
      return;
    }

    setIsProcessingPDF(true);
    try {
      // Dynamic import to avoid SSR issues with PDF.js
      const { extractTextFromPDFClient } = await import('@/components/PDFProcessor.client');
      const pdfResult = await extractTextFromPDFClient(file);
      setUploadedPDF(pdfResult);
      
      // Add a system message to show PDF was uploaded
      const pdfMessage: Message = {
        id: Date.now().toString(),
        sender: 'bot',
        content: `📄 PDF uploaded successfully! "${pdfResult.fileName}" (${pdfResult.pageCount} pages)\n\nI can now answer questions about this document. What would you like to know?`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, pdfMessage]);
    } catch (error) {
      console.error('PDF processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process PDF. Please try again.';
      alert(errorMessage);
      
      // Add error message to chat
      const errorChatMessage: Message = {
        id: Date.now().toString(),
        sender: 'bot',
        content: `❌ Failed to process PDF: ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorChatMessage]);
    } finally {
      setIsProcessingPDF(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePDF = () => {
    setUploadedPDF(null);
    const removeMessage: Message = {
      id: Date.now().toString(),
      sender: 'bot',
      content: '📄 PDF document removed. I no longer have access to the document content.',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, removeMessage]);
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
          conversationHistory: messages,
          pdfContext: uploadedPDF ? {
            text: uploadedPDF.text,
            fileName: uploadedPDF.fileName,
            pageCount: uploadedPDF.pageCount
          } : null
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

      // Enhanced logging with model information
      if (data.apiUsed === 'sonar') {
        console.log(`💡 Response generated using ${data.modelUsed} via Perplexity Pro`);
      } else {
        console.log(`💡 Response generated using ${data.modelUsed}`);
      }

      setMessages(prev => [...prev, botReply]);
    } catch (error) {
      console.error('Error:', error);
      
      let errorContent = 'Sorry, I encountered an error. Please try again.';
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('Both Gemini and Sonar APIs are unavailable')) {
          errorContent = '🚫 All AI services are currently unavailable. Please try again in a few minutes.';
        } else if (error.message.includes('quota exceeded')) {
          errorContent = '⏳ API usage limit reached. Trying backup services...';
        } else if (error.message.includes('overloaded')) {
          errorContent = '🔧 AI service is busy. Switching to backup service...';
        }
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        content: errorContent,
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
            
            {/* PDF Upload Section */}
            {uploadedPDF && (
              <div className="flex items-center gap-2 mr-3 bg-white/20 rounded-lg px-2 py-1">
                <FileText className="w-4 h-4" />
                <span className="text-xs max-w-20 truncate">{uploadedPDF.fileName}</span>
                <Button
                  onClick={handleRemovePDF}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-white hover:bg-white/20"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
            
            {/* PDF Upload Button */}
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 transition-colors duration-200"
              disabled={isProcessingPDF}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            
            {/* Dark Mode Toggle */}
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
            
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
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
              
              {isProcessingPDF && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div className={`rounded-2xl px-4 py-3 transition-colors duration-300 ${
                    isMounted && isDarkMode 
                      ? 'bg-gray-700 border border-gray-600' 
                      : 'bg-gray-100 border border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-200"></div>
                      </div>
                      <span className={`text-sm ${isMounted && isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Processing PDF...
                      </span>
                    </div>
                  </div>
                </div>
              )}

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
            {/* PDF Status Bar */}
            {uploadedPDF && (
              <div className={`flex items-center gap-2 mb-3 p-2 rounded-lg transition-colors duration-300 ${
                isMounted && isDarkMode 
                  ? 'bg-gray-700 border border-gray-600' 
                  : 'bg-blue-50 border border-blue-200'
              }`}>
                <FileText className={`w-4 h-4 ${isMounted && isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={`text-sm ${isMounted && isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  📄 {uploadedPDF.fileName} ({uploadedPDF.pageCount} pages) - Ready to answer questions
                </span>
                <Button
                  onClick={handleRemovePDF}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 ml-auto"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
            
            <div className="flex gap-2">
              <Input
                ref={inputRef}
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
