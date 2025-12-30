// File: api/analyze.ts
// Vercel Serverless Function - Proxy to Gemini API

import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
  runtime: 'edge', // Use Edge Runtime for better performance
};

export default async function handler(req: Request) {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { fileData, mimeType, targetJob } = await req.json();

    if (!fileData || !mimeType) {
      return new Response(JSON.stringify({ error: 'Missing fileData or mimeType' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get API key from environment (server-side only)
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ API Key not found in environment');
      return new Response(JSON.stringify({ 
        error: 'API Key chưa cấu hình trên server.\n\nVercel: Settings → Environment Variables → Add VITE_GEMINI_API_KEY' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ API Key found:', apiKey.substring(0, 15) + '...');

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      }
    });

    const prompt = `
Bạn là chuyên gia phân tích CV. Phân tích CV này ${targetJob ? `cho vị trí "${targetJob}"` : 'tổng quát'}.

QUAN TRỌNG: Chỉ trả về JSON thuần túy, không có markdown, không có giải thích thêm.

Cấu trúc JSON bắt buộc:
{
  "candidateLevel": "Junior/Mid/Senior",
  "summary": "Tóm tắt ngắn gọn về ứng viên",
  "matchScore": 75,
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2", "Điểm mạnh 3"],
  "weaknesses": ["Điểm yếu 1", "Điểm yếu 2"],
  "detailedAnalysis": {
    "experienceMatch": "Phân tích kinh nghiệm",
    "skillsAssessment": "Đánh giá kỹ năng",
    "jobStability": "Độ ổn định",
    "employmentGaps": "Khoảng trống",
    "progressionAndAwards": "Thăng tiến",
    "teamworkAndSoftSkills": "Kỹ năng mềm",
    "proactivity": "Chủ động"
  },
  "suggestedJobs": [{"title": "Vị trí", "description": "Mô tả"}],
  "suggestedProjects": [{"title": "Dự án", "description": "Mô tả"}],
  "suggestedCollaborators": [{"title": "Đối tác", "description": "Mô tả"}],
  "developmentRoadmap": {
    "courses": [{"name": "Tên", "provider": "Nền tảng", "durationOrType": "Thời gian", "description": "Chi tiết"}],
    "projects": [{"name": "Tên", "provider": "Nơi", "durationOrType": "Thời gian", "description": "Chi tiết"}],
    "jobs": [{"name": "Vị trí", "provider": "Công ty", "durationOrType": "Loại", "description": "Chi tiết"}]
  }
}`;

    console.log('📤 Calling Gemini API...');

    // Call Gemini API
    const result = await model.generateContent([
      {
        inlineData: {
          data: fileData,
          mimeType: mimeType
        }
      },
      prompt
    ]);

    const responseText = result.response.text();
    console.log('✅ Received response, length:', responseText.length);

    // Clean and parse JSON
    let cleanedText = responseText.trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    // Try to parse
    let analysisResult;
    try {
      analysisResult = JSON.parse(cleanedText);
    } catch (parseError) {
      // Try to extract JSON pattern
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from Gemini');
      }
    }

    console.log('✅ Analysis complete, score:', analysisResult.matchScore);

    // Return successful response
    return new Response(JSON.stringify(analysisResult), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow CORS
      }
    });

  } catch (error: any) {
    console.error('❌ Error in analyze API:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error occurred',
      details: error.toString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
