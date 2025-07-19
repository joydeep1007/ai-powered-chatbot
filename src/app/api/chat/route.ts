import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, pdfContext } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check if the user is asking about the chatbot's name
    const nameQuestions = [
      'what is your name',
      'what\'s your name',
      'tell me your name',
      'who are you',
      'what are you called',
      'your name'
    ];
    
    const isNameQuestion = nameQuestions.some(question => 
      message.toLowerCase().includes(question)
    );

    if (isNameQuestion) {
      return NextResponse.json({ response: 'My name is Gubluxxy!' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Build conversation context (limit to last 10 messages to prevent token overflow)
    let conversationContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
      const recentMessages = conversationHistory.slice(-10); // Keep last 10 messages
      conversationContext = recentMessages
        .map((msg: any) => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n') + '\n';
    }
    
    // Add system context to help the AI know its identity
    let systemContext = 'You are Gubluxxy, an AI assistant powered by Gemini. ';
    
    // Add PDF context if available
    if (pdfContext) {
      systemContext += `You have access to a PDF document "${pdfContext.fileName}" (${pdfContext.pageCount} pages). Use this document to answer questions when relevant. Here's the document content:\n\n${pdfContext.text}\n\n`;
    }
    
    systemContext += 'Please provide helpful and accurate responses. If asked about the PDF content, reference it directly.';
    
    const fullPrompt = systemContext + conversationContext + `User: ${message}\nAssistant:`;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}