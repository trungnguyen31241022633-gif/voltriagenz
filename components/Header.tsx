import React from 'react';
import { Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  const handleNavClick = (sectionId: string) => {
    // Dispatch event to App to switch view to landing and scroll
    const event = new CustomEvent('navigate-section', { detail: sectionId });
    window.dispatchEvent(event);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <a href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700">
              Voltria
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-8">
            <a href="/" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">Trang chủ</a>
            <button 
              onClick={() => handleNavClick('features')}
              className="text-gray-600 hover:text-purple-600 transition-colors font-medium bg-transparent border-none cursor-pointer"
            >
              Tính năng
            </button>
            <button 
              onClick={() => handleNavClick('about')}
              className="text-gray-600 hover:text-purple-600 transition-colors font-medium bg-transparent border-none cursor-pointer"
            >
              Giới thiệu
            </button>
            <button 
              onClick={() => {
                window.dispatchEvent(new CustomEvent('trigger-start-analysis'));
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full font-medium transition-all shadow-lg shadow-purple-200"
            >
              Bắt đầu ngay
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;