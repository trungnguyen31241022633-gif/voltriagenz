import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Test 1: Check if API key exists
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'GEMINI_API_KEY not found',
        envKeys: Object.keys(process.env).filter(k => k.includes('GEMINI'))
      });
    }

    // Test 2: Simple Gemini API call
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: "Xin chào, bạn có hoạt động không? Trả lời ngắn gọn." }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: 'Gemini API error',
        status: response.status,
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      apiKeyExists: true,
      apiKeyPrefix: apiKey.substring(0, 10) + '...',
      response: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response'
    });

  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
}
