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

    // Gọi API route của Vercel
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Data,
        mimeType,
        targetJob: targetJob || ''
      })
    });

    // Xử lý lỗi HTTP
    if (!response.ok) {
      let errorMessage = 'Lỗi khi gọi API';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        
        // Hiển thị thông báo lỗi cụ thể
        if (errorMessage.includes('API key')) {
          errorMessage = '⚠️ Chưa cấu hình API Key. Vui lòng thêm GEMINI_API_KEY vào Vercel Environment Variables.';
        }
      } catch (e) {
        // Nếu không parse được JSON, dùng status text
        errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const analysisResult = await response.json() as AnalysisResult;
    
    console.log("✅ Phân tích thành công!");
    console.log("📊 Điểm phù hợp:", analysisResult.matchScore);
    
    return analysisResult;

  } catch (error: any) {
    console.error("❌ Lỗi phân tích:", error);
    
    // Xử lý các loại lỗi khác nhau
    if (error.message?.includes('Failed to fetch')) {
      throw new Error("⚠️ Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
    }
    
    if (error.message?.includes('API key')) {
      throw new Error(error.message);
    }
    
    throw new Error(error.message || "Đã xảy ra lỗi không xác định khi phân tích CV");
  }
};
