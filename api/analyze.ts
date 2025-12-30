import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

// =====================================================
// CRITICAL: Vercel Serverless Function
// Đọc API key từ process.env (Vercel Environment Variables)
// =====================================================

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers (nếu cần)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Chỉ cho phép POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { base64Data, mimeType, targetJob } = req.body;

    // Validate input
    if (!base64Data || !mimeType) {
      return res.status(400).json({ 
        error: 'Missing required fields: base64Data, mimeType' 
      });
    }

    // =====================================================
    // ĐỌC API KEY TỪ ENVIRONMENT VARIABLES
    // =====================================================
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not found in environment variables');
      console.error('Available env keys:', Object.keys(process.env).filter(k => k.includes('GEMINI')));
      
      return res.status(500).json({ 
        error: '⚠️ API key chưa được cấu hình',
        message: 'Vui lòng thêm GEMINI_API_KEY vào Vercel Environment Variables',
        instructions: [
          '1. Vào Vercel Dashboard → Your Project',
          '2. Settings → Environment Variables',
          '3. Add: Name=GEMINI_API_KEY, Value=your_key',
          '4. Redeploy project'
        ]
      });
    }

    console.log('🔑 API Key found:', apiKey.substring(0, 10) + '...');
    console.log('🎯 Target Job:', targetJob || 'General');
    console.log('📄 MIME Type:', mimeType);

    // =====================================================
    // KHỞI TẠO GEMINI AI
    // =====================================================
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Model list (thử theo thứ tự):
    // 1. gemini-1.5-flash (stable, khuyên dùng)
    // 2. gemini-2.0-flash-exp (experimental, miễn phí)
    // 3. gemini-pro-vision (cũ hơn nhưng stable)
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash', // ✅ Model stable nhất
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });

    // =====================================================
    // TẠO PROMPT
    // =====================================================
    const systemPrompt = `Bạn là Voltria, chuyên gia tuyển dụng AI cao cấp.

**NHIỆM VỤ:** Phân tích CV ${targetJob ? `cho vị trí "${targetJob}"` : 'một cách tổng quát'}.

**YÊU CẦU QUAN TRỌNG:**
- TẤT CẢ nội dung phải bằng TIẾNG VIỆT
- Trả về JSON thuần túy (KHÔNG có markdown, KHÔNG có \`\`\`json)
- Đánh giá khách quan, chuyên nghiệp
- Đưa ra lộ trình phát triển cụ thể

**ĐỊNH DẠNG JSON:**
{
  "candidateLevel": "Junior|Mid-level|Senior|Expert",
  "summary": "Tóm tắt ngắn gọn về ứng viên (2-3 câu)",
  "matchScore": 75,
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2", "Điểm mạnh 3", "..."],
  "weaknesses": ["Điểm yếu 1", "Điểm yếu 2", "..."],
  "detailedAnalysis": {
    "experienceMatch": "Phân tích chi tiết về kinh nghiệm phù hợp với vị trí",
    "skillsAssessment": "Đánh giá kỹ năng kỹ thuật và chuyên môn",
    "jobStability": "Đánh giá độ ổn định công việc (có job hopping không?)",
    "employmentGaps": "Phân tích khoảng trống nghề nghiệp (nếu có)",
    "progressionAndAwards": "Thăng tiến sự nghiệp và giải thưởng",
    "teamworkAndSoftSkills": "Kỹ năng mềm và làm việc nhóm",
    "proactivity": "Tính chủ động, sáng tạo và đóng góp"
  },
  "suggestedJobs": [
    {"title": "Tên vị trí phù hợp", "description": "Mô tả chi tiết"}
  ],
  "suggestedProjects": [
    {"title": "Dự án nên làm", "description": "Mô tả chi tiết"}
  ],
  "suggestedCollaborators": [
    {"title": "Đối tác hợp tác tiềm năng", "description": "Mô tả"}
  ],
  "developmentRoadmap": {
    "courses": [
      {
        "name": "Tên khóa học cụ thể",
        "provider": "Coursera/Udemy/EdX/Google/AWS",
        "description": "Tại sao cần học khóa này? (chi tiết)"
      }
    ],
    "projects": [
      {
        "name": "Tên dự án thực hành",
        "durationOrType": "3-6 tháng / Dự án cá nhân",
        "description": "Mô tả dự án và lợi ích"
      }
    ],
    "jobs": [
      {
        "name": "Vị trí công việc tiếp theo",
        "provider": "Loại hình công ty (VD: Viettel, FPT, Startup Fintech)",
        "description": "Yêu cầu và mức lương ước tính"
      }
    ]
  }
}

Hãy phân tích chi tiết, chuyên nghiệp và đưa ra lộ trình phát triển thực tế.`;

    // =====================================================
    // GỌI GEMINI API
    // =====================================================
    console.log('📡 Đang gọi Gemini API...');
    
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      },
      systemPrompt
    ]);

    const responseText = result.response.text();
    console.log('📥 Nhận được response:', responseText.substring(0, 100) + '...');

    // =====================================================
    // PARSE JSON RESPONSE
    // =====================================================
    let cleanedText = responseText.trim();
    
    // Loại bỏ markdown code blocks nếu có
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Parse JSON
    const analysisResult = JSON.parse(cleanedText);
    
    // Validate required fields
    if (!analysisResult.candidateLevel || !analysisResult.summary || typeof analysisResult.matchScore !== 'number') {
      throw new Error('Invalid response format from AI');
    }

    console.log('✅ Analysis successful!');
    console.log('📊 Match Score:', analysisResult.matchScore);
    console.log('👤 Candidate Level:', analysisResult.candidateLevel);

    // Trả về kết quả
    return res.status(200).json(analysisResult);

  } catch (error: any) {
    console.error('❌ Error in API route:', error);
    
    // Chi tiết lỗi để debug
    let errorResponse: any = {
      error: 'Internal server error',
      message: error.message
    };

    // Phân loại lỗi cụ thể
    if (error.message?.includes('API key')) {
      errorResponse = {
        error: 'Invalid API key',
        message: 'API key không hợp lệ hoặc đã hết hạn',
        instructions: 'Vui lòng kiểm tra GEMINI_API_KEY trong Vercel Environment Variables'
      };
    } else if (error.message?.includes('not found') || error.message?.includes('NOT_FOUND')) {
      errorResponse = {
        error: 'Model not available',
        message: 'Model Gemini không khả dụng',
        suggestion: 'Thử các model khác: gemini-1.5-flash, gemini-2.0-flash-exp, gemini-pro-vision'
      };
    } else if (error.message?.includes('JSON')) {
      errorResponse = {
        error: 'Failed to parse AI response',
        message: 'Không thể parse JSON từ response AI',
        details: error.message
      };
    } else if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      errorResponse = {
        error: 'Quota exceeded',
        message: 'Đã hết quota API. Vui lòng kiểm tra billing trên Google AI Studio',
        link: 'https://makersuite.google.com/app/apikey'
      };
    }

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = error.stack;
    }

    return res.status(500).json(errorResponse);
  }
}
