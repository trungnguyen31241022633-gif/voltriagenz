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

// ✅ GET API KEY - Works both on Vercel & Local
const getApiKey = (): string => {
  // Vite automatically loads VITE_ prefixed variables
  const apiKey = import.meta.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      '⚠️ API Key chưa cấu hình.\n\n' +
      '📍 LOCAL:\n' +
      '1. Tạo file .env.local\n' +
      '2. Thêm: VITE_GEMINI_API_KEY=AIzaSy...\n' +
      '3. Restart dev server\n\n' +
      '📍 VERCEL:\n' +
      '1. Settings → Environment Variables\n' +
      '2. Thêm: VITE_GEMINI_API_KEY = AIzaSy...\n' +
      '3. Redeploy\n\n' +
      '🔗 Lấy key: https://aistudio.google.com/apikey'
    );
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
    if (sizeInMB > 3) {
      throw new Error(`File quá lớn (${sizeInMB.toFixed(2)}MB). Chọn file < 3MB.`);
    }

    // ✅ Get API key
    const apiKey = getApiKey();
    console.log('🔑 API Key loaded:', apiKey.substring(0, 10) + '...');

    // Initialize Gemini with 1.5 Pro (stable model)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    });

    const prompt = `
Phân tích CV này ${targetJob ? `cho vị trí "${targetJob}"` : 'tổng quát'}. Trả về JSON (KHÔNG thêm markdown):

{
  "candidateLevel": "Junior/Mid/Senior",
  "summary": "Tóm tắt 2-3 câu về ứng viên",
  "matchScore": 75,
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2", "Điểm mạnh 3"],
  "weaknesses": ["Điểm yếu 1", "Điểm yếu 2"],
  "detailedAnalysis": {
    "experienceMatch": "Phân tích kinh nghiệm phù hợp",
    "skillsAssessment": "Đánh giá kỹ năng",
    "jobStability": "Độ ổn định công việc",
    "employmentGaps": "Khoảng trống nghề nghiệp",
    "progressionAndAwards": "Thăng tiến và giải thưởng",
    "teamworkAndSoftSkills": "Kỹ năng mềm",
    "proactivity": "Tính chủ động"
  },
  "suggestedJobs": [{"title": "Vị trí", "description": "Mô tả"}],
  "suggestedProjects": [{"title": "Dự án", "description": "Mô tả"}],
  "suggestedCollaborators": [{"title": "Đối tác", "description": "Mô tả"}],
  "developmentRoadmap": {
    "courses": [{"name": "Khóa học", "provider": "Platform", "durationOrType": "3 tháng", "description": "Chi tiết"}],
    "projects": [{"name": "Dự án", "provider": "Công ty", "durationOrType": "6 tháng", "description": "Chi tiết"}],
    "jobs": [{"name": "Vị trí", "provider": "Công ty", "durationOrType": "Full-time", "description": "Chi tiết"}]
  }
}

Phân tích chuyên nghiệp và chi tiết.`;

    console.log('📤 Calling Gemini 1.5 Pro...');

    // Call API with error handling
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
    } catch (apiError: any) {
      console.error('API Call Error:', apiError);
      
      if (apiError.message?.includes('API key not valid')) {
        throw new Error('⚠️ API Key không hợp lệ. Vui lòng tạo key mới tại https://aistudio.google.com/apikey');
      }
      
      if (apiError.message?.includes('User location is not supported')) {
        throw new Error('⚠️ Gemini API không khả dụng ở khu vực của bạn. Thử dùng VPN.');
      }
      
      throw new Error(`Gemini API Error: ${apiError.message || 'Unknown error'}`);
    }

    if (!result || !result.response) {
      throw new Error('⚠️ Không nhận được phản hồi từ Gemini API');
    }

    const responseText = result.response.text();
    
    if (!responseText || responseText.trim().length === 0) {
      throw new Error('⚠️ Gemini trả về response rỗng');
    }
    
    console.log('📝 Response length:', responseText.length);
    
    // Clean response
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '');
    }

    // Parse JSON
    let analysisResult;
    try {
      analysisResult = JSON.parse(cleanedText) as AnalysisResult;
    } catch (parseError: any) {
      console.error('JSON Parse Error:', parseError);
      console.error('Response text:', cleanedText.substring(0, 500));
      throw new Error('⚠️ Không thể parse response từ Gemini. Response không phải JSON hợp lệ.');
    }
    
    console.log("✅ Phân tích thành công!");
    console.log("📊 Điểm:", analysisResult.matchScore);
    
    return analysisResult;

  } catch (error: any) {
    console.error("❌ Lỗi:", error);
    
    if (error.message?.includes('API key') || error.message?.includes('API_KEY')) {
      throw new Error("⚠️ API Key không hợp lệ hoặc chưa cấu hình.\n\nKiểm tra:\n1. API key đúng từ https://aistudio.google.com/apikey\n2. Đã thêm VITE_GEMINI_API_KEY vào .env.local (local) hoặc Vercel\n3. Đã restart dev server hoặc redeploy");
    }
    
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      throw new Error("⚠️ Model không tồn tại.\n\nĐang dùng: gemini-1.5-pro\nNếu vẫn lỗi, kiểm tra API key còn hoạt động.");
    }
    
    throw new Error(error.message || "Lỗi không xác định khi phân tích CV");
  }
};
