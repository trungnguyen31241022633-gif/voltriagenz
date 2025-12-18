import { GoogleGenerativeAI } from "@google/generative-ai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SYSTEM_INSTRUCTION = `
Bạn là Voltria AI - Chuyên gia phân tích CV chuyên nghiệp.

**Nhiệm vụ:** Phân tích CV và đưa ra đánh giá toàn diện bằng Tiếng Việt.

**Yêu cầu:**
1. Đánh giá điểm mạnh/yếu rõ ràng
2. Phân tích 7 khía cạnh: Kinh nghiệm, Kỹ năng, Ổn định công việc, Khoảng trống, Thăng tiến, Kỹ năng mềm, Chủ động
3. Đề xuất lộ trình phát triển 3 giai đoạn:
   - Giai đoạn 1: Khóa học/Chứng chỉ (Coursera, Udemy, AWS...)
   - Giai đoạn 2: Dự án thực hành (Pet project, Open Source...)
   - Giai đoạn 3: Cơ hội việc làm (Công ty, vị trí, lương)

**Định dạng:** Trả về JSON chuẩn, văn phong chuyên nghiệp.
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { base64Data, mimeType, targetJob } = req.body;

    if (!base64Data || !mimeType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not found in environment');
      return res.status(500).json({ 
        error: 'Server configuration error: GEMINI_API_KEY not set' 
      });
    }

    console.log('✅ API Key found, initializing Gemini...');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION
    });

    const prompt = `
Phân tích CV này cho vị trí: ${targetJob || "Đánh giá tổng quát"}

Trả về JSON với cấu trúc:
{
  "candidateLevel": "Junior/Mid/Senior",
  "summary": "Tóm tắt 2-3 câu",
  "matchScore": 75,
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "weaknesses": ["Điểm yếu 1", "Điểm yếu 2"],
  "detailedAnalysis": {
    "experienceMatch": "...",
    "skillsAssessment": "...",
    "jobStability": "...",
    "employmentGaps": "...",
    "progressionAndAwards": "...",
    "teamworkAndSoftSkills": "...",
    "proactivity": "..."
  },
  "suggestedJobs": [{"title": "", "description": ""}],
  "suggestedProjects": [{"title": "", "description": ""}],
  "suggestedCollaborators": [{"title": "", "description": ""}],
  "developmentRoadmap": {
    "courses": [{"name": "", "provider": "", "description": ""}],
    "projects": [{"name": "", "durationOrType": "", "description": ""}],
    "jobs": [{"name": "", "provider": "", "description": ""}]
  }
}

CHỈ trả về JSON, KHÔNG thêm text khác.
`;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    };

    console.log('📤 Sending request to Gemini...');
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    let text = response.text();

    console.log('📥 Received response');

    // Clean JSON
    text = text.trim();
    if (text.startsWith("```json")) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    if (text.startsWith("```")) {
      text = text.replace(/```\n?/g, '');
    }

    const analysisResult = JSON.parse(text);
    
    return res.status(200).json(analysisResult);

  } catch (error: any) {
    console.error('❌ Error:', error);
    
    let errorMessage = 'Đã xảy ra lỗi khi phân tích CV';
    
    if (error.message?.includes('API key not valid') || error.message?.includes('API_KEY_INVALID')) {
      errorMessage = 'API Key không hợp lệ. Vui lòng kiểm tra cấu hình.';
    } else if (error.message?.includes('quota')) {
      errorMessage = 'Đã vượt quá giới hạn API. Vui lòng thử lại sau.';
    }
    
    return res.status(500).json({ error: errorMessage });
  }
}
