import { AnalysisResult } from "../types";
import { GoogleGenerativeAI } from '@google/generative-ai';

// Compress image
const compressImage = async (base64Data: string, mimeType: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      const maxSize = 1200;
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      
      const compressed = canvas.toDataURL('image/jpeg', 0.7);
      resolve(compressed.split(',')[1]);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = `data:${mimeType};base64,${base64Data}`;
  });
};

// ✅ GET API KEY - Fixed version
const getApiKey = (): string => {
  // Try VITE_ prefix first (recommended for Vite)
  let apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  // Fallback: try without prefix (for backward compatibility)
  if (!apiKey) {
    apiKey = import.meta.env.GEMINI_API_KEY;
  }
  
  // Debug logs
  console.log('🔍 Checking API Key...');
  console.log('VITE_GEMINI_API_KEY exists:', !!import.meta.env.VITE_GEMINI_API_KEY);
  console.log('GEMINI_API_KEY exists:', !!import.meta.env.GEMINI_API_KEY);
  
  if (!apiKey || apiKey.trim() === '') {
    const errorMsg = 
      '⚠️ API Key không tìm thấy!\n\n' +
      '📍 KIỂM TRA:\n' +
      '1. File .env.local có tồn tại không?\n' +
      '2. Có dòng: VITE_GEMINI_API_KEY=AIzaSy...\n' +
      '3. Đã RESTART dev server chưa? (Ctrl+C rồi npm run dev)\n\n' +
      '📍 VERCEL:\n' +
      '1. Settings → Environment Variables\n' +
      '2. Thêm: VITE_GEMINI_API_KEY = AIzaSy...\n' +
      '3. PHẢI REDEPLOY sau khi thêm!\n\n' +
      '🔗 Lấy key: https://aistudio.google.com/apikey';
    
    throw new Error(errorMsg);
  }
  
  // Validate format
  if (!apiKey.startsWith('AIzaSy')) {
    throw new Error('⚠️ API Key không đúng format! Key phải bắt đầu bằng "AIzaSy..."');
  }
  
  return apiKey;
};

export const analyzeCV = async (
  base64Data: string, 
  mimeType: string, 
  targetJob: string
): Promise<AnalysisResult> => {
  try {
    console.log("🚀 Bắt đầu phân tích CV...");

    // Compress if image
    let processedData = base64Data;
    let processedMime = mimeType;
    
    if (mimeType.startsWith('image/') && mimeType !== 'image/gif') {
      console.log("🗜️ Compressing image...");
      try {
        processedData = await compressImage(base64Data, mimeType);
        processedMime = 'image/jpeg';
      } catch (e) {
        console.warn("⚠️ Compression failed, using original");
      }
    }

    // Check size
    const sizeInMB = (processedData.length * 0.75) / (1024 * 1024);
    console.log(`📦 File size: ${sizeInMB.toFixed(2)}MB`);
    
    if (sizeInMB > 3) {
      throw new Error(`File quá lớn (${sizeInMB.toFixed(2)}MB). Chọn file < 3MB.`);
    }

    // ✅ Get and validate API key
    const apiKey = getApiKey();
    console.log('✅ API Key loaded:', apiKey.substring(0, 15) + '...');

    // Initialize Gemini
    console.log('🔧 Initializing Gemini API...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
        responseMimeType: "application/json", // ✅ Force JSON response
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

    console.log('📤 Sending request to Gemini...');

    // Call API
    let result;
    try {
      result = await model.generateContent([
        {
          inlineData: {
            data: processedData,
            mimeType: processedMime
          }
        },
        prompt
      ]);
      
      console.log('✅ Received response from Gemini');
    } catch (apiError: any) {
      console.error('❌ API Call Error:', apiError);
      console.error('Error details:', {
        message: apiError.message,
        status: apiError.status,
        code: apiError.code
      });
      
      if (apiError.message?.includes('API key not valid') || apiError.message?.includes('API_KEY_INVALID')) {
        throw new Error('⚠️ API Key không hợp lệ!\n\nThử:\n1. Tạo key mới: https://aistudio.google.com/apikey\n2. Thay trong .env.local\n3. Restart: npm run dev');
      }
      
      if (apiError.message?.includes('User location is not supported')) {
        throw new Error('⚠️ Gemini chưa hỗ trợ khu vực của bạn. Thử dùng VPN.');
      }
      
      if (apiError.message?.includes('quota') || apiError.message?.includes('RESOURCE_EXHAUSTED')) {
        throw new Error('⚠️ Vượt giới hạn API. Đợi vài phút hoặc tạo key mới.');
      }
      
      throw new Error(`Gemini API Error: ${apiError.message || 'Unknown error'}`);
    }

    // Validate response
    if (!result || !result.response) {
      console.error('❌ No response object');
      throw new Error('⚠️ Không nhận được phản hồi từ Gemini');
    }

    const responseText = result.response.text();
    console.log('📝 Raw response:', responseText.substring(0, 200) + '...');
    
    if (!responseText || responseText.trim().length === 0) {
      throw new Error('⚠️ Gemini trả về response rỗng');
    }

    // Clean response - remove markdown if present
    let cleanedText = responseText.trim();
    
    // Remove various markdown formats
    cleanedText = cleanedText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    
    console.log('🧹 Cleaned response:', cleanedText.substring(0, 200) + '...');

    // Parse JSON with better error handling
    let analysisResult: AnalysisResult;
    try {
      analysisResult = JSON.parse(cleanedText);
      console.log("✅ JSON parsed successfully!");
    } catch (parseError: any) {
      console.error('❌ JSON Parse Error:', parseError.message);
      console.error('Failed text (first 500 chars):', cleanedText.substring(0, 500));
      
      // Try to extract JSON if it's embedded in text
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('🔍 Found JSON pattern, trying to parse...');
        try {
          analysisResult = JSON.parse(jsonMatch[0]);
          console.log("✅ JSON extracted and parsed!");
        } catch (e) {
          throw new Error('⚠️ Response không phải JSON hợp lệ. Gemini có thể đang trả về text thay vì JSON.');
        }
      } else {
        throw new Error('⚠️ Không tìm thấy JSON trong response. Thử lại sau.');
      }
    }
    
    // Validate result structure
    if (!analysisResult.matchScore || !analysisResult.summary) {
      console.error('❌ Invalid result structure:', analysisResult);
      throw new Error('⚠️ Dữ liệu trả về không đầy đủ. Thử lại.');
    }
    
    console.log("✅ Phân tích thành công!");
    console.log("📊 Điểm phù hợp:", analysisResult.matchScore);
    
    return analysisResult;

  } catch (error: any) {
    console.error("❌ Lỗi tổng:", error);
    
    // Re-throw with more context
    if (error.message?.includes('API')) {
      throw error; // Already has good error message
    }
    
    throw new Error(error.message || "Lỗi không xác định khi phân tích CV");
  }
};
