import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

// =====================================================
// VERCEL SERVERLESS FUNCTION - GEMINI API
// =====================================================

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { base64Data, mimeType, targetJob } = req.body;

    if (!base64Data || !mimeType) {
      return res.status(400).json({ 
        error: 'Missing required fields: base64Data, mimeType' 
      });
    }

    // =====================================================
    // ĐỌC API KEY
    // =====================================================
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not found');
      return res.status(500).json({ 
        error: 'API key not configured',
        message: 'Vui lòng thêm GEMINI_API_KEY vào Vercel Environment Variables'
      });
    }

    console.log('🔑 API Key found:', apiKey.substring(0, 15) + '...');
    console.log('🎯 Target Job:', targetJob || 'General');
    console.log('📄 MIME Type:', mimeType);

    // =====================================================
    // KHỞI TẠO GEMINI - SỬ DỤNG MODEL STABLE
    // =====================================================
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // ✅ SỬ DỤNG MODEL STABLE - THAY ĐỔI Ở ĐÂY!
    // Thử các model theo thứ tự ưu tiên:
    const MODEL_OPTIONS = [
      'gemini-1.5-flash',           // ✅ STABLE NHẤT - Khuyên dùng
      'gemini-1.5-flash-latest',    // Latest version
      'gemini-1.5-pro',             // Pro version (chậm hơn nhưng tốt hơn)
      'gemini-pro-vision'           // Cũ hơn nhưng vẫn hoạt động
    ];

    let model;
    let selectedModel = MODEL_OPTIONS[0]; // Default: gemini-1.5-flash

    try {
      console.log(`🤖 Đang khởi tạo model: ${selectedModel}`);
      
      model = genAI.getGenerativeModel({ 
        model: selectedModel,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      });
    } catch (modelError: any) {
      console.error(`❌ Lỗi khởi tạo model ${selectedModel}:`, modelError.message);
      
      // Fallback sang model khác
      selectedModel = MODEL_OPTIONS[3]; // gemini-pro-vision
      console.log(`🔄 Thử lại với model: ${selectedModel}`);
      
      model = genAI.getGenerativeModel({ 
        model: selectedModel,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      });
    }

    // =====================================================
    // TẠO PROMPT
    // =====================================================
    const systemPrompt = `Bạn là Voltria, chuyên gia tuyển dụng AI cao cấp.

**NHIỆM VỤ:** Phân tích CV ${targetJob ? `cho vị trí "${targetJob}"` : 'một cách tổng quát'}.

**YÊU CẦU:**
- TẤT CẢ nội dung TIẾNG VIỆT
- Trả về JSON thuần (KHÔNG markdown, KHÔNG \`\`\`json)
- Đánh giá khách quan, chuyên nghiệp

**FORMAT JSON:**
{
  "candidateLevel": "Junior|Mid-level|Senior|Expert",
  "summary": "Tóm tắt 2-3 câu",
  "matchScore": 75,
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2", "Điểm mạnh 3"],
  "weaknesses": ["Điểm yếu 1", "Điểm yếu 2"],
  "detailedAnalysis": {
    "experienceMatch": "Phân tích kinh nghiệm",
    "skillsAssessment": "Đánh giá kỹ năng",
    "jobStability": "Độ ổn định công việc",
    "employmentGaps": "Khoảng trống nghề nghiệp",
    "progressionAndAwards": "Thăng tiến & giải thưởng",
    "teamworkAndSoftSkills": "Kỹ năng mềm",
    "proactivity": "Tính chủ động"
  },
  "suggestedJobs": [
    {"title": "Vị trí phù hợp", "description": "Mô tả"}
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
        "provider": "Coursera/Udemy/EdX",
        "description": "Chi tiết khóa học"
      }
    ],
    "projects": [
      {
        "name": "Tên dự án",
        "durationOrType": "3-6 tháng",
        "description": "Mô tả dự án"
      }
    ],
    "jobs": [
      {
        "name": "Vị trí tiếp theo",
        "provider": "Loại công ty",
        "description": "Yêu cầu & lương"
      }
    ]
  }
}

Phân tích chi tiết và đưa ra lộ trình thực tế.`;

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
    console.log('📥 Response length:', responseText.length, 'chars');

    // =====================================================
    // PARSE JSON
    // =====================================================
    let cleanedText = responseText.trim();
    
    // Loại bỏ markdown
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const analysisResult = JSON.parse(cleanedText);
    
    // Validate
    if (!analysisResult.candidateLevel || !analysisResult.summary || typeof analysisResult.matchScore !== 'number') {
      throw new Error('Invalid response format');
    }

    console.log('✅ Analysis successful!');
    console.log('📊 Match Score:', analysisResult.matchScore);
    console.log('👤 Level:', analysisResult.candidateLevel);
    console.log('🤖 Model used:', selectedModel);

    return res.status(200).json(analysisResult);

  } catch (error: any) {
    console.error('❌ Error:', error);
    
    let errorResponse: any = {
      error: 'Analysis failed',
      message: error.message
    };

    // Phân loại lỗi
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key')) {
      errorResponse = {
        error: 'Invalid API key',
        message: 'API key không hợp lệ. Vui lòng kiểm tra lại GEMINI_API_KEY',
        solution: 'Tạo key mới tại: https://makersuite.google.com/app/apikey'
      };
    } else if (error.message?.includes('404') || error.message?.includes('not found')) {
      errorResponse = {
        error: 'Model not available',
        message: 'Model không khả dụng',
        suggestion: 'Đã tự động fallback sang gemini-1.5-flash hoặc gemini-pro-vision'
      };
    } else if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      errorResponse = {
        error: 'Quota exceeded',
        message: 'Đã hết quota API',
        solution: 'Kiểm tra usage tại: https://makersuite.google.com/app/apikey'
      };
    } else if (error.message?.includes('JSON')) {
      errorResponse = {
        error: 'Parse error',
        message: 'Không thể parse JSON từ AI response',
        details: error.message
      };
    }

    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = error.stack;
    }

    return res.status(500).json(errorResponse);
  }
}
