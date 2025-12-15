import React, { useState, useEffect } from 'react';
import { AnalysisResult, Recommendation, RoadmapItem, ActivityItem } from '../types';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip 
} from 'recharts';
import { Briefcase, UserCheck, Zap, Award, Users, AlertTriangle, TrendingUp, Star, FileText, X, CheckCircle2, ArrowRight, BookOpen, Rocket, Building2, Lock, LogIn, ExternalLink, Eye } from 'lucide-react';

interface AnalysisResultProps {
  data: AnalysisResult;
  onApply: (item: ActivityItem) => void;
  appliedNames: Set<string>;
}

// Helper type for previewing any item
type PreviewType = 'course' | 'project' | 'job';
interface PreviewItem extends RoadmapItem {
  type: PreviewType;
}

const AnalysisResultView: React.FC<AnalysisResultProps> = ({ data, onApply, appliedNames }) => {
  // State Management
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [previewItem, setPreviewItem] = useState<PreviewItem | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState<{show: boolean, msg: string, link?: string}>({show: false, msg: ''});

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Chart Data
  const chartData = [
    { subject: 'Kinh Nghiệm', A: data.matchScore, fullMark: 100 },
    { subject: 'Kỹ Năng', A: Math.min(100, data.matchScore + 5), fullMark: 100 },
    { subject: 'Ổn Định', A: data.detailedAnalysis.jobStability.toLowerCase().includes("cao") || data.detailedAnalysis.jobStability.toLowerCase().includes("tốt") ? 90 : 70, fullMark: 100 },
    { subject: 'Nhóm', A: 85, fullMark: 100 },
    { subject: 'Chủ Động', A: 80, fullMark: 100 },
    { subject: 'Phát Triển', A: 75, fullMark: 100 },
  ];

  // --- Handlers ---

  const handleOpenPreview = (item: RoadmapItem, type: PreviewType) => {
    setPreviewItem({ ...item, type });
  };

  const handleActionClick = () => {
    if (!previewItem) return;

    const action = () => {
      // 1. Call Parent onApply
      onApply({
        ...previewItem,
        type: previewItem.type,
        appliedDate: new Date().toLocaleDateString('vi-VN'),
        status: 'active'
      });
      
      // 2. Prepare success message
      let msg = "Đăng ký thành công!";
      let link = undefined;
      
      if (previewItem.type === 'course') {
        msg = "Đăng ký khóa học thành công! Đang chuyển hướng...";
        // Generate a fake link (search query)
        link = `https://www.google.com/search?q=${encodeURIComponent(previewItem.name + " " + (previewItem.provider || ""))}`;
      } else if (previewItem.type === 'job') {
        msg = "Ứng tuyển thành công! Nhà tuyển dụng sẽ liên hệ sớm.";
      } else {
        msg = "Đã lưu dự án vào danh sách quan tâm!";
      }

      // 3. Close preview & Show success
      setPreviewItem(null);
      setShowSuccessPopup({ show: true, msg, link });

      // 4. Handle redirection after a short delay if link exists
      if (link) {
        setTimeout(() => {
          window.open(link, '_blank');
        }, 1500);
      }
    };

    if (isLoggedIn) {
      action();
    } else {
      setPendingAction(() => action);
      setShowLogin(true);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail && loginPass) {
      // Simulate Login Success
      setIsLoggedIn(true);
      setShowLogin(false);
      
      // Execute pending action if any
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    }
  };

  // Quick helper to check if item is applied
  const isApplied = (name: string) => appliedNames.has(name);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
      
      {/* Top Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 glass-panel rounded-3xl p-8 border-l-8 border-purple-600 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-3xl font-bold text-gray-800">Hoàn Tất Phân Tích</h2>
              <span className="font-semibold text-purple-700 px-4 py-2 bg-purple-100 rounded-full text-sm uppercase tracking-wide">
                {data.candidateLevel}
              </span>
            </div>
            
            {/* Tóm tắt hồ sơ */}
            <div className="mb-8">
               <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                 <FileText className="w-4 h-4" /> Tóm Tắt Hồ Sơ
               </h3>
               <p className="text-gray-700 text-lg leading-relaxed italic border-l-2 border-purple-200 pl-4">
                 "{data.summary}"
               </p>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap mt-auto">
               <div className="bg-green-50 px-4 py-3 rounded-xl border border-green-100 flex-1 min-w-[150px]">
                 <p className="text-sm text-green-600 font-semibold mb-1 uppercase tracking-wider">Điểm Mạnh</p>
                 <p className="text-2xl font-bold text-gray-800">{data.strengths.length}</p>
               </div>
               <div className="bg-orange-50 px-4 py-3 rounded-xl border border-orange-100 flex-1 min-w-[150px]">
                 <p className="text-sm text-orange-600 font-semibold mb-1 uppercase tracking-wider">Điểm Yếu</p>
                 <p className="text-2xl font-bold text-gray-800">{data.weaknesses.length}</p>
               </div>
               <div className="bg-blue-50 px-4 py-3 rounded-xl border border-blue-100 flex-1 min-w-[150px]">
                 <p className="text-sm text-blue-600 font-semibold mb-1 uppercase tracking-wider">Điểm Phù Hợp</p>
                 <p className="text-2xl font-bold text-gray-800">{data.matchScore}/100</p>
               </div>
            </div>
        </div>

        {/* Radar Chart */}
        <div className="glass-panel rounded-3xl p-4 shadow-xl flex items-center justify-center bg-white">
          <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12, fontFamily: 'Be Vietnam Pro' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Ứng viên"
                  dataKey="A"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.4}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Left Column: Detailed Breakdown */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Briefcase className="text-purple-600" /> Thông Tin Sự Nghiệp
            </h3>
            
            <div className="space-y-6">
              <InsightItem title="Kinh Nghiệm Phù Hợp" content={data.detailedAnalysis.experienceMatch} />
              <InsightItem title="Độ Khớp Kỹ Năng" content={data.detailedAnalysis.skillsAssessment} />
              <InsightItem title="Sự Ổn Định Công Việc" content={data.detailedAnalysis.jobStability} />
              <InsightItem title="Khoảng Trống Việc Làm" content={data.detailedAnalysis.employmentGaps} />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
             <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <UserCheck className="text-purple-600" /> Kỹ Năng Mềm & Phát Triển
            </h3>
            <div className="space-y-6">
              <InsightItem title="Thăng Tiến & Giải Thưởng" content={data.detailedAnalysis.progressionAndAwards} />
              <InsightItem title="Làm Việc Nhóm" content={data.detailedAnalysis.teamworkAndSoftSkills} />
              <InsightItem title="Sự Chủ Động" content={data.detailedAnalysis.proactivity} />
            </div>
          </div>
        </div>

        {/* Right Column: Recommendations */}
        <div className="space-y-6">
          
          {/* Strengths & Weaknesses Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
               <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                 <Zap className="w-5 h-5" /> Điểm Mạnh Hàng Đầu
               </h4>
               <ul className="space-y-2">
                 {data.strengths.slice(0, 3).map((s, i) => (
                   <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                     <span className="mt-1.5 block w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
                     {s}
                   </li>
                 ))}
               </ul>
             </div>
             
             <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
               <h4 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                 <AlertTriangle className="w-5 h-5" /> Cần Cải Thiện
               </h4>
               <ul className="space-y-2">
                 {data.weaknesses.slice(0, 3).map((w, i) => (
                   <li key={i} className="text-sm text-orange-700 flex items-start gap-2">
                     <span className="mt-1.5 block w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"></span>
                     {w}
                   </li>
                 ))}
               </ul>
             </div>
          </div>

          {/* AI Suggestions */}
          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-8 shadow-xl text-white">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Star className="text-yellow-400 fill-yellow-400" /> Gợi Ý Nhanh
            </h3>

            <div className="space-y-8">
              {/* Jobs */}
              <div>
                <h4 className="text-indigo-200 text-sm font-bold uppercase tracking-wider mb-3">Vị Trí Phù Hợp Nhất</h4>
                <div className="space-y-3">
                  {data.suggestedJobs.slice(0, 2).map((job, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => handleOpenPreview({ name: job.title, description: job.description, provider: "Voltria Suggestion" }, 'job')}
                      className="group bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-95 relative"
                    >
                      <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="bg-white/20 p-1 rounded-full">
                           <ArrowRight className="w-4 h-4 text-white" />
                         </div>
                      </div>
                      <p className="font-bold text-lg text-white group-hover:text-yellow-300 transition-colors flex items-center gap-2">
                        {job.title}
                        {isApplied(job.title) && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                      </p>
                      <p className="text-sm text-indigo-200 mt-1">{job.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW SECTION: Development Roadmap */}
      <div className="w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Lộ Trình Phát Triển Sự Nghiệp</h2>
          <p className="text-gray-500 mt-2">Các bước cụ thể để nâng cao giá trị bản thân và đạt được công việc mơ ước</p>
        </div>

        <div className="relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-blue-200 via-purple-300 to-indigo-200 -translate-y-1/2 -z-10 rounded-full"></div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Step 1: Learning */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-blue-100 relative hover:-translate-y-2 transition-transform duration-300">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg ring-4 ring-white z-10">1</div>
              <div className="mt-6 text-center mb-6">
                 <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                   <BookOpen className="w-8 h-8" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-800">Nâng Cao Kiến Thức</h3>
                 <p className="text-sm text-gray-500">Khóa học & Chứng chỉ</p>
              </div>
              <div className="space-y-4">
                {data.developmentRoadmap?.courses.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`bg-blue-50/50 p-4 rounded-xl border transition-all cursor-pointer group ${isApplied(item.name) ? 'border-green-400 bg-green-50' : 'border-blue-100 hover:border-blue-300 hover:shadow-md'}`}
                    onClick={() => handleOpenPreview(item, 'course')}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-blue-900 text-sm flex items-center gap-1">
                        {item.name}
                        {isApplied(item.name) && <CheckCircle2 className="w-3 h-3 text-green-600" />}
                      </h4>
                      {item.provider && <span className="text-[10px] uppercase font-bold bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">{item.provider}</span>}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{item.description}</p>
                    {!isApplied(item.name) && (
                      <div className="mt-2 text-xs font-semibold text-blue-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-3 h-3" /> Xem chi tiết
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Practice */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-purple-100 relative hover:-translate-y-2 transition-transform duration-300">
               <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg ring-4 ring-white z-10">2</div>
               <div className="mt-6 text-center mb-6">
                 <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Rocket className="w-8 h-8" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-800">Xây Dựng Kinh Nghiệm</h3>
                 <p className="text-sm text-gray-500">Dự án & Startups</p>
              </div>
              <div className="space-y-4">
                {data.developmentRoadmap?.projects.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`bg-purple-50/50 p-4 rounded-xl border transition-all cursor-pointer group ${isApplied(item.name) ? 'border-green-400 bg-green-50' : 'border-purple-100 hover:border-purple-300 hover:shadow-md'}`}
                    onClick={() => handleOpenPreview(item, 'project')}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-purple-900 text-sm flex items-center gap-1">
                        {item.name}
                        {isApplied(item.name) && <CheckCircle2 className="w-3 h-3 text-green-600" />}
                      </h4>
                      {item.durationOrType && <span className="text-[10px] uppercase font-bold bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">{item.durationOrType}</span>}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{item.description}</p>
                     {!isApplied(item.name) && (
                      <div className="mt-2 text-xs font-semibold text-purple-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-3 h-3" /> Xem chi tiết
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Jobs */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-indigo-100 relative hover:-translate-y-2 transition-transform duration-300">
               <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg ring-4 ring-white z-10">3</div>
               <div className="mt-6 text-center mb-6">
                 <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Building2 className="w-8 h-8" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-800">Cơ Hội Nghề Nghiệp</h3>
                 <p className="text-sm text-gray-500">Tuyển dụng Doanh nghiệp</p>
              </div>
              <div className="space-y-4">
                {data.developmentRoadmap?.jobs.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`bg-indigo-50/50 p-4 rounded-xl border transition-all cursor-pointer group ${isApplied(item.name) ? 'border-green-400 bg-green-50' : 'border-indigo-100 hover:border-indigo-300 hover:shadow-md'}`}
                    onClick={() => handleOpenPreview(item, 'job')}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-indigo-900 text-sm flex items-center gap-1">
                        {item.name}
                        {isApplied(item.name) && <CheckCircle2 className="w-3 h-3 text-green-600" />}
                      </h4>
                      {item.provider && <span className="text-[10px] uppercase font-bold bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full truncate max-w-[80px]">{item.provider}</span>}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed mb-2 line-clamp-2">{item.description}</p>
                    <div className={`text-xs font-semibold flex items-center gap-1 transition-transform ${isApplied(item.name) ? 'text-green-600' : 'text-indigo-600 group-hover:translate-x-1'}`}>
                       {isApplied(item.name) ? 'Đã Ứng Tuyển' : <>Ứng tuyển ngay <ArrowRight className="w-3 h-3" /></>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-0 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Image/Color */}
            <div className={`h-32 w-full flex items-center justify-center relative ${
              previewItem.type === 'course' ? 'bg-blue-600' : 
              previewItem.type === 'project' ? 'bg-purple-600' : 'bg-indigo-600'
            }`}>
               <button 
                onClick={() => setPreviewItem(null)}
                className="absolute top-4 right-4 p-2 bg-black/20 text-white hover:bg-black/40 rounded-full transition-colors backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>
              {previewItem.type === 'course' && <BookOpen className="w-16 h-16 text-white/80" />}
              {previewItem.type === 'project' && <Rocket className="w-16 h-16 text-white/80" />}
              {previewItem.type === 'job' && <Building2 className="w-16 h-16 text-white/80" />}
            </div>

            <div className="p-8 overflow-y-auto">
               <div className="mb-2">
                 <span className={`text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full ${
                    previewItem.type === 'course' ? 'bg-blue-100 text-blue-700' : 
                    previewItem.type === 'project' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
                 }`}>
                   {previewItem.type === 'course' ? 'Khóa Học' : previewItem.type === 'project' ? 'Dự Án' : 'Tuyển Dụng'}
                 </span>
               </div>
               
               <h3 className="text-2xl font-bold text-gray-900 mb-2">{previewItem.name}</h3>
               {(previewItem.provider || previewItem.durationOrType) && (
                 <p className="text-sm text-gray-500 font-medium mb-6 flex items-center gap-2">
                   <Building2 className="w-4 h-4" />
                   {previewItem.provider || previewItem.durationOrType}
                 </p>
               )}

               <div className="prose prose-sm text-gray-600 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                 <h4 className="font-bold text-gray-800 mb-2">Chi tiết:</h4>
                 <p>{previewItem.description}</p>
                 <p className="mt-2 text-xs italic opacity-70">
                   * Đây là nội dung được AI đề xuất dựa trên phân tích hồ sơ của bạn.
                 </p>
               </div>

               {/* Action Button */}
               {isApplied(previewItem.name) ? (
                 <button disabled className="w-full bg-green-100 text-green-700 font-bold py-4 rounded-xl flex items-center justify-center gap-2 cursor-default">
                   <CheckCircle2 className="w-5 h-5" /> Đã đăng ký / Ứng tuyển
                 </button>
               ) : (
                 <button 
                    onClick={handleActionClick}
                    className={`w-full font-bold py-4 rounded-xl text-white shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                      previewItem.type === 'course' ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200' : 
                      previewItem.type === 'project' ? 'bg-purple-600 hover:bg-purple-700 hover:shadow-purple-200' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200'
                    }`}
                 >
                    {previewItem.type === 'course' ? 'Tham Gia Ngay' : previewItem.type === 'project' ? 'Tham Gia Dự Án' : 'Ứng Tuyển Ngay'}
                    <ArrowRight className="w-5 h-5" />
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 relative">
             <button 
                onClick={() => { setShowLogin(false); setPendingAction(null); }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Đăng Nhập</h3>
                <p className="text-gray-500 text-sm mt-1">Bạn cần đăng nhập để tiếp tục hành động này</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="name@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                  <input 
                    type="password" 
                    required
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <LogIn className="w-5 h-5" /> Đăng Nhập & Tiếp Tục
                </button>
              </form>
          </div>
        </div>
      )}

      {/* 3. Success Popup */}
      {showSuccessPopup.show && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Thành Công!</h3>
              <p className="text-gray-600 mb-6">{showSuccessPopup.msg}</p>
              
              {showSuccessPopup.link && (
                 <div className="mb-4 text-sm text-blue-600 flex justify-center items-center gap-1 animate-pulse">
                   <ExternalLink className="w-3 h-3" /> Đang mở liên kết...
                 </div>
              )}

              <button 
                onClick={() => setShowSuccessPopup({show: false, msg: ''})}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-xl transition-colors"
              >
                Đóng
              </button>
           </div>
        </div>
      )}

    </div>
  );
};

const InsightItem: React.FC<{title: string, content: string}> = ({ title, content }) => (
  <div className="border-l-4 border-gray-200 pl-4 py-1 hover:border-purple-400 transition-colors">
    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">{title}</h4>
    <p className="text-gray-700 leading-relaxed">{content}</p>
  </div>
);

export default AnalysisResultView;