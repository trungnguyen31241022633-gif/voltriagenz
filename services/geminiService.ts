import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult } from "../types";

// Lấy API key từ Vercel Environment Variables
const getApiKey = (): string => {
  // Thử các cách khác nhau để lấy env variable
  const key = process.env.GEMINI_API_KEY || 
              import.meta.env.GEMINI_API_KEY;
  
  if (!key) {
    throw new Error(
      "❌ GEMINI_API_KEY chưa được cấu hình!\n\n" +
      "Vui lòng thêm API key trên Vercel:\n" +
      "1. Vào Project Settings → Environment Variables\n" +
      "2. Thêm: GEMINI_API_KEY = your_api_key\n" +
      "3. Redeploy project\n\n" +
      "Lấy API key tại: https://makersuite.google.com/app/apikey"
    );
  }
  
  return key;
};

// Khởi tạo Gemini AI client
const genAI = new GoogleGenerativeAI(getApiKey());

const SYSTEM_INSTRUCTION = `
Bạn là Voltria, một Chuyên gia Tuyển dụng AI cao cấp. Mục tiêu của bạn là phân tích sâu CV và đưa ra phản hồi có cấu trúc.

**QUAN TRỌNG:** TẤT CẢ NỘI DUNG TRẢ LỜI PHẢI BẰNG TIẾNG VIỆT.

**Quy tắc phân tích:**
1. **Tóm tắt & Đánh giá:** Như quy trình chuẩn (Kinh nghiệm, Kỹ năng, Ổn định, Khoảng trống...).
2. **Lộ trình phát triển (Roadmap):** Bạn PHẢI đề xuất một lộ trình 3 giai đoạn rõ ràng để ứng viên thăng tiến:
   - **Giai đoạn 1: Nâng cao kiến thức.** Đề xuất các khóa học cụ thể (tên khóa, nền tảng như Coursera/Udemy/EdX) hoặc chứng chỉ (AWS, IELTS, PMP...) cần thiết để lấp lỗ hổng kỹ năng.
   - **Giai đoạn 2: Thực hành & Xây dựng Portfolio.** Đề xuất các dự án cá nhân (Project nhỏ), tham gia Open Source, hoặc ý tưởng Start-up nhỏ phù hợp với kỹ năng để làm giàu CV.
   - **Giai đoạn 3: Cơ hội nghề nghiệp (Fake Data mô phỏng thực tế).** Đề xuất các vị trí tại các loại hình công ty cụ thể (ví dụ: "Tập đoàn công nghệ Viettel - Vị trí Junior Dev", "Startup Fintech tại TP.HCM - Vị trí BA"). Hãy bịa ra các tên công ty hoặc dùng tên công ty thật phổ biến để tạo cảm giác thực tế.

**Yêu cầu đầu ra:**
Trả về JSON hợp lệ khớp với Schema. Văn phong chuyên nghiệp, khích lệ.
`;

const responseSchema = {
  type: "object",
  properties: {
    candidateLevel: { type: "string", description: "Cấp độ ước tính (Junior, Senior...)" },
    summary: { type: "string" },
    matchScore: { type: "integer" },
    strengths: { type: "array", items: { type: "string" } },
    weaknesses: { type: "array", items: { type: "string" } },
    detailedAnalysis: {
      type: "object",
      properties: {
        experienceMatch: { type: "string" },
        skillsAssessment: { type: "string" },
        jobStability: { type: "string" },
        employmentGaps: { type: "string" },
        progressionAndAwards: { type: "string" },
        teamworkAndSoftSkills: { type: "string" },
        proactivity: { type: "string" }
      },
      required: ["experienceMatch", "skillsAssessment", "jobStability", "employmentGaps", "progressionAndAwards", "teamworkAndSoftSkills", "proactivity"]
    },
    suggestedJobs: {
      type: "array",
      items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" } } }
    },
    suggestedProjects: {
      type: "array",
      items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" } } }
    },
    suggestedCollaborators: {
      type: "array",
      items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" } } }
    },
    developmentRoadmap: {
      type: "object",
      description: "Lộ trình phát triển 3 bước",
      properties: {
        courses: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Tên khóa học/chứng chỉ" },
              provider: { type: "string", description: "Nền tảng hoặc tổ chức cấp (Coursera, Google...)" },
              description: { type: "string", description: "Tại sao cần học cái này?" }
            }
          }
        },
        projects: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Tên dự án/Startup idea" },
              durationOrType: { type: "string", description: "Quy mô (Nhỏ, Trung bình, Startup)" },
              description: { type: "string", description: "Mô tả dự án cần làm" }
            }
          }
        },
        jobs: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Vị trí công việc" },
              provider: { type: "string", description: "Tên công ty (Mô phỏng)" },
              description: { type: "string", description: "Yêu cầu chính hoặc mức lương ước tính" }
            }
          }
        }
      },
      required: ["courses", "projects", "jobs"]
    }
  },
  required: ["candidateLevel", "summary", "matchScore", "strengths", "weaknesses", "detailedAnalysis", "suggestedJobs", "suggestedProjects", "suggestedCollaborators", "developmentRoadmap"]
};

export const analyzeCV = async (base64Data: string, mimeType: string, targetJob: string): Promise<AnalysisResult> => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      },
      systemInstruction: SYSTEM_INSTRUCTION
    });

    const prompt = `Vị trí công việc mục tiêu: ${targetJob || "Đánh giá tổng quát"}. 
    Hãy phân tích CV đính kèm và tạo lộ trình phát triển. Trả lời hoàn toàn bằng Tiếng Việt.`;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Không nhận được phản hồi từ Gemini");
    }

    const analysisResult = JSON.parse(text) as AnalysisResult;
    return analysisResult;
  } catch (error) {
    console.error("Lỗi phân tích Gemini:", error);
    throw error;
  }
};
