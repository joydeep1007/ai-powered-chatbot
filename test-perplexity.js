// Test script to verify Perplexity API connectivity with sonar-pro
// Run this in Node.js: node test-perplexity.js

const testPerplexityAPI = async () => {
  const API_KEY = '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';
  
  console.log('🧪 Testing Perplexity API with sonar-pro model...');
  console.log('🔑 API Key (last 4 chars):', API_KEY.slice(-4));
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'user',
            content: 'Say hello and tell me what model you are!'
          }
        ],
        max_tokens: 100,
        temperature: 0.7,
        stream: false
      }),
    });

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Full Response:', JSON.stringify(data, null, 2));
      console.log('✅ Model Response:', data.choices[0].message.content);
      return true;
    } else {
      const errorText = await response.text();
      console.log('❌ Failed! Error Response:', errorText);
      try {
        const errorJson = JSON.parse(errorText);
        console.log('❌ Parsed Error:', JSON.stringify(errorJson, null, 2));
      } catch (e) {
        console.log('❌ Raw Error Text:', errorText);
      }
      return false;
    }
  } catch (error) {
    console.log('💥 Network Error:', error.message);
    return false;
  }
};

// Run the test
testPerplexityAPI();
