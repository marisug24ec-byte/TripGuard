import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'teal' | 'cyan' | 'amber' | 'emerald' | 'blue';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  color = 'teal',
}) => {
  const colorMap = {
    teal: 'bg-teal-500/10 text-teal-400 border-teal-500/20 group-hover:border-teal-500/40',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 group-hover:border-cyan-500/40',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20 group-hover:border-amber-500/40',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:border-emerald-500/40',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20 group-hover:border-blue-500/40',
  };

  const iconBgMap = {
    teal: 'bg-teal-500/15 text-teal-400',
    cyan: 'bg-cyan-500/15 text-cyan-400',
    amber: 'bg-amber-500/15 text-amber-400',
    emerald: 'bg-emerald-500/15 text-emerald-400',
    blue: 'bg-blue-500/15 text-blue-400',
  };

  return (
    <div className={`group p-5 rounded-xl border bg-navy-900/80 backdrop-blur-md shadow-lg transition-all duration-200 hover:-translate-y-0.5 ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          {title}
        </span>
        <div className={`p-2.5 rounded-lg ${iconBgMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          {value}
        </span>
        {badge && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {badge}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1.5 text-xs text-slate-400 font-medium leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};
