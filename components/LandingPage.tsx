import React from 'react';
import Hero from './Hero';
import Marquee from './Marquee';
import { Users, BookOpen, Calendar, Target, ShieldCheck, Cpu, Briefcase, GraduationCap } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col overflow-x-hidden">
      {/* Hero Section */}
      <Hero onStart={onStart} />

      {/* Marquee Banner */}
      <Marquee />

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-base font-semibold text-purple-600 tracking-wide uppercase mb-2">Hệ Sinh Thái Voltria</h2>
            <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Giải Pháp Toàn Diện Cho Sự Nghiệp</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-slate-50 rounded-3xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-purple-100">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Hỗ trợ định hướng 1-1 cùng mentor</h3>
              <p className="text-gray-600 leading-relaxed">
                Kết nối trực tiếp với các chuyên gia đầu ngành để nhận lời khuyên, định hướng lộ trình và giải đáp thắc mắc nghề nghiệp một cách cá nhân hóa.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-slate-50 rounded-3xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-purple-100">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Khóa học nâng cao nghề nghiệp</h3>
              <p className="text-gray-600 leading-relaxed">
                Truy cập kho tàng khóa học chuyên sâu được thiết kế để lấp đầy khoảng trống kỹ năng của bạn, từ kỹ năng mềm đến chuyên môn kỹ thuật.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-slate-50 rounded-3xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-purple-100">
              <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-7 h-7 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Dự thảo và sự kiện hiện tại</h3>
              <p className="text-gray-600 leading-relaxed">
                Cập nhật liên tục các dự án thực tế đang tuyển dụng và các sự kiện networking, hội thảo chuyên đề nóng hổi nhất trong ngành.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        {/* Abstract shapes for visual interest */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-900/20 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Intro Text Matching Image 1 */}
          <div className="max-w-5xl mx-auto text-center mb-20">
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              Voltria là một nền tảng kỹ thuật số đóng vai trò như một cầu nối, liên kết một cách liền mạch giữa sinh viên đang tìm kiếm kinh nghiệm thực tế với các doanh nghiệp và tổ chức cần nguồn nhân lực trẻ trung, nhiệt huyết cho các dự án ngắn hạn và vị trí thực tập.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-24">
            {/* Left Content - Students */}
            <div className="space-y-8 order-2 lg:order-1">
              <h3 className="text-3xl font-bold flex items-center gap-3">
                <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
                Dành cho Sinh viên:
              </h3>
              
              <ul className="space-y-8">
                <li className="flex gap-4">
                  <div className="mt-1 shrink-0">
                     <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Hồ sơ Thông minh & Ghép đôi</h4>
                    <p className="text-gray-400">Tạo hồ sơ chi tiết với các kỹ năng, sở thích và nền tảng học vấn. Nhận đề xuất thực tập/dự án được cá nhân hóa.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 shrink-0">
                     <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Trung tâm Ứng tuyển Thống nhất</h4>
                    <p className="text-gray-400">Tìm kiếm và ứng tuyển vào vô số cơ hội từ các công ty khác nhau thông qua một giao diện đơn giản, thống nhất.</p>
                  </div>
                </li>
                 <li className="flex gap-4">
                  <div className="mt-1 shrink-0">
                     <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Theo dõi Đơn ứng tuyển</h4>
                    <p className="text-gray-400">Giám sát trạng thái của tất cả các đơn ứng tuyển tại một nơi.</p>
                  </div>
                </li>
              </ul>
            </div>
             {/* Right Image Placeholder - Girl with Laptop */}
            <div className="relative order-1 lg:order-2 h-[450px] w-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] overflow-hidden shadow-2xl flex items-center justify-center transform hover:scale-[1.02] transition-transform duration-500">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-40"></div>
                 <div className="relative z-10 text-center p-8">
                    <GraduationCap className="w-24 h-24 text-white mx-auto mb-4 opacity-90" />
                 </div>
                 <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-500 rounded-full blur-3xl opacity-60"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left Image Placeholder - Boy Jumping */}
             <div className="relative h-[450px] w-full bg-gradient-to-bl from-blue-500 to-cyan-500 rounded-[2.5rem] overflow-hidden shadow-2xl flex items-center justify-center transform hover:scale-[1.02] transition-transform duration-500">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-40"></div>
                 <div className="relative z-10 text-center p-8">
                    <Briefcase className="w-24 h-24 text-white mx-auto mb-4 opacity-90" />
                 </div>
                 <div className="absolute -top-10 -left-10 w-40 h-40 bg-yellow-400 rounded-full blur-3xl opacity-60"></div>
            </div>

            {/* Right Content - Business */}
            <div className="space-y-8">
              <h3 className="text-3xl font-bold flex items-center gap-3">
                <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                Dành cho Doanh nghiệp:
              </h3>
              
              <ul className="space-y-8">
                <li className="flex gap-4">
                  <div className="mt-1 shrink-0">
                     <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Kho Tài năng Thông minh</h4>
                    <p className="text-gray-400">Đăng tải nhu cầu dự án và tiếp cận nhóm ứng viên đã được lọc sẵn dựa trên các yêu cầu kỹ năng cụ thể.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                   <div className="mt-1 shrink-0">
                     <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Quản lý Ứng viên Hiệu quả</h4>
                    <p className="text-gray-400">Xem xét đơn ứng tuyển, lịch phỏng vấn và quản lý liên lạc ngay trong nền tảng.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* AI Differentiation Box - Matching Image 2 */}
          <div className="mt-24 bg-white text-gray-900 rounded-3xl p-10 border border-white/10 relative overflow-hidden shadow-2xl">
             <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
               <div className="shrink-0 bg-purple-100 p-6 rounded-full">
                 <Cpu className="w-12 h-12 text-purple-600" />
               </div>
               <div>
                 <p className="text-lg md:text-xl leading-relaxed font-medium">
                   Voltria vượt xa các trang tuyển dụng chung chung bằng cách tập trung hoàn toàn vào phân khúc <span className="font-bold">"dự án & thực tập"</span> dành cho sinh viên. 
                   Điểm khác biệt cốt lõi của chúng tôi là <span className="font-bold">thuật toán ghép đôi được hỗ trợ bởi AI</span>, chủ động kết nối sinh viên với những cơ hội phù hợp nhất và ngược lại, tiết kiệm thời gian và nâng cao chất lượng kết nối cho cả hai bên, <span className="font-bold">khác với mô hình thụ động và chủ yếu dựa vào tìm kiếm của các đối thủ.</span>
                 </p>
               </div>
             </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default LandingPage;