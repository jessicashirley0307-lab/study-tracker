/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plus, Target, CheckCircle2 } from 'lucide-react';
import { Subject, StudySession } from '../types';
import { COLOR_MAPS, formatDuration } from '../utils';
import { motion } from 'motion/react';

interface SubjectProgressListProps {
  subjects: Subject[];
  sessionsThisWeek: StudySession[];
  onQuickLog: (subjectId: string) => void;
  onManageSubjects?: () => void;
}

export const SubjectProgressList: React.FC<SubjectProgressListProps> = ({
  subjects,
  sessionsThisWeek,
  onQuickLog,
  onManageSubjects,
}) => {
  return (
    <div className="brutalist-card p-6 shadow-sm flex flex-col h-full relative overflow-hidden" id="subject-progress-list-panel">
      {/* Absolute top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-accent" />
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/5 text-brand-accent border border-white/10 rounded-sm">
            <Target className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold font-display uppercase tracking-wider text-brand-ink">Weekly Targets</h3>
        </div>
        {onManageSubjects && (
          <button
            onClick={onManageSubjects}
            className="text-[10px] font-bold text-brand-ink uppercase tracking-wider hover:bg-white/5 transition-colors py-1 px-2 rounded-sm border border-white/20 bg-transparent cursor-pointer"
            id="btn-manage-subjects"
          >
            Manage
          </button>
        )}
      </div>

      {subjects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
          <div className="p-3 bg-white/5 border border-white/10 rounded-sm text-white/30 mb-3">
            <Target className="w-6 h-6 animate-pulse-slow" />
          </div>
          <p className="text-white/60 text-sm font-medium">No subjects added yet</p>
          <p className="text-white/40 text-xs mt-1">Add subjects above to start tracking your targets.</p>
        </div>
      ) : (
        <div className="space-y-4 flex-1">
          {subjects.map((subject, idx) => {
            // Find total minutes study for this subject in the selected week
            const totalMinutes = sessionsThisWeek
              .filter((s) => s.subjectId === subject.id)
              .reduce((acc, curr) => acc + curr.duration, 0);

            const hoursCompleted = totalMinutes / 60;
            const hoursTarget = subject.targetHours;
            const percentage = hoursTarget > 0 ? (hoursCompleted / hoursTarget) * 100 : 0;
            const isCompleted = hoursCompleted >= hoursTarget;

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={subject.id}
                className="group relative bg-white/[0.02] hover:bg-white/[0.04] rounded-sm p-4 border border-white/10 hover:border-brand-accent/40 transition-all duration-200"
                id={`subject-item-${subject.id}`}
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {subject.code && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-white/10 text-brand-ink rounded-sm uppercase">
                          {subject.code}
                        </span>
                      )}
                      <h4 className="text-sm font-bold text-white/90 group-hover:text-brand-accent transition-colors truncate font-display">
                        {subject.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-white/50">
                      <span className="font-semibold text-white/80">{formatDuration(totalMinutes)} completed</span>
                      <span className="text-white/20">•</span>
                      <span>Goal: {hoursTarget}h / wk</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/30 px-2.5 py-0.5 rounded-sm border border-emerald-900/60">
                        <CheckCircle2 className="w-3 h-3" />
                        Done
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-white/60 bg-white/5 px-2 py-0.5 rounded-sm border border-white/5">
                        {Math.round(percentage)}%
                      </span>
                    )}

                    <button
                      onClick={() => onQuickLog(subject.id)}
                      title={`Log session for ${subject.name}`}
                      className="p-1.5 rounded-sm border border-white/10 bg-white/5 hover:bg-brand-accent hover:border-brand-accent hover:text-white text-white/70 transition-all cursor-pointer"
                      id={`btn-quick-log-${subject.id}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-linear-to-r from-brand-accent/80 to-brand-accent transition-all duration-300"
                  />
                </div>
                
                {percentage > 100 && (
                  <div className="mt-1 text-right">
                    <span className="text-[9px] font-bold text-brand-accent font-mono">
                      +{(hoursCompleted - hoursTarget).toFixed(1)}h extra effort!
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
