import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { base64Data, mimeType, targetJob } = req.body;

    if (!base64Data || !mimeType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not found');
      return res.status(500).json({ 
        error: 'GEMINI_API_KEY not configured' 
      });
    }

    console.log('✅ API Key found');

    // Gọi trực tiếp REST API của Gemini
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = `
Bạn là Voltria AI - Chuyên gia phân tích CV. Phân tích CV cho vị trí: ${targetJob || "Tổng quát"}

Trả về JSON với cấu trúc SAU (KHÔNG thêm markdown backticks):
{
  "candidateLevel": "Junior/Mid/Senior",
  "summary": "Tóm tắt ứng viên 2-3 câu bằng Tiếng Việt",
  "matchScore": 75,
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2", "Điểm mạnh 3"],
  "weaknesses": ["Điểm yếu 1", "Điểm yếu 2"],
  "detailedAnalysis": {
    "experienceMatch": "Phân tích kinh nghiệm bằng Tiếng Việt",
    "skillsAssessment": "Đánh giá kỹ năng bằng Tiếng Việt",
    "jobStability": "Đánh giá độ ổn định",
    "employmentGaps": "Phân tích khoảng trống",
    "progressionAndAwards": "Thăng tiến và giải thưởng",
    "teamworkAndSoftSkills": "Kỹ năng mềm",
    "proactivity": "Tính chủ động"
  },
  "suggestedJobs": [
    {"title": "Tên công việc phù hợp", "description": "Mô tả bằng Tiếng Việt"}
  ],
  "suggestedProjects": [
    {"title": "Tên dự án đề xuất", "description": "Mô tả bằng Tiếng Việt"}
  ],
  "suggestedCollaborators": [
    {"title": "Loại cộng tác viên", "description": "Mô tả bằng Tiếng Việt"}
  ],
  "developmentRoadmap": {
    "courses": [
      {
        "name": "Tên khóa học cụ thể",
        "provider": "Coursera/Udemy/EdX",
        "description": "Tại sao cần học bằng Tiếng Việt"
      }
    ],
    "projects": [
      {
        "name": "Tên dự án thực hành",
        "durationOrType": "3 tháng / Open Source",
        "description": "Mô tả dự án bằng Tiếng Việt"
      }
    ],
    "jobs": [
      {
        "name": "Vị trí công việc",
        "provider": "Tên công ty VN (VD: Viettel, FPT...)",
        "description": "Yêu cầu và mức lương bằng Tiếng Việt"
      }
    ]
  }
}

QUAN TRỌNG: 
- TẤT CẢ nội dung PHẢI bằng Tiếng Việt
- CHỈ trả về JSON thuần, KHÔNG thêm text giải thích
- KHÔNG dùng markdown code blocks
`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        topP: 0.95,
      }
    };

    console.log('📤 Sending request to Gemini REST API...');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API Error:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📥 Received response from Gemini');

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response structure from Gemini');
    }

    let text = data.candidates[0].content.parts[0].text;
    
    // Clean JSON
    text = text.trim();
    if (text.startsWith("```json")) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    if (text.startsWith("```")) {
      text = text.replace(/```\n?/g, '');
    }

    const analysisResult = JSON.parse(text);
    
    console.log('✅ Analysis successful');
    return res.status(200).json(analysisResult);

  } catch (error: any) {
    console.error('❌ Error:', error);
    
    let errorMessage = 'Đã xảy ra lỗi khi phân tích CV';
    
    if (error.message?.includes('API key not valid') || error.message?.includes('API_KEY_INVALID')) {
      errorMessage = 'API Key không hợp lệ. Vui lòng kiểm tra lại.';
    } else if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      errorMessage = 'Đã vượt quá giới hạn API miễn phí.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return res.status(500).json({ error: errorMessage });
  }
}
