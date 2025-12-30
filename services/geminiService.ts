import { AnalysisResult } from "../types";
import { GoogleGenerativeAI } from '@google/generative-ai';

// Compress image before sending
const compressImage = async (base64Data: string, mimeType: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Resize if too large (max 1200px)
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
      
      // Compress to JPEG with 0.7 quality
      const compressed = canvas.toDataURL('image/jpeg', 0.7);
      resolve(compressed.split(',')[1]);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = `data:${mimeType};base64,${base64Data}`;
  });
};

export const analyzeCV = async (
  base64Data: string, 
  mimeType: string, 
  targetJob: string
): Promise<AnalysisResult> => {
  try {
    console.log("🚀 Bắt đầu phân tích CV...");
    console.log("📄 MIME Type:", mimeType);
    console.log("📦 Original size:", (base64Data.length * 0.75 / 1024).toFixed(2), "KB");

    // Compress image if needed
    let processedData = base64Data;
    let processedMime = mimeType;
    
    if (mimeType.startsWith('image/') && mimeType !== 'image/gif') {
      console.log("🗜️ Compressing image...");
      try {
        processedData = await compressImage(base64Data, mimeType);
        processedMime = 'image/jpeg';
        console.log("✅ Compressed size:", (processedData.length * 0.75 / 1024).toFixed(2), "KB");
      } catch (e) {
        console.warn("⚠️ Compression failed, using original");
      }
    }

    // Check size limit (3MB after compression)
    const sizeInMB = (processedData.length * 0.75) / (1024 * 1024);
    if (sizeInMB > 3) {
      throw new Error(`File quá lớn (${sizeInMB.toFixed(2)}MB). Vui lòng chọn file nhỏ hơn 3MB.`);
    }

    // Get API key from environment
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('⚠️ Chưa cấu hình API Key. Vui lòng thêm VITE_GEMINI_API_KEY vào file .env.local');
    }

    console.log('🔑 API Key found:', apiKey.substring(0, 10) + '...');
    console.log('🎯 Target Job:', targetJob || 'General');

    // Initialize Gemini AI directly in frontend
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // ✅ Use Gemini 1.5 Flash (stable, free, supports vision)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
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

    console.log('📤 Sending request to Gemini API...');

    // Call Gemini API directly
    const result = await model.generateContent([
      {
        inlineData: {
          data: processedData,
          mimeType: processedMime
        }
      },
      prompt
    ]);

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

    const analysisResult = JSON.parse(cleanedText) as AnalysisResult;
    
    console.log("✅ Phân tích thành công!");
    console.log("📊 Điểm phù hợp:", analysisResult.matchScore);
    
    return analysisResult;

  } catch (error: any) {
    console.error("❌ Lỗi phân tích:", error);
    
    // Handle specific errors
    if (error.message?.includes('API key') || error.message?.includes('API_KEY')) {
      throw new Error("⚠️ API Key không hợp lệ. Vui lòng kiểm tra VITE_GEMINI_API_KEY trong file .env.local");
    }
    
    if (error.message?.includes('not found') || error.message?.includes('NOT_FOUND') || error.message?.includes('404')) {
      throw new Error("⚠️ Model không khả dụng. Vui lòng kiểm tra API key và thử lại.");
    }
    
    if (error.message?.includes('quota') || error.message?.includes('limit') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      throw new Error("⚠️ Đã vượt quá giới hạn API. Vui lòng thử lại sau.");
    }
    
    if (error.message?.includes('PERMISSION_DENIED')) {
      throw new Error("⚠️ API key không có quyền truy cập. Vui lòng kiểm tra lại key.");
    }
    
    if (error.message?.includes('Failed to fetch')) {
      throw new Error("⚠️ Không thể kết nối đến Gemini API. Vui lòng kiểm tra kết nối mạng.");
    }
    
    throw new Error(error.message || "Đã xảy ra lỗi không xác định khi phân tích CV");
  }
};
