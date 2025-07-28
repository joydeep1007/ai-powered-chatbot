import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Enhanced Sonar API call with Pro model
const callSonarAPI = async (prompt: string): Promise<string> => {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SONAR_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3.5-sonnet-20241022', // 🚀 Using the most powerful Pro model
      messages: [
        {
          role: 'system',
          content: 'You are Gubluxxy, a helpful AI assistant. Provide accurate, detailed, and well-structured responses. When analyzing documents, be thorough and cite specific information.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7,
      top_p: 0.9,
      stream: false
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Sonar API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

// Alternative models you can use
const PERPLEXITY_PRO_MODELS = {
  claude_sonnet: 'claude-3.5-sonnet-20241022',     // Most powerful
  gpt4o: 'gpt-4o',                                 // OpenAI's best
  claude_haiku: 'claude-3.5-haiku-20241022',       // Fastest
  llama_70b: 'llama-3.1-70b-instruct',             // Open source
  gpt4o_mini: 'gpt-4o-mini',                       // Cheaper option
};

// Function to try multiple Pro models as fallback
const callSonarAPIWithFallback = async (prompt: string): Promise<{ text: string, model: string }> => {
  const modelsToTry = [
    { name: 'Claude 3.5 Sonnet', id: PERPLEXITY_PRO_MODELS.claude_sonnet },
    { name: 'GPT-4o', id: PERPLEXITY_PRO_MODELS.gpt4o },
    { name: 'Claude 3.5 Haiku', id: PERPLEXITY_PRO_MODELS.claude_haiku },
    { name: 'Llama 3.1 70B', id: PERPLEXITY_PRO_MODELS.llama_70b },
  ];

  for (const model of modelsToTry) {
    try {
      console.log(`🤖 Trying ${model.name}...`);
      
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SONAR_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model.id,
          messages: [
            {
              role: 'system',
              content: 'You are Gubluxxy, a helpful AI assistant. Provide accurate, detailed, and well-structured responses. When analyzing documents, be thorough and cite specific information.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 4000,
          temperature: 0.7,
          top_p: 0.9,
          stream: false
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success with ${model.name}`);
        return {
          text: data.choices[0].message.content,
          model: model.name
        };
      }
    } catch (error) {
      console.log(`❌ ${model.name} failed:`, error);
      continue; // Try next model
    }
  }
  
  throw new Error('All Perplexity Pro models failed');
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

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, pdfContext } = await request.json();

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
        console.log('🔄 Quota/overload detected, switching to Perplexity Pro...');
        
        try {
          const sonarResult = await callSonarAPIWithFallback(fullPrompt);
          responseText = sonarResult.text;
          apiUsed = 'sonar';
          modelUsed = sonarResult.model;
          console.log(`✅ Perplexity Pro success with ${modelUsed}`);
        } catch (sonarError: any) {
          console.error('❌ Perplexity Pro failed:', sonarError.message);
          throw new Error('Both Gemini and Perplexity Pro APIs are unavailable. Please try again later.');
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