import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 text-purple-700 font-medium mb-8">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
          </span>
          Trí Tuệ Nhân Tạo Phân Tích Sự Nghiệp
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight mb-6">
          Nâng Tầm Sự Nghiệp Với <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600">
            Phân Tích Thông Minh
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10 leading-relaxed">
          Voltria quét CV của bạn để tìm ra những điểm mạnh tiềm ẩn, phân tích các khoảng trống trong sự nghiệp và gợi ý các vai trò, dự án hoàn hảo cho sự phát triển của bạn.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={onStart}
            className="group flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-900 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            Phân Tích CV Của Tôi
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm font-medium text-gray-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-purple-600" />
            <span>Phản hồi AI tức thì</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-purple-600" />
            <span>Kết nối công việc</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-purple-600" />
            <span>Phân tích khoảng trống</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;