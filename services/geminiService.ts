import { AnalysisResult } from "../types";

// Compress image before sending to API
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

    console.log('📤 Calling backend API...');

    // ✅ Call our serverless function instead of Gemini directly
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileData: processedData,
        mimeType: processedMime,
        targetJob: targetJob || ''
      })
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Error:', errorData);
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }

    const analysisResult: AnalysisResult = await response.json();
    
    console.log("✅ Phân tích thành công!");
    console.log("📊 Điểm phù hợp:", analysisResult.matchScore);
    
    return analysisResult;

  } catch (error: any) {
    console.error("❌ Lỗi:", error);
    
    // Network errors
    if (error.message?.includes('Failed to fetch')) {
      throw new Error('⚠️ Không thể kết nối đến server.\n\nKiểm tra:\n1. Kết nối mạng\n2. Server đang chạy (npm run dev)');
    }
    
    // API errors
    if (error.message?.includes('API Key')) {
      throw new Error('⚠️ API Key chưa cấu hình trên server.\n\nLocal: Thêm vào .env.local\nVercel: Settings → Environment Variables');
    }
    
    throw new Error(error.message || "Lỗi không xác định khi phân tích CV");
  }
};
