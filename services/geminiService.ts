import { AnalysisResult } from "../types";
import { GoogleGenAI, Type } from "@google/genai";


// ĐÃ SỬA: Thay đổi từ process.env.API_KEY sang process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
Bạn là Voltria, một Chuyên gia Tuyển dụng AI cao cấp. Mục tiêu của bạn là phân tích sâu CV (Sơ yếu lý lịch) và đưa ra phản hồi có cấu trúc dựa trên các quy tắc đánh giá cụ thể.

**QUAN TRỌNG:** TẤT CẢ NỘI DUNG TRẢ LỜI PHẢI BẰNG TIẾNG VIỆT.

**Quy tắc phân tích:**
1. **Tóm tắt hồ sơ:** Viết một đoạn văn ngắn gọn (khoảng 3-4 câu) tóm tắt tổng quan về ứng viên, năng lực cốt lõi, kinh nghiệm nổi bật nhất và phong cách làm việc.
2. **Kinh nghiệm làm việc:** Đánh giá mức độ liên quan đến "Vị trí Mục tiêu" của người dùng. Tìm kiếm số lượng dự án, kỹ thuật sử dụng và tác động cụ thể (doanh thu, tối ưu hóa quy trình). Cảnh báo nếu có quá nhiều kinh nghiệm không liên quan.
3. **Kỹ năng:** Kiểm tra sự phù hợp giữa kỹ năng được liệt kê và yêu cầu của "Vị trí Mục tiêu". Phân biệt mức độ liên quan của kỹ năng cứng và mềm.
4. **Lịch sử làm việc (Sự ổn định):**
   - < 1 năm tại một công ty (trừ thực tập/hợp đồng) = Có thể là Nhảy việc. Tìm lý do.
   - Lưu ý: Nhảy việc cũng có thể tích cực (khả năng thích ứng, mạng lưới), hãy cân nhắc cả hai mặt.
5. **Khoảng trống việc làm:** Tìm các khoảng trống (3-6 tháng). Có thể là dấu hiệu sa thải hoặc vấn đề cá nhân, nhưng hãy xem xét kỹ.
6. **Thăng tiến/Giải thưởng:** Tìm kiếm sự thăng chức, tăng trách nhiệm và các giải thưởng cụ thể. Điều này cho thấy động lực.
7. **Làm việc nhóm:** Tìm các từ khóa như "Giám sát", "Cố vấn", "Hỗ trợ", "Giảng dạy".
8. **Sự chủ động:** Tìm kiếm các cải tiến quy trình, giải pháp mới hoặc các chứng chỉ/kỹ năng mới cập nhật.

**Yêu cầu đầu ra:**
Bạn phải trả về một đối tượng JSON hợp lệ. Các trường mô tả, danh sách điểm mạnh/yếu, và gợi ý phải viết bằng Tiếng Việt văn phong chuyên nghiệp.
`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    candidateLevel: { type: Type.STRING, description: "Cấp độ ước tính (ví dụ: Junior, Mid-Level, Senior, Lead)" },
    summary: { type: Type.STRING, description: "Đoạn văn tóm tắt hồ sơ ứng viên (3-4 câu)" },
    matchScore: { type: Type.INTEGER, description: "Điểm số từ 0 đến 100 dựa trên mức độ phù hợp với công việc mục tiêu" },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Danh sách các điểm mạnh chính tìm thấy trong CV"
    },
    weaknesses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Danh sách các điểm cần cải thiện hoặc cảnh báo"
    },
    detailedAnalysis: {
      type: Type.OBJECT,
      properties: {
        experienceMatch: { type: Type.STRING, description: "Đánh giá chi tiết về kinh nghiệm" },
        skillsAssessment: { type: Type.STRING, description: "Đánh giá về kỹ năng" },
        jobStability: { type: Type.STRING, description: "Phân tích về lịch sử nhảy việc hoặc thâm niên" },
        employmentGaps: { type: Type.STRING, description: "Phân tích khoảng trống việc làm" },
        progressionAndAwards: { type: Type.STRING, description: "Phân tích thăng tiến và giải thưởng" },
        teamworkAndSoftSkills: { type: Type.STRING, description: "Phân tích kỹ năng mềm và làm việc nhóm" },
        proactivity: { type: Type.STRING, description: "Phân tích sự chủ động" }
      },
      required: ["experienceMatch", "skillsAssessment", "jobStability", "employmentGaps", "progressionAndAwards", "teamworkAndSoftSkills", "proactivity"]
    },
    suggestedJobs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING }
        }
      }
    },
    suggestedProjects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING }
        }
      }
    },
    suggestedCollaborators: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Vai trò hoặc kiểu người nên làm việc cùng (ví dụ: Senior Backend Dev)" },
          description: { type: Type.STRING }
        }
      }
    }
  },
  required: ["candidateLevel", "summary", "matchScore", "strengths", "weaknesses", "detailedAnalysis", "suggestedJobs", "suggestedProjects", "suggestedCollaborators"]
};

export const analyzeCV = async (base64Data: string, mimeType: string, targetJob: string): Promise<AnalysisResult> => {
  try {
    const prompt = `Vị trí công việc mục tiêu: ${targetJob || "Đánh giá tổng quát"}. 
    Hãy phân tích CV đính kèm dựa trên hướng dẫn hệ thống đã cung cấp. Trả lời hoàn toàn bằng Tiếng Việt.`;

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
