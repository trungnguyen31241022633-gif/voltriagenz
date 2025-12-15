import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: "AIzaSyBVmPLMzPY7iZtqCdh56QfKxG_Zo0RWtZk" });

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
  type: Type.OBJECT,
  properties: {
    candidateLevel: { type: Type.STRING, description: "Cấp độ ước tính (Junior, Senior...)" },
    summary: { type: Type.STRING },
    matchScore: { type: Type.INTEGER },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
    detailedAnalysis: {
      type: Type.OBJECT,
      properties: {
        experienceMatch: { type: Type.STRING },
        skillsAssessment: { type: Type.STRING },
        jobStability: { type: Type.STRING },
        employmentGaps: { type: Type.STRING },
        progressionAndAwards: { type: Type.STRING },
        teamworkAndSoftSkills: { type: Type.STRING },
        proactivity: { type: Type.STRING }
      },
      required: ["experienceMatch", "skillsAssessment", "jobStability", "employmentGaps", "progressionAndAwards", "teamworkAndSoftSkills", "proactivity"]
    },
    suggestedJobs: {
      type: Type.ARRAY,
      items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } } }
    },
    suggestedProjects: {
      type: Type.ARRAY,
      items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } } }
    },
    suggestedCollaborators: {
      type: Type.ARRAY,
      items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } } }
    },
    developmentRoadmap: {
      type: Type.OBJECT,
      description: "Lộ trình phát triển 3 bước",
      properties: {
        courses: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Tên khóa học/chứng chỉ" },
              provider: { type: Type.STRING, description: "Nền tảng hoặc tổ chức cấp (Coursera, Google...)" },
              description: { type: Type.STRING, description: "Tại sao cần học cái này?" }
            }
          }
        },
        projects: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Tên dự án/Startup idea" },
              durationOrType: { type: Type.STRING, description: "Quy mô (Nhỏ, Trung bình, Startup)" },
              description: { type: Type.STRING, description: "Mô tả dự án cần làm" }
            }
          }
        },
        jobs: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Vị trí công việc" },
              provider: { type: Type.STRING, description: "Tên công ty (Mô phỏng)" },
              description: { type: Type.STRING, description: "Yêu cầu chính hoặc mức lương ước tính" }
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
    const prompt = `Vị trí công việc mục tiêu: ${targetJob || "Đánh giá tổng quát"}. 
    Hãy phân tích CV đính kèm và tạo lộ trình phát triển. Trả lời hoàn toàn bằng Tiếng Việt.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    if (!response.text) {
      throw new Error("Không nhận được phản hồi từ Gemini");
    }

    const result = JSON.parse(response.text) as AnalysisResult;
    return result;
  } catch (error) {
    console.error("Lỗi phân tích Gemini:", error);
    throw error;
  }
};
