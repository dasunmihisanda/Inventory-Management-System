import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  variant?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'slate';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'blue',
  className,
}) => {
  const variantCard = {
    blue: 'border-slate-200 hover:border-blue-300 dark:border-blue-500/20 dark:hover:border-blue-500/40 bg-white dark:bg-slate-900 dark:bg-gradient-to-br dark:from-blue-950/40 dark:to-slate-900 text-blue-600 dark:text-blue-400',
    emerald: 'border-slate-200 hover:border-emerald-300 dark:border-emerald-500/20 dark:hover:border-emerald-500/40 bg-white dark:bg-slate-900 dark:bg-gradient-to-br dark:from-emerald-950/40 dark:to-slate-900 text-emerald-600 dark:text-emerald-400',
    amber: 'border-slate-200 hover:border-amber-300 dark:border-amber-500/20 dark:hover:border-amber-500/40 bg-white dark:bg-slate-900 dark:bg-gradient-to-br dark:from-amber-950/40 dark:to-slate-900 text-amber-600 dark:text-amber-400',
    rose: 'border-slate-200 hover:border-rose-300 dark:border-rose-500/20 dark:hover:border-rose-500/40 bg-white dark:bg-slate-900 dark:bg-gradient-to-br dark:from-rose-950/40 dark:to-slate-900 text-rose-600 dark:text-rose-400',
    purple: 'border-slate-200 hover:border-purple-300 dark:border-purple-500/20 dark:hover:border-purple-500/40 bg-white dark:bg-slate-900 dark:bg-gradient-to-br dark:from-purple-950/40 dark:to-slate-900 text-purple-600 dark:text-purple-400',
    slate: 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400',
  };

  const iconBg = {
    blue: 'bg-blue-50 text-blue-600 border border-blue-200/80 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    emerald: 'bg-emerald-50 text-emerald-600 border border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    amber: 'bg-amber-50 text-amber-600 border border-amber-200/80 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    rose: 'bg-rose-50 text-rose-600 border border-rose-200/80 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    purple: 'bg-purple-50 text-purple-600 border border-purple-200/80 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };

  return (
    <div
      className={cn(
        'relative rounded-xl p-5 border transition-all duration-200 shadow-xs hover:shadow-sm dark:shadow-lg dark:shadow-black/20',
        variantCard[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        <div className={cn('p-2.5 rounded-lg shrink-0', iconBg[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              'font-semibold px-1.5 py-0.5 rounded text-[11px]',
              trend.isPositive
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-transparent'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/60 dark:border-transparent'
            )}
          >
            {trend.value}
          </span>
          <span className="text-slate-500 dark:text-slate-400">{trend.label || 'vs last period'}</span>
        </div>
      )}
    </div>
  );
};
