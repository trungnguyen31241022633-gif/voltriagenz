import { AnalysisResult } from "../types";

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
      throw new Error(`File quá lớn (${sizeInMB.toFixed(2)}MB). Vui lòng chọn file nhỏ hơn 3MB hoặc giảm độ phân giải.`);
    }

    console.log("🎯 Vị trí mục tiêu:", targetJob || "Tổng quát");

    // Call API
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Data: processedData,
        mimeType: processedMime,
        targetJob: targetJob || ''
      })
    });

    if (!response.ok) {
      let errorMessage = 'Lỗi khi gọi API';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        
        if (errorMessage.includes('API key')) {
          errorMessage = '⚠️ Chưa cấu hình API Key. Vui lòng thêm GEMINI_API_KEY vào Vercel Environment Variables.';
        } else if (response.status === 413) {
          errorMessage = '⚠️ File quá lớn. Vui lòng chọn file nhỏ hơn hoặc giảm độ phân giải.';
        }
      } catch (e) {
        if (response.status === 413) {
          errorMessage = '⚠️ File quá lớn (Payload Too Large). Vui lòng chọn file nhỏ hơn 3MB.';
        } else {
          errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const analysisResult = await response.json() as AnalysisResult;
    
    console.log("✅ Phân tích thành công!");
    console.log("📊 Điểm phù hợp:", analysisResult.matchScore);
    
    return analysisResult;

  } catch (error: any) {
    console.error("❌ Lỗi phân tích:", error);
    
    if (error.message?.includes('Failed to fetch')) {
      throw new Error("⚠️ Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
    }
    
    throw new Error(error.message || "Đã xảy ra lỗi không xác định khi phân tích CV");
  }
};
