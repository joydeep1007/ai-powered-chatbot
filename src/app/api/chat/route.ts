import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Simple Sonar Pro API fallback
const callSonarAPI = async (prompt: string): Promise<{ text: string, model: string }> => {
  console.log(`🤖 Trying Sonar Pro model...`);
  
  const requestBody = {
    model: 'sonar-pro',
    messages: [
      {
        role: 'system',
        content: 'You are Gubluxxy, a helpful AI assistant. Provide accurate and helpful responses.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 2000,
    temperature: 0.7,
    stream: false
  };

  console.log(`📡 Making request to Perplexity with model: sonar-pro`);

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SONAR_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  console.log(`📊 Response status: ${response.status}`);

  if (response.ok) {
    const data = await response.json();
    console.log(`✅ Success with Sonar Pro`);
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return {
        text: data.choices[0].message.content,
        model: 'Sonar Pro'
      };
    } else {
      throw new Error('Invalid response format');
    }
  } else {
    const errorText = await response.text();
    console.log(`❌ Sonar Pro failed with status ${response.status}: ${errorText}`);
    throw new Error(`Sonar Pro: ${response.status} - ${errorText}`);
  }
};

const isQuotaError = (error: any): boolean => {
  if (!error) return false;
  
  const status = error.status;
  const message = error.message?.toLowerCase() || '';
  
  return (
    status === 429 || 
    status === 503 ||
    message.includes('quota') ||
    message.includes('exceeded') ||
    message.includes('overloaded') ||
    message.includes('too many requests')
  );
};

// Test function to verify Perplexity API connectivity
const testPerplexityAPI = async (): Promise<boolean> => {
  try {
    console.log('🧪 Testing Perplexity API connectivity...');
    console.log('🔑 API Key present:', process.env.SONAR_API_KEY ? 'Yes' : 'No');
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SONAR_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 50,
      }),
    });

    console.log('🧪 Test response status:', response.status);
    
    if (response.ok) {
      console.log('✅ Perplexity API test successful');
      return true;
    } else {
      const errorText = await response.text();
      console.log('❌ Perplexity API test failed:', errorText);
      return false;
    }
  } catch (error: any) {
    console.log('❌ Perplexity API test error:', error.message);
    return false;
  }
};

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, pdfContext } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build context for the conversation
    let conversationContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
      const recentMessages = conversationHistory.slice(-6); // Last 3 exchanges
      conversationContext = recentMessages
        .map((msg: any) => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');
    }

    // Build the full prompt
    let systemContext = 'You are Gubluxxy, a helpful AI assistant. Provide accurate and helpful responses.\n\n';
    
    if (pdfContext && pdfContext.text) {
      systemContext += `DOCUMENT CONTEXT:\nDocument: ${pdfContext.fileName} (${pdfContext.pageCount} pages)\nContent: ${pdfContext.text}\n\nPlease answer the user's question based on this document content when relevant.\n\n`;
    }

    const fullPrompt = systemContext + conversationContext + `User: ${message}\nAssistant:`;

    let responseText = '';
    let apiUsed = 'gemini';
    let modelUsed = 'Gemini 1.5 Flash';

    try {
      // Try Gemini API first
      console.log('🤖 Trying Gemini API...');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      responseText = response.text();
      console.log('✅ Gemini API success');
    } catch (geminiError: any) {
      console.log('❌ Gemini API failed:', geminiError.message);
      
      if (isQuotaError(geminiError)) {
        console.log('🔄 Quota/overload detected, switching to Sonar Pro...');
        
        try {
          const sonarResult = await callSonarAPI(fullPrompt);
          responseText = sonarResult.text;
          apiUsed = 'sonar';
          modelUsed = sonarResult.model;
          console.log(`✅ Sonar Pro success with ${modelUsed}`);
        } catch (sonarError: any) {
          console.error('❌ Sonar Pro failed:', sonarError.message);
          throw new Error('Both Gemini and Sonar Pro APIs are unavailable. Please try again later.');
        }
      } else {
        throw geminiError;
      }
    }

    return NextResponse.json({ 
      response: responseText,
      apiUsed,
      modelUsed // Include which specific model was used
    });

  } catch (error: any) {
    console.error('API Error:', error);
    
    let errorMessage = 'Failed to generate response. Please try again.';
    let status = 500;

    if (error.message?.includes('quota exceeded')) {
      errorMessage = '⏳ API usage limit reached. Please try again later.';
      status = 429;
    } else if (error.message?.includes('overloaded')) {
      errorMessage = '🔧 AI service is temporarily overloaded. Please try again.';
      status = 503;
    } else if (error.message?.includes('Both Gemini and Perplexity')) {
      errorMessage = error.message;
      status = 503;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
}