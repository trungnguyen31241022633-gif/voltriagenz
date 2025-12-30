import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { base64Data, mimeType, targetJob } = req.body;

    if (!base64Data || !mimeType) {
      return res.status(400).json({ error: 'Missing base64Data or mimeType' });
    }

    // Đọc API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'GEMINI_API_KEY not configured',
        help: 'Add GEMINI_API_KEY to Vercel Environment Variables'
      });
    }

    console.log('✅ API Key:', apiKey.substring(0, 15) + '...');
    console.log('🎯 Job:', targetJob || 'General');

    // Khởi tạo Gemini với MODEL ĐÚNG
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // ⭐ QUAN TRỌNG: Dùng model STABLE này
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash'  // ✅ MODEL STABLE - HOẠT ĐỘNG 100%
    });

    console.log('🤖 Model: gemini-1.5-flash');

    // Prompt đơn giản
    const prompt = `Bạn là chuyên gia HR. Phân tích CV ${targetJob ? `cho vị trí "${targetJob}"` : ''}.

TRẢ VỀ JSON (không có markdown, không có \`\`\`):

{
  "candidateLevel": "Junior|Mid|Senior",
  "summary": "Tóm tắt ngắn gọn",
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
  "suggestedJobs": [{"title": "Job", "description": "Mô tả"}],
  "suggestedProjects": [{"title": "Project", "description": "Mô tả"}],
  "suggestedCollaborators": [{"title": "Partner", "description": "Mô tả"}],
  "developmentRoadmap": {
    "courses": [{"name": "Khóa học", "provider": "Nền tảng", "description": "Chi tiết"}],
    "projects": [{"name": "Dự án", "durationOrType": "3 tháng", "description": "Chi tiết"}],
    "jobs": [{"name": "Vị trí", "provider": "Công ty", "description": "Chi tiết"}]
  }
}`;

    console.log('📡 Calling Gemini API...');

    // Gọi API
    const result = await model.generateContent([
      { inlineData: { data: base64Data, mimeType } },
      prompt
    ]);

    const text = result.response.text();
    console.log('📥 Response:', text.substring(0, 100) + '...');

    // Parse JSON
    let json = text.trim();
    if (json.startsWith('```json')) {
      json = json.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (json.startsWith('```')) {
      json = json.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const data = JSON.parse(json);

    console.log('✅ Success! Score:', data.matchScore);

    return res.status(200).json(data);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    
    return res.status(500).json({ 
      error: error.message,
      type: error.constructor.name,
      help: 'Check Vercel Function Logs for details'
    });
  }
}
