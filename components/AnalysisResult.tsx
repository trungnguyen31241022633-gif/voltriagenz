import { AnalysisResult, Recommendation } from '../types';
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip 
} from 'recharts';
import { Briefcase, UserCheck, Zap, Award, Users, AlertTriangle, TrendingUp, Star, FileText, X, CheckCircle2, ArrowRight } from 'lucide-react';

interface AnalysisResultProps {
  data: AnalysisResult;
}

const AnalysisResultView: React.FC<AnalysisResultProps> = ({ data }) => {
  const [selectedJob, setSelectedJob] = useState<Recommendation | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const chartData = [
    { subject: 'Kinh Nghiệm', A: data.matchScore, fullMark: 100 },
    { subject: 'Kỹ Năng', A: Math.min(100, data.matchScore + 5), fullMark: 100 },
    { subject: 'Ổn Định', A: data.detailedAnalysis.jobStability.toLowerCase().includes("cao") || data.detailedAnalysis.jobStability.toLowerCase().includes("tốt") ? 90 : 70, fullMark: 100 },
    { subject: 'Nhóm', A: 85, fullMark: 100 },
    { subject: 'Chủ Động', A: 80, fullMark: 100 },
    { subject: 'Phát Triển', A: 75, fullMark: 100 },
  ];

  const handleJobClick = (job: Recommendation) => {
    setSelectedJob(job);
    setIsSuccess(false);
  };

  const handleApply = () => {
    setIsSuccess(true);
  };

  const handleClose = () => {
    setSelectedJob(null);
    setIsSuccess(false);
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
              <Star className="text-yellow-400 fill-yellow-400" /> Cơ Hội Phù Hợp
            </h3>

            <div className="space-y-8">
              
              {/* Jobs */}
              <div>
                <h4 className="text-indigo-200 text-sm font-bold uppercase tracking-wider mb-3">Vị Trí Đề Xuất</h4>
                <div className="space-y-3">
                  {data.suggestedJobs.map((job, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => handleJobClick(job)}
                      className="group bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-95 relative"
                    >
                      <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="bg-white/20 p-1 rounded-full">
                           <ArrowRight className="w-4 h-4 text-white" />
                         </div>
                      </div>
                      <p className="font-bold text-lg text-white group-hover:text-yellow-300 transition-colors">{job.title}</p>
                      <p className="text-sm text-indigo-200 mt-1">{job.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div>
                <h4 className="text-indigo-200 text-sm font-bold uppercase tracking-wider mb-3">Ý Tưởng Dự Án</h4>
                <div className="grid grid-cols-1 gap-3">
                   {data.suggestedProjects.slice(0, 2).map((proj, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-purple-400 mt-1 shrink-0" />
                      <div>
                        <p className="font-semibold text-white">{proj.title}</p>
                        <p className="text-xs text-indigo-300">{proj.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Collaborators */}
              <div>
                <h4 className="text-indigo-200 text-sm font-bold uppercase tracking-wider mb-3">Cộng Tác Viên Lý Tưởng</h4>
                 <div className="flex flex-wrap gap-2">
                   {data.suggestedCollaborators.map((collab, idx) => (
                    <span key={idx} className="px-3 py-1 bg-indigo-500/30 border border-indigo-400/30 rounded-full text-xs text-indigo-100 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {collab.title}
                    </span>
                  ))}
                 </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Interactive Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
            
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {!isSuccess ? (
              // Confirmation State
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Bạn muốn apply vào không?</h3>
                <p className="text-gray-600 mb-8 px-4">
                  Bạn đang xem xét vị trí <span className="font-semibold text-purple-700">{selectedJob.title}</span>.
                </p>
                <div className="space-y-3">
                  <button 
                    onClick={handleApply}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-purple-200 active:scale-[0.98]"
                  >
                    Có, tôi nộp ngay
                  </button>
                  <button 
                    onClick={handleClose}
                    className="w-full bg-white border border-gray-200 text-gray-700 font-medium py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Không, tôi sẽ xem xét sau
                  </button>
                </div>
              </div>
            ) : (
              // Success State
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ứng tuyển thành công!</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Bạn đã apply thành công, Nhà tuyển dụng sẽ sớm liên hệ bạn, nếu công việc đã có ứng viên khác, Chúng tôi sẽ thông báo ngay cho bạn trong 24h.
                </p>
                <button 
                  onClick={handleClose}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg active:scale-[0.98]"
                >
                  Đóng
                </button>
              </div>
            )}
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
