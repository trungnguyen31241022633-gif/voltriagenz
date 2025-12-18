import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import UploadSection from './components/UploadSection';
import AnalysisResultView from './components/AnalysisResult';
import MyActivities from './components/MyActivities';
import { AnalysisResult, UploadState, ActivityItem } from './types';
import { analyzeCV } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'analyze'>('landing');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  // State for Activities
  const [myActivities, setMyActivities] = useState<ActivityItem[]>([]);
  const [showActivities, setShowActivities] = useState(false);

  useEffect(() => {
    // Listen for custom event from Header button to start analysis
    const handleStartEvent = () => handleStart();
    window.addEventListener('trigger-start-analysis', handleStartEvent);

    // Listen for navigation events from Header (Features, About)
    const handleNavEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const sectionId = customEvent.detail;
      
      // Switch to landing page if not already there
      setView('landing');
      
      // Scroll to section after a brief delay to allow rendering
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    };
    window.addEventListener('navigate-section', handleNavEvent);

    return () => {
      window.removeEventListener('trigger-start-analysis', handleStartEvent);
      window.removeEventListener('navigate-section', handleNavEvent);
    };
  }, []);

  const handleStart = () => {
    setView('analyze');
    // We wait a tick for the component to render before scrolling
    setTimeout(() => {
        const el = document.getElementById('upload-area');
        el?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleAnalysis = async (state: UploadState) => {
    if (!state.fileData) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      const data = await analyzeCV(state.fileData, state.mimeType, state.targetJob);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Đã xảy ra lỗi trong quá trình phân tích. Vui lòng đảm bảo khóa API của bạn hợp lệ và thử lại.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyItem = (item: ActivityItem) => {
    // Avoid duplicates based on name
    setMyActivities(prev => {
      if (prev.some(i => i.name === item.name)) return prev;
      return [item, ...prev];
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 selection:bg-purple-200 selection:text-purple-900 font-['Be_Vietnam_Pro']">
      <Header 
        activityCount={myActivities.length} 
        onOpenActivities={() => setShowActivities(true)} 
      />
      
      <MyActivities 
        isOpen={showActivities} 
        onClose={() => setShowActivities(false)} 
        activities={myActivities}
      />

      <main>
        {view === 'landing' && <LandingPage onStart={handleStart} />}
        
        {view === 'analyze' && (
          <div className="pt-24 min-h-screen flex flex-col items-center">
            
            {!result && (
                <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="text-center mb-10 px-4">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Tải Lên Hồ Sơ Của Bạn</h1>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                            Tải lên CV (PDF hoặc Ảnh) và tùy chọn nhập vị trí mong muốn. 
                            Voltria AI sẽ tạo báo cáo chi tiết cho bạn.
                        </p>
                    </div>
                    <UploadSection onAnalyze={handleAnalysis} isAnalyzing={isAnalyzing} />
                </div>
            )}

            {result && (
                <div className="w-full bg-slate-50 min-h-screen">
                    <div className="max-w-7xl mx-auto px-4 py-8">
                         <button 
                            onClick={() => setResult(null)}
                            className="mb-6 text-gray-500 hover:text-purple-600 font-medium flex items-center gap-2 transition-colors"
                         >
                             ← Tải Lên CV Mới
                         </button>
                    </div>
                   <AnalysisResultView 
                      data={result} 
                      onApply={handleApplyItem}
                      appliedNames={new Set(myActivities.map(a => a.name))}
                   />
                </div>
            )}
          </div>
        )}
      </main>
      
      <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <p className="text-gray-400">© 2024 Voltria. Được hỗ trợ bởi Gemini 2.5 Flash.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
