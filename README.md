# 🚀 Voltria - Phân Tích CV Thông Minh

Công cụ phân tích CV hiện đại sử dụng AI (Gemini 2.5 Flash) để đánh giá hồ sơ theo mục tiêu công việc cụ thể, xác định điểm mạnh, điểm yếu và cơ hội nghề nghiệp.

![Voltria Banner](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

---

## ✨ Tính Năng Chính

- 🤖 **Phân tích AI thông minh** - Powered by Gemini 2.5 Flash
- 📊 **Đánh giá đa chiều** - Kinh nghiệm, kỹ năng, ổn định công việc
- 🎯 **Lộ trình phát triển** - Khóa học, dự án, cơ hội việc làm
- 📈 **Visualization** - Biểu đồ radar đẹp mắt
- 🎨 **UI/UX hiện đại** - Responsive, mượt mà

---

## 🛠️ Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** TailwindCSS
- **Charts:** Recharts
- **AI:** Google Gemini 2.5 Flash
- **Icons:** Lucide React
- **Deploy:** Vercel

---

## 🚀 Deploy Lên Vercel

### Cách 1: Quick Deploy (Khuyên dùng)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/voltria)

Sau khi click:
1. Vercel sẽ fork repo về tài khoản bạn
2. Thêm Environment Variable:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** API key từ [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Click Deploy

### Cách 2: Manual Deploy

Xem hướng dẫn chi tiết tại:
- **📘 Đầy đủ:** [SETUP_VERCEL.md](./SETUP_VERCEL.md)
- **⚡ Nhanh:** [SETUP_NHANH.md](./SETUP_NHANH.md)

```bash
# 1. Clone repo
git clone https://github.com/your-username/voltria.git
cd voltria

# 2. Push lên GitHub của bạn
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push origin main

# 3. Deploy trên Vercel
# Vào vercel.com/new, import repo, thêm GEMINI_API_KEY, deploy!
```

---

## 💻 Run Local (Development)

### Prerequisites
- Node.js 18+
- npm hoặc yarn
- Gemini API Key

### Setup

1. **Clone repository:**
```bash
git clone https://github.com/your-username/voltria.git
cd voltria
```

2. **Install dependencies:**
```bash
npm install
```

3. **Tạo file `.env.local`:**
```bash
# Tạo file .env.local (CHỈ dùng local, KHÔNG commit)
echo "GEMINI_API_KEY=your_api_key_here" > .env.local
```

4. **Lấy Gemini API Key:**
   - Vào: https://makersuite.google.com/app/apikey
   - Login và tạo API key
   - Copy và paste vào `.env.local`

5. **Run dev server:**
```bash
npm run dev
```

6. **Mở trình duyệt:**
```
http://localhost:3000
```

### Build Production

```bash
npm run build
npm run preview  # Test production build
```

---

## 📁 Cấu Trúc Project

```
voltria/
├── src/
│   ├── components/          # React components
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── LandingPage.tsx
│   │   ├── UploadSection.tsx
│   │   ├── AnalysisResult.tsx
│   │   ├── MyActivities.tsx
│   │   └── Marquee.tsx
│   ├── services/
│   │   └── geminiService.ts # Gemini API integration
│   ├── types.ts             # TypeScript types
│   ├── App.tsx              # Main app component
│   └── index.tsx            # Entry point
├── public/                  # Static assets
├── vercel.json             # Vercel configuration
├── vite.config.ts          # Vite configuration
├── .gitignore              # Git ignore (bao gồm .env*)
├── SETUP_VERCEL.md         # Hướng dẫn deploy đầy đủ
├── SETUP_NHANH.md          # Hướng dẫn deploy nhanh
└── README.md               # File này
```

---

## 🔒 Bảo Mật

### ⚠️ QUAN TRỌNG

**API Key KHÔNG BAO GIỜ được commit vào Git!**

- ✅ Lưu API key trên Vercel Environment Variables
- ✅ File `.env.local` chỉ dùng local development
- ✅ `.gitignore` đã loại trừ tất cả `.env*` files
- ❌ KHÔNG hardcode API key trong code
- ❌ KHÔNG commit file `.env`

### Nếu Lỡ Leak API Key:
1. Xóa ngay key cũ trên Google AI Studio
2. Tạo key mới
3. Update trên Vercel Environment Variables
4. Redeploy

---

## 📊 Features Demo

### 1. Upload CV
- Hỗ trợ PDF, PNG, JPG, WebP
- Drag & drop hoặc click để chọn
- Preview file trước khi phân tích

### 2. Phân Tích Thông Minh
- Tóm tắt hồ sơ
- Điểm phù hợp (0-100)
- Điểm mạnh / Điểm yếu
- Phân tích chi tiết 7 khía cạnh

### 3. Lộ Trình Phát Triển
- **Giai đoạn 1:** Khóa học & Chứng chỉ
- **Giai đoạn 2:** Dự án thực tế
- **Giai đoạn 3:** Cơ hội việc làm

### 4. Quản Lý Hoạt Động
- Lưu các khóa học/dự án/công việc đã đăng ký
- Theo dõi tiến độ
- Sidebar quản lý dễ dàng

---

## 🌐 Environment Variables

### Trên Vercel:

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | API key từ Google AI Studio |

### Local Development:

Tạo file `.env.local`:
```bash
GEMINI_API_KEY=your_api_key_here
```

**⚠️ Lưu ý:** File `.env.local` đã được ignore trong `.gitignore`

---

## 🐛 Troubleshooting

### Build Error

```bash
# Xóa node_modules và reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### API Key Error

- Kiểm tra key có đúng format `AIzaSy...`
- Verify key còn active trên Google AI Studio
- Đảm bảo đã add vào Vercel Environment Variables

### 404 Error trên Vercel

- Đảm bảo có file `vercel.json` với rewrites config
- Redeploy project

---

## 📈 Roadmap

- [x] Phân tích CV cơ bản
- [x] Lộ trình phát triển 3 giai đoạn
- [x] Quản lý hoạt động
- [ ] Multi-language support
- [ ] Export báo cáo PDF
- [ ] Lưu lịch sử phân tích
- [ ] So sánh nhiều CV
- [ ] Integration với LinkedIn

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Team

**Voltria Team**
- 🌐 Website: [voltria.vercel.app](https://voltria.vercel.app)
- 📧 Email: contact@voltria.com

---

## 🙏 Acknowledgments

- **Google Gemini** - AI model
- **Vercel** - Hosting platform
- **Tailwind CSS** - Styling framework
- **Recharts** - Data visualization
- **Lucide** - Icons

---

## 📞 Support

Cần hỗ trợ? Mở issue trên GitHub hoặc xem:
- 📘 [Hướng dẫn đầy đủ](./SETUP_VERCEL.md)
- ⚡ [Hướng dẫn nhanh](./SETUP_NHANH.md)

---

**Made with ❤️ by Voltria Team**

⭐ **Star repo nếu bạn thấy hữu ích!**
