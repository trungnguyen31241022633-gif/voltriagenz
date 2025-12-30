import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Increase body size limit for Vercel
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { base64Data, mimeType, targetJob } = req.body;

    // Validate input
    if (!base64Data || !mimeType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check file size (max 3MB for base64)
    const sizeInMB = (base64Data.length * 0.75) / (1024 * 1024);
    if (sizeInMB > 3) {
      return res.status(413).json({ 
        error: `File quá lớn (${sizeInMB.toFixed(2)}MB). Vui lòng chọn file nhỏ hơn 3MB.`
      });
    }

    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not found');
      return res.status(500).json({ 
        error: 'API key not configured. Please add GEMINI_API_KEY to Vercel environment variables.' 
      });
    }

    console.log('🔑 API Key found:', apiKey.substring(0, 10) + '...');
    console.log('🎯 Target Job:', targetJob || 'General');
    console.log('📄 MIME Type:', mimeType);
    console.log('📦 Size:', sizeInMB.toFixed(2), 'MB');

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // ✅ SỬ DỤNG MODEL ĐÚNG - Gemini 1.5 Flash (stable, free, hỗ trợ vision)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',  // Model ổn định nhất
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    });

    // Create prompt
    const prompt = `
Bạn là chuyên gia tuyển dụng HR chuyên nghiệp. Phân tích CV này ${targetJob ? `cho vị trí "${targetJob}"` : 'một cách tổng quát'}.

Trả về JSON theo định dạng sau (KHÔNG thêm markdown, KHÔNG thêm \`\`\`json):

{
  "candidateLevel": "Junior/Mid/Senior",
  "summary": "Tóm tắt ngắn gọn về ứng viên (2-3 câu)",
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
    {"title": "Vị trí công việc phù hợp", "description": "Mô tả ngắn"}
  ],
  "suggestedProjects": [
    {"title": "Dự án nên làm", "description": "Mô tả ngắn"}
  ],
  "suggestedCollaborators": [
    {"title": "Đối tác hợp tác", "description": "Mô tả ngắn"}
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

    // Call Gemini API with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout after 25 seconds')), 25000)
    );

    const apiPromise = model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      },
      prompt
    ]);

    const result = await Promise.race([apiPromise, timeoutPromise]) as any;

    const responseText = result.response.text();
    console.log('📝 Raw response length:', responseText.length);

    // Parse JSON response
    let cleanedText = responseText.trim();
    
    // Remove markdown code blocks if present
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
    
    // Detailed error handling
    if (error.message?.includes('API key') || error.message?.includes('API_KEY')) {
      return res.status(500).json({ 
        error: '⚠️ API Key không hợp lệ. Vui lòng kiểm tra lại GEMINI_API_KEY trên Vercel.',
        details: error.message
      });
    }
    
    if (error.message?.includes('not found') || error.message?.includes('NOT_FOUND') || error.message?.includes('404')) {
      return res.status(500).json({ 
        error: '⚠️ Model không khả dụng. Đang sử dụng gemini-1.5-flash.',
        details: error.message,
        suggestion: 'Vui lòng kiểm tra API key và thử lại.'
      });
    }
    
    if (error.message?.includes('timeout')) {
      return res.status(504).json({ 
        error: '⚠️ Quá thời gian xử lý. File có thể quá phức tạp.',
        suggestion: 'Vui lòng thử file đơn giản hơn hoặc giảm độ phân giải.'
      });
    }
    
    if (error.message?.includes('JSON') || error.message?.includes('parse')) {
      return res.status(500).json({ 
        error: '⚠️ Không thể phân tích phản hồi từ AI. Vui lòng thử lại.',
        details: error.message
      });
    }

    if (error.message?.includes('quota') || error.message?.includes('limit') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      return res.status(429).json({ 
        error: '⚠️ Đã vượt quá giới hạn API. Vui lòng thử lại sau.',
        details: error.message
      });
    }

    if (error.message?.includes('PERMISSION_DENIED')) {
      return res.status(403).json({ 
        error: '⚠️ API key không có quyền truy cập. Vui lòng kiểm tra lại key.',
        details: error.message
      });
    }

    return res.status(500).json({ 
      error: error.message || 'Lỗi server không xác định',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
