import React from 'react';
import { ActivityItem } from '../types';
import { X, BookOpen, Rocket, Building2, Calendar, ArrowRight } from 'lucide-react';

interface MyActivitiesProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ActivityItem[];
}

const MyActivities: React.FC<MyActivitiesProps> = ({ isOpen, onClose, activities }) => {
  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'course': return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'project': return <Rocket className="w-5 h-5 text-purple-600" />;
      case 'job': return <Building2 className="w-5 h-5 text-indigo-600" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case 'course': return { text: 'Khóa Học', bg: 'bg-blue-100', color: 'text-blue-700' };
      case 'project': return { text: 'Dự Án', bg: 'bg-purple-100', color: 'text-purple-700' };
      case 'job': return { text: 'Việc Làm', bg: 'bg-indigo-100', color: 'text-indigo-700' };
      default: return { text: 'Khác', bg: 'bg-gray-100', color: 'text-gray-700' };
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white h-full w-full max-w-md shadow-2xl p-6 flex flex-col animate-in slide-in-from-right duration-300">
        
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Hoạt Động Của Tôi</h2>
            <p className="text-sm text-gray-500">Đã đăng ký {activities.length} hoạt động</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Chưa có hoạt động nào</h3>
              <p className="text-gray-500 mt-2 px-6">Hãy phân tích CV và đăng ký các khóa học hoặc công việc phù hợp.</p>
            </div>
          ) : (
            activities.map((item, idx) => {
              const label = getLabel(item.type);
              return (
                <div key={idx} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${label.bg} ${label.color}`}>
                      {label.text}
                    </span>
                    <span className="text-xs text-gray-400">{item.appliedDate}</span>
                  </div>
                  
                  <div className="flex gap-3 mb-2">
                    <div className="mt-1 shrink-0 p-2 bg-gray-50 rounded-lg h-fit">
                      {getIcon(item.type)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 line-clamp-2">{item.name}</h4>
                      {item.provider && <p className="text-xs text-gray-500 font-medium">{item.provider}</p>}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      Đang thực hiện
                    </span>
                    <button className="text-xs text-purple-600 font-medium flex items-center hover:underline">
                      Chi tiết <ArrowRight className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-gray-100">
           <button 
             onClick={onClose}
             className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors"
           >
             Đóng
           </button>
        </div>

      </div>
    </div>
  );
};

export default MyActivities;