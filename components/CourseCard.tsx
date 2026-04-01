
import React from 'react';
import { Course } from '../types';
import { Star, Clock, Award, ExternalLink, Sparkles, Target, ShieldCheck, History, CheckCircle2, Play } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  theme: 'light' | 'dark';
  isViewed?: boolean;
  isEnrolled?: boolean;
  onView?: (course: Course) => void;
  onToggleEnroll?: (courseId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, theme, isViewed, isEnrolled, onView, onToggleEnroll }) => {
  const isNeural = course.recommendationType === 'NEURAL_PREDICT';

  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col relative ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="relative h-40 overflow-hidden">
        <img 
          src={`https://picsum.photos/seed/${course.id}/400/250`} 
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
          <div className={`backdrop-blur px-2 py-0.5 rounded-md text-[9px] font-black shadow-sm border uppercase tracking-tight ${theme === 'dark' ? 'bg-slate-800/90 text-slate-200 border-slate-700' : 'bg-white/95 text-slate-800 border-slate-100'}`}>
            {course.provider}
          </div>
          <div className={`px-2 py-0.5 rounded-md text-[9px] font-black text-white shadow-sm flex items-center gap-1 uppercase tracking-tight ${
            isNeural ? 'bg-indigo-600' : 'bg-emerald-600'
          }`}>
            {isNeural ? <Sparkles className="w-2.5 h-2.5" /> : <Target className="w-2.5 h-2.5" />}
            {isNeural ? 'Neural' : 'CBF'}
          </div>
          {isEnrolled && (
            <div className="bg-emerald-500 text-white px-2 py-0.5 rounded-md text-[9px] font-black flex items-center gap-1 uppercase tracking-tight shadow-sm">
               <CheckCircle2 className="w-2.5 h-2.5" /> Enrolled
            </div>
          )}
          {isViewed && !isEnrolled && (
             <div className="bg-slate-900/80 text-white px-2 py-0.5 rounded-md text-[9px] font-black flex items-center gap-1 uppercase tracking-tight shadow-sm backdrop-blur-sm">
                <History className="w-2.5 h-2.5" /> Viewed
             </div>
          )}
        </div>

        <div className="absolute bottom-2 right-2 bg-slate-900/90 text-white px-2 py-1 rounded-lg text-[10px] font-black backdrop-blur-md border border-white/10">
          {Math.round(course.matchScore * 100)}% Match
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <h3 className={`text-sm font-black leading-snug line-clamp-2 mb-2 min-h-[2.5rem] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          {course.title}
        </h3>
        
        <div className={`rounded-lg p-2.5 mb-3 flex gap-2.5 items-start border transition-colors ${theme === 'dark' ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
          <p className={`text-[10px] leading-relaxed font-medium line-clamp-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            {course.matchReason}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[9px] text-slate-400 mb-4 font-bold uppercase tracking-wider">
          <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
            <span>{course.rating}</span>
          </div>
          <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <Clock className="w-2.5 h-2.5" />
            <span>{course.duration}</span>
          </div>
          <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <Award className="w-2.5 h-2.5" />
            <span>{course.level}</span>
          </div>
        </div>

        <div className="space-y-2 mt-auto">
          {onToggleEnroll && (
            <button 
              onClick={() => onToggleEnroll(course.id)}
              className={`w-full py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border ${
                isEnrolled 
                ? (theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600')
                : (theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-400' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600')
              }`}
            >
              {isEnrolled ? (
                <><CheckCircle2 className="w-3.5 h-3.5" /> Currently Enrolled</>
              ) : (
                <><Play className="w-3.5 h-3.5" /> Mark as Enrolled</>
              )}
            </button>
          )}
          <div className={`flex items-center justify-between pt-2 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
            <span className={`text-base font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{course.isFree ? 'FREE' : course.price}</span>
            <a 
              href={course.url} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => onView?.(course)}
              className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-[10px] font-black hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100 uppercase"
            >
              Go to Site <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
