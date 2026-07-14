/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  iconColorClass: string;
  iconBgClass: string;
  badge?: {
    text: string;
    type: 'success' | 'warning' | 'info';
  };
  children?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  iconColorClass,
  iconBgClass,
  badge,
  children,
}) => {
  const badgeColors = {
    success: 'bg-emerald-950/30 text-emerald-400 border-emerald-900/60',
    warning: 'bg-amber-950/30 text-amber-400 border-amber-900/60',
    info: 'bg-brand-accent/10 text-brand-accent border-brand-accent/30',
  };

  const valueString = String(value);
  const valueFontSizeClass = valueString.length > 15
    ? 'text-lg font-semibold'
    : valueString.length > 10
      ? 'text-xl font-bold'
      : 'text-3xl font-bold font-display';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="brutalist-card p-6 shadow-sm hover:border-brand-accent/40 transition-all duration-200 relative overflow-hidden flex flex-col justify-between group"
      id={`metric-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0 flex-1">
          <span className="label-caps block truncate">{title}</span>
          <h3 className={`${valueFontSizeClass} text-brand-ink tracking-tight mt-1 truncate`} title={valueString}>{value}</h3>
        </div>
        <div className="p-2 border border-white/10 rounded-sm shrink-0 bg-white/5 text-brand-accent transition-transform duration-300 group-hover:scale-105">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-white/40 text-xs font-normal">{subtext}</p>
        {badge && (
          <span className={`text-[9px] font-mono font-bold tracking-wide uppercase px-2 py-0.5 rounded-sm border ${badgeColors[badge.type]}`}>
            {badge.text}
          </span>
        )}
      </div>

      {children && <div className="mt-4 pt-4 border-t border-white/10">{children}</div>}
    </motion.div>
  );
};
