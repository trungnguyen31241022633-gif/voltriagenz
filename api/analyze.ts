import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Chỉ cho phép POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { base64Data, mimeType, targetJob } = req.body;

    // Validate input
    if (!base64Data || !mimeType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Lấy API key từ environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not found in environment variables');
      return res.status(500).json({ 
        error: 'API key not configured. Please add GEMINI_API_KEY to Vercel environment variables.' 
      });
    }

    console.log('🔑 API Key found:', apiKey.substring(0, 10) + '...');
    console.log('🎯 Target Job:', targetJob || 'General');
    console.log('📄 MIME Type:', mimeType);

    // Khởi tạo Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp'
    });

    // Tạo prompt
    const prompt = `
Bạn là chuyên gia tuyển dụng HR chuyên nghiệp. Phân tích CV này ${targetJob ? `cho vị trí "${targetJob}"` : 'một cách tổng quát'}.

Trả về JSON theo định dạng sau (KHÔNG thêm markdown, KHÔNG thêm \`\`\`json):

{
  "candidateLevel": "Junior/Mid/Senior",
  "summary": "Tóm tắt ngắn gọn về ứng viên",
  "matchScore": 75,
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2", "Điểm mạnh 3"],
  "weaknesses": ["Điểm yếu 1", "Điểm yếu 2"],
  "detailedAnalysis": {
    "experienceMatch": "Phân tích kinh nghiệm phù hợp với vị trí",
    "skillsAssessment": "Đánh giá kỹ năng",
    "jobStability": "Đánh giá độ ổn định công việc (job hopping)",
    "employmentGaps": "Phân tích khoảng trống nghề nghiệp",
    "progressionAndAwards": "Thăng tiến và giải thưởng",
    "teamworkAndSoftSkills": "Kỹ năng mềm và làm việc nhóm",
    "proactivity": "Tính chủ động và sáng tạo"
  },
  "suggestedJobs": [
    {"title": "Vị trí công việc phù hợp", "description": "Mô tả"}
  ],
  "suggestedProjects": [
    {"title": "Dự án nên làm", "description": "Mô tả"}
  ],
  "suggestedCollaborators": [
    {"title": "Đối tác hợp tác", "description": "Mô tả"}
  ],
  "developmentRoadmap": {
    "courses": [
      {
        "name": "Tên khóa học",
        "provider": "Coursera/Udemy/etc",
        "durationOrType": "3 tháng",
        "description": "Mô tả chi tiết"
      }
    ],
    "projects": [
      {
        "name": "Tên dự án",
        "provider": "Công ty/Tổ chức",
        "durationOrType": "6 tháng",
        "description": "Mô tả chi tiết"
      }
    ],
    "jobs": [
      {
        "name": "Vị trí công việc",
        "provider": "Công ty",
        "durationOrType": "Full-time",
        "description": "Mô tả chi tiết"
      }
    ]
  }
}

Hãy phân tích chi tiết, chuyên nghiệp và đưa ra lộ trình phát triển cụ thể.`;

    // Gọi Gemini API
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      },
      prompt
    ]);

    const responseText = result.response.text();
    console.log('📝 Raw response:', responseText.substring(0, 200) + '...');

    // Parse JSON response
    let cleanedText = responseText.trim();
    
    // Loại bỏ markdown code blocks nếu có
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '');
    }

    const analysisResult = JSON.parse(cleanedText);
    
    console.log('✅ Analysis successful!');
    console.log('📊 Match Score:', analysisResult.matchScore);

    return res.status(200).json(analysisResult);

  } catch (error: any) {
    console.error('❌ Error in API route:', error);
    
    // Chi tiết lỗi để debug
    if (error.message?.includes('API key')) {
      return res.status(500).json({ 
        error: 'Invalid API key. Please check your GEMINI_API_KEY in Vercel settings.' 
      });
    }
    
    if (error.message?.includes('JSON')) {
      return res.status(500).json({ 
        error: 'Failed to parse AI response. Please try again.' 
      });
    }

    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
