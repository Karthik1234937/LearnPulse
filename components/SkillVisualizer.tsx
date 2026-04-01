
import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  LineChart, Line
} from 'recharts';
import { SkillScore, QuizHistory } from '../types';

interface VisualizerProps {
  data: SkillScore[];
  theme: 'light' | 'dark';
  type?: 'radar' | 'bar';
}

export const SkillVisualizer: React.FC<VisualizerProps> = ({ data, theme, type = 'radar' }) => {
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';
  const tickColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const tooltipBg = theme === 'dark' ? '#0f172a' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#1e293b' : '#f1f5f9';

  if (type === 'radar') {
    return (
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke={gridColor} />
            <PolarAngleAxis dataKey="subject" tick={{ fill: tickColor, fontSize: 10, fontWeight: 600 }} />
            <Radar
              name="Skill Profile"
              dataKey="score"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={gridColor} />
          <XAxis type="number" hide />
          <YAxis dataKey="subject" type="category" width={100} tick={{ fontSize: 10, fill: tickColor, fontWeight: 600 }} />
          <Tooltip 
            cursor={{ fill: theme === 'dark' ? '#1e293b' : '#f1f5f9' }}
            contentStyle={{ 
              backgroundColor: tooltipBg, 
              borderRadius: '12px', 
              border: `1px solid ${tooltipBorder}`, 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              fontSize: '10px',
              fontWeight: 'bold'
            }}
            itemStyle={{ color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}
          />
          <Bar dataKey="score" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.score >= 70 ? '#10b981' : entry.score >= 40 ? '#f59e0b' : '#ef4444'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface HistoryVisualizerProps {
  history: QuizHistory[];
  theme: 'light' | 'dark';
}

const CustomTooltip = ({ active, payload, theme }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const difficulty = data.metadata?.questions?.[0]?.difficulty || 'Mixed';
    
    return (
      <div className={`p-4 rounded-2xl shadow-2xl border text-[11px] min-w-[160px] animate-in fade-in zoom-in-95 duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">{difficulty}</span>
          <span className="opacity-40 font-bold text-slate-400">{new Date(data.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
        </div>
        <p className={`font-black text-sm mb-1 line-clamp-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{data.domain}</p>
        <div className={`flex items-center gap-2 mt-3 pt-2 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
             <div className="h-full bg-indigo-500" style={{ width: `${data.score}%` }} />
          </div>
          <span className="font-black text-indigo-500">{data.score}%</span>
        </div>
      </div>
    );
  }
  return null;
};

export const HistoryVisualizer: React.FC<HistoryVisualizerProps> = ({ history, theme }) => {
  const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const gridColor = theme === 'dark' ? '#1e293b' : '#f1f5f9';
  const tickColor = theme === 'dark' ? '#64748b' : '#94a3b8';

  return (
    <div className="w-full h-[260px] mt-4 relative">
      <div className="absolute top-0 right-0 flex gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
         <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Mastery Curve</div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={sortedHistory} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="6 6" vertical={false} stroke={gridColor} />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: tickColor, fontWeight: 800 }} 
            tickFormatter={(str) => new Date(str).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          />
          <YAxis domain={[0, 105]} axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: tickColor, fontWeight: 800 }} />
          <Tooltip content={<CustomTooltip theme={theme} />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#6366f1" 
            strokeWidth={4} 
            dot={{ r: 6, fill: theme === 'dark' ? '#0f172a' : '#fff', strokeWidth: 3, stroke: '#6366f1' }}
            activeDot={{ r: 8, strokeWidth: 4, stroke: theme === 'dark' ? '#1e293b' : '#fff', fill: '#4f46e5' }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
