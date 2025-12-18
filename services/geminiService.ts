import { AnalysisResult } from "../types";

export const analyzeCV = async (
  base64Data: string, 
  mimeType: string, 
  targetJob: string
): Promise<AnalysisResult> => {
  try {
    console.log("🚀 Bắt đầu phân tích CV...");
    console.log("📄 MIME Type:", mimeType);
    console.log("🎯 Vị trí mục tiêu:", targetJob || "Tổng quát");

    // Gọi API route thay vì gọi trực tiếp Gemini
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Data,
        mimeType,
        targetJob
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Lỗi khi gọi API');
    }

    const analysisResult = await response.json() as AnalysisResult;
    console.log("✅ Phân tích thành công!");
    
    return analysisResult;

  } catch (error: any) {
    console.error("❌ Lỗi phân tích:", error);
    throw new Error(error.message || "Đã xảy ra lỗi khi phân tích CV");
  }
};
