import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult } from "../types";

// Lấy API key từ environment variables
const getApiKey = (): string => {
  // Thử nhiều cách đọc env variable
  const key = import.meta.env.VITE_GEMINI_API_KEY || 
              import.meta.env.GEMINI_API_KEY ||
              (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : null) ||
              (typeof process !== 'undefined' ? process.env.VITE_GEMINI_API_KEY : null);
  
  if (!key) {
    throw new Error(
      "❌ Không tìm thấy GEMINI_API_KEY!\n\n" +
      "Vui lòng kiểm tra:\n" +
      "1. Trên Vercel: Đã thêm GEMINI_API_KEY hoặc VITE_GEMINI_API_KEY\n" +
      "2. Local: Đã tạo file .env.local với VITE_GEMINI_API_KEY=your_key\n" +
      "3. Đã Redeploy sau khi thêm biến\n\n" +
      "Lấy API key tại: https://aistudio.google.com/app/apikey"
    );
  }
  
  return key;
};

// Khởi tạo Gemini AI
let genAI: GoogleGenerativeAI;
try {
  genAI = new GoogleGenerativeAI(getApiKey());
} catch (error) {
  console.error("Lỗi khởi tạo Gemini:", error);
  throw error;
}

const SYSTEM_INSTRUCTION = `
Bạn là Voltria AI - Chuyên gia phân tích CV chuyên nghiệp.

**Nhiệm vụ:** Phân tích CV và đưa ra đánh giá toàn diện bằng Tiếng Việt.

**Yêu cầu:**
1. Đánh giá điểm mạnh/yếu rõ ràng
2. Phân tích 7 khía cạnh: Kinh nghiệm, Kỹ năng, Ổn định công việc, Khoảng trống, Thăng tiến, Kỹ năng mềm, Chủ động
3. Đề xuất lộ trình phát triển 3 giai đoạn:
   - Giai đoạn 1: Khóa học/Chứng chỉ cần thiết (Coursera, Udemy, AWS...)
   - Giai đoạn 2: Dự án thực hành (Pet project, Open Source...)
   - Giai đoạn 3: Cơ hội việc làm phù hợp (Công ty cụ thể, vị trí, lương)

**Định dạng:** Trả về JSON chuẩn, văn phong chuyên nghiệp, động viên.
`;

export const analyzeCV = async (
  base64Data: string, 
  mimeType: string, 
  targetJob: string
): Promise<AnalysisResult> => {
  try {
    console.log("🚀 Bắt đầu phân tích CV...");
    console.log("📄 MIME Type:", mimeType);
    console.log("🎯 Vị trí mục tiêu:", targetJob || "Tổng quát");

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION
    });

    const prompt = `
Phân tích CV này cho vị trí: ${targetJob || "Đánh giá tổng quát"}

Trả về JSON với cấu trúc SAU:
{
  "candidateLevel": "Junior/Mid/Senior",
  "summary": "Tóm tắt 2-3 câu",
  "matchScore": 75,
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2", "Điểm mạnh 3"],
  "weaknesses": ["Điểm yếu 1", "Điểm yếu 2"],
  "detailedAnalysis": {
    "experienceMatch": "Phân tích kinh nghiệm...",
    "skillsAssessment": "Đánh giá kỹ năng...",
    "jobStability": "Đánh giá độ ổn định...",
    "employmentGaps": "Phân tích khoảng trống...",
    "progressionAndAwards": "Thăng tiến và giải thưởng...",
    "teamworkAndSoftSkills": "Kỹ năng mềm...",
    "proactivity": "Tính chủ động..."
  },
  "suggestedJobs": [
    {"title": "Tên công việc", "description": "Mô tả"}
  ],
  "suggestedProjects": [
    {"title": "Tên dự án", "description": "Mô tả"}
  ],
  "suggestedCollaborators": [
    {"title": "Loại cộng tác viên", "description": "Mô tả"}
  ],
  "developmentRoadmap": {
    "courses": [
      {
        "name": "Tên khóa học",
        "provider": "Coursera/Udemy",
        "description": "Tại sao cần học"
      }
    ],
    "projects": [
      {
        "name": "Tên dự án",
        "durationOrType": "3 tháng",
        "description": "Mô tả dự án"
      }
    ],
    "jobs": [
      {
        "name": "Vị trí công việc",
        "provider": "Tên công ty",
        "description": "Yêu cầu và lương"
      }
    ]
  }
}

QUAN TRỌNG: CHỈ trả về JSON, KHÔNG thêm text khác.
`;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    };

    console.log("📤 Gửi request đến Gemini...");
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    let text = response.text();

    console.log("📥 Nhận response từ Gemini");
    console.log("📝 Response:", text.substring(0, 200) + "...");

    if (!text) {
      throw new Error("Không nhận được phản hồi từ Gemini AI");
    }

    // Clean JSON response
    text = text.trim();
    if (text.startsWith("```json")) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    if (text.startsWith("```")) {
      text = text.replace(/```\n?/g, '');
    }

    const analysisResult = JSON.parse(text) as AnalysisResult;
    console.log("✅ Phân tích thành công!");
    
    return analysisResult;
  } catch (error: any) {
    console.error("❌ Lỗi phân tích:", error);
    
    // Detailed error messages
    if (error.message?.includes('API key not valid') || error.message?.includes('API_KEY_INVALID')) {
      throw new Error(
        "❌ API Key không hợp lệ!\n\n" +
        "Vui lòng kiểm tra:\n" +
        "1. API Key đúng format (bắt đầu bằng AIzaSy...)\n" +
        "2. API Key còn active trên Google AI Studio\n" +
        "3. Đã enable Gemini API trên project\n\n" +
        "Lấy key mới tại: https://aistudio.google.com/app/apikey"
      );
    } else if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      throw new Error("❌ Đã vượt quá giới hạn API miễn phí. Vui lòng thử lại sau hoặc nâng cấp API key.");
    } else if (error.message?.includes('parse')) {
      throw new Error("❌ Lỗi parse JSON response. Có thể CV quá phức tạp, vui lòng thử lại.");
    } else {
      throw new Error(`❌ Lỗi không xác định: ${error.message}`);
    }
  }
};
