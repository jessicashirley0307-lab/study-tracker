/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  Flame,
  Clock,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Sparkles,
  TrendingUp,
  Award,
  BookOpenCheck,
  Calendar
} from 'lucide-react';
import { Subject, StudySession } from './types';
import { INITIAL_SUBJECTS, INITIAL_SESSIONS } from './data';
import {
  parseISODate,
  getWeekDays,
  calculateStreak,
  formatDuration,
  formatFriendlyDate,
  COLOR_MAPS
} from './utils';
import { MetricCard } from './components/MetricCard';
import { SubjectProgressList } from './components/SubjectProgressList';
import { SessionList } from './components/SessionList';
import { AddSubjectModal } from './components/AddSubjectModal';
import { LogSessionModal } from './components/LogSessionModal';
import { motion } from 'motion/react';

export default function App() {
  // --- Persistent States ---
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('study_tracker_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [sessions, setSessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem('study_tracker_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  // Keep a reference date. Defaults to the academic milestone date Tuesday July 14, 2026.
  const [referenceDate, setReferenceDate] = useState<Date>(() => parseISODate('2026-07-14'));

  // --- Modal Controllers ---
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isLogSessionOpen, setIsLogSessionOpen] = useState(false);
  const [quickLogSubjectId, setQuickLogSubjectId] = useState<string>('');

  // --- Sync storage ---
  useEffect(() => {
    localStorage.setItem('study_tracker_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('study_tracker_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // --- Derived Statistics & Filters ---
  const weekDays = useMemo(() => getWeekDays(referenceDate), [referenceDate]);
  const startOfWeekStr = weekDays[0];
  const endOfWeekStr = weekDays[6];

  // Sessions completed in the current selected calendar week range
  const sessionsThisWeek = useMemo(() => {
    return sessions.filter((s) => s.date >= startOfWeekStr && s.date <= endOfWeekStr);
  }, [sessions, startOfWeekStr, endOfWeekStr]);

  // Total study minutes this week
  const totalMinutesThisWeek = useMemo(() => {
    return sessionsThisWeek.reduce((sum, s) => sum + s.duration, 0);
  }, [sessionsThisWeek]);

  // Total weekly target hours across all subjects
  const totalTargetHoursThisWeek = useMemo(() => {
    return subjects.reduce((sum, s) => sum + s.targetHours, 0);
  }, [subjects]);

  const totalHoursCompletedThisWeek = totalMinutesThisWeek / 60;

  // Streak calculations (relative to Jul 14, 2026)
  const currentStreak = useMemo(() => {
    return calculateStreak(sessions, '2026-07-14');
  }, [sessions]);

  // Favorite / Most Studied Subject
  const favoriteSubject = useMemo(() => {
    if (sessions.length === 0 || subjects.length === 0) return null;
    const durBySub: Record<string, number> = {};
    sessions.forEach((s) => {
      durBySub[s.subjectId] = (durBySub[s.subjectId] || 0) + s.duration;
    });

    let bestSubId = '';
    let maxDur = -1;
    Object.entries(durBySub).forEach(([subId, dur]) => {
      if (dur > maxDur) {
        maxDur = dur;
        bestSubId = subId;
      }
    });

    return subjects.find((s) => s.id === bestSubId) || null;
  }, [sessions, subjects]);

  // Total active hours overall (lifetime)
  const totalLifetimeHours = useMemo(() => {
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
    return (totalMinutes / 60).toFixed(1);
  }, [sessions]);

  // Most studied subject this week
  const mostStudiedSubjectThisWeek = useMemo(() => {
    if (sessionsThisWeek.length === 0 || subjects.length === 0) return null;
    const durBySub: Record<string, number> = {};
    sessionsThisWeek.forEach((s) => {
      durBySub[s.subjectId] = (durBySub[s.subjectId] || 0) + s.duration;
    });

    let bestSubId = '';
    let maxDur = -1;
    Object.entries(durBySub).forEach(([subId, dur]) => {
      if (dur > maxDur) {
        maxDur = dur;
        bestSubId = subId;
      }
    });

    const subject = subjects.find((s) => s.id === bestSubId);
    return subject ? { subject, duration: maxDur } : null;
  }, [sessionsThisWeek, subjects]);

  // --- State Changers / Handlers ---
  const handleAddSubject = (subjectData: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...subjectData,
      id: `sub-${Date.now()}`,
    };
    setSubjects((prev) => [...prev, newSubject]);
  };

  const handleLogSession = (sessionData: Omit<StudySession, 'id'>) => {
    const newSession: StudySession = {
      ...sessionData,
      id: `sess-${Date.now()}`,
    };
    setSessions((prev) => [newSession, ...prev]);
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const handleQuickLog = (subjectId: string) => {
    setQuickLogSubjectId(subjectId);
    setIsLogSessionOpen(true);
  };

  const handlePrevWeek = () => {
    setReferenceDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const handleNextWeek = () => {
    setReferenceDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const handleResetToToday = () => {
    setReferenceDate(parseISODate('2026-07-14'));
  };

  const handleResetToSampleData = () => {
    if (window.confirm('Are you sure you want to reset your portal back to the 5 realistic sample subjects and 10 sessions? This will overwrite your active edits.')) {
      setSubjects(INITIAL_SUBJECTS);
      setSessions(INITIAL_SESSIONS);
      setReferenceDate(parseISODate('2026-07-14'));
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all subjects and study logs? You will start with a blank canvas.')) {
      setSubjects([]);
      setSessions([]);
    }
  };

  // Safe progress percentage helper
  const overallProgressPercent = totalTargetHoursThisWeek > 0
    ? (totalHoursCompletedThisWeek / totalTargetHoursThisWeek) * 100
    : 0;

  return (
    <div className="min-h-screen text-brand-ink bg-brand-bg pb-16 font-sans">
      {/* 1. Academic Header Banner */}
      <header className="sticky top-0 z-40 bg-brand-bg/90 backdrop-blur-md border-b border-white/10 shadow-xs" id="portal-main-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Logo/Identity */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-accent text-white rounded-sm border border-white/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl font-bold font-display tracking-wider uppercase text-brand-ink">EduTrack</h1>
                  <span className="text-[9px] font-mono font-bold bg-brand-accent/10 text-brand-accent border border-brand-accent/20 px-2 py-0.5 rounded-sm uppercase tracking-wider">Milestone Active</span>
                </div>
                <p className="text-xs text-white/50 font-medium font-display uppercase tracking-wider">Academic Study Portal</p>
              </div>
            </div>

            {/* Quick Action Dashboard Toolbar */}
            <div className="flex items-center flex-wrap gap-2.5">
              <button
                onClick={() => {
                  setQuickLogSubjectId('');
                  setIsLogSessionOpen(true);
                }}
                className="flex items-center gap-2 bg-brand-accent hover:opacity-90 text-white font-bold uppercase tracking-wider text-[11px] px-4.5 py-2.5 rounded-sm transition-all cursor-pointer"
                id="btn-trigger-log-session"
              >
                <Clock className="w-3.5 h-3.5" />
                Log Session
              </button>

              <button
                onClick={() => setIsAddSubjectOpen(true)}
                className="flex items-center gap-2 border border-white/25 bg-transparent hover:bg-white/5 text-brand-ink font-bold uppercase tracking-wider text-[11px] px-4.5 py-2.5 rounded-sm transition-all cursor-pointer"
                id="btn-trigger-add-subject"
              >
                <PlusCircle className="w-3.5 h-3.5 text-brand-accent" />
                Add Subject
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* 2. Calendar Week Selector Bar */}
        <div className="brutalist-card p-6 mb-6 relative overflow-hidden" id="week-selector-wrapper">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-accent" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 text-brand-accent border border-white/10 rounded-sm flex items-center justify-center">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest block">ACTIVE STUDY INTERVAL</span>
                <span className="text-base font-bold text-brand-ink font-display">
                  Week of {formatFriendlyDate(startOfWeekStr)} – {formatFriendlyDate(endOfWeekStr, false)}, 2026
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevWeek}
                className="p-2 border border-white/10 rounded-sm bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
                title="Previous Week"
                id="btn-prev-week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleResetToToday}
                className="px-4 py-2 border border-white/10 rounded-sm bg-white/5 text-[10px] font-bold uppercase tracking-wider text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer font-display"
                title="Return to the active milestone week (July 14, 2026)"
                id="btn-reset-to-today"
              >
                Milestone Week
              </button>

              <button
                onClick={handleNextWeek}
                className="p-2 border border-white/10 rounded-sm bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
                title="Next Week"
                id="btn-next-week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* New 7-Day Visual Timeline Strip */}
          <div className="grid grid-cols-7 gap-2 mt-4 pt-1" id="weekly-visual-timeline">
            {weekDays.map((dayStr) => {
              const dateObj = parseISODate(dayStr);
              const isToday = dayStr === '2026-07-14'; // Milestone focus date
              
              const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              const dayName = daysShort[dateObj.getDay()];
              const dateNum = dateObj.getDate();

              // Get total minutes for this day
              const daySessions = sessionsThisWeek.filter((s) => s.date === dayStr);
              const dayMinutes = daySessions.reduce((acc, curr) => acc + curr.duration, 0);

              return (
                <div 
                  key={dayStr}
                  className={`flex flex-col items-center justify-between p-3 rounded-sm border text-center transition-all ${
                    isToday 
                      ? 'bg-brand-accent/10 border-brand-accent/30' 
                      : 'bg-white/[0.01] border-white/5'
                  }`}
                  title={`${formatFriendlyDate(dayStr, true)}: ${formatDuration(dayMinutes)} studied`}
                >
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${isToday ? 'text-brand-accent' : 'text-white/40'}`}>
                    {dayName}
                  </span>
                  <span className={`text-lg font-bold font-display my-1 ${isToday ? 'text-brand-accent' : 'text-white/80'}`}>
                    {dateNum}
                  </span>

                  {/* Visual indication block */}
                  <div className="w-full flex flex-col items-center gap-1.5 mt-1.5">
                    {dayMinutes > 0 ? (
                      <>
                        <div className="h-1 w-full bg-brand-accent rounded-full" />
                        <span className="text-[9px] font-bold font-mono text-brand-accent bg-brand-accent/10 border border-brand-accent/20 px-1.5 py-0.5 rounded-sm">
                          {formatDuration(dayMinutes)}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="h-1 w-6 bg-white/5 rounded-full" />
                        <span className="text-[9px] font-medium text-white/20 font-mono">-</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Top Metrics Dashboard Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6" id="dashboard-metrics-grid">
          {/* Metric 1: Total Study Streak */}
          <MetricCard
            title="Active Study Streak"
            value={currentStreak > 0 ? `${currentStreak} Days` : '0 Days'}
            subtext="Consecutive days studied (ends today/yesterday)"
            icon={Flame}
            iconColorClass=""
            iconBgClass=""
            badge={currentStreak >= 5 ? { text: 'On Fire!', type: 'success' } : undefined}
          >
            {/* Quick motivators */}
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-accent shrink-0 animate-pulse" />
              <span className="text-xs text-white/60 truncate">
                {currentStreak > 0
                  ? 'Your study routine is looking very strong!'
                  : 'Start studying today to build up your streak!'}
              </span>
            </div>
          </MetricCard>

          {/* Metric 2: Total Weekly Effort */}
          <MetricCard
            title="Weekly Effort logged"
            value={formatDuration(totalMinutesThisWeek)}
            subtext={`Against ${totalTargetHoursThisWeek} hours total target`}
            icon={Clock}
            iconColorClass=""
            iconBgClass=""
            badge={overallProgressPercent >= 100 ? { text: '100% Met', type: 'success' } : undefined}
          >
            {/* Progress line indicator */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs text-white/50">
                <span>Overall Goal Progress</span>
                <span className="font-bold text-white/80">{Math.round(overallProgressPercent)}%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(overallProgressPercent, 100)}%` }}
                  transition={{ duration: 0.8 }}
                  className="bg-brand-accent h-full rounded-full"
                />
              </div>
            </div>
          </MetricCard>

          {/* Metric 3: Weekly Peak Focus (Summary Card) */}
          <MetricCard
            title="Weekly Focus Leader"
            value={mostStudiedSubjectThisWeek ? mostStudiedSubjectThisWeek.subject.name : 'None yet'}
            subtext={mostStudiedSubjectThisWeek ? `Most hours this week: ${formatDuration(mostStudiedSubjectThisWeek.duration)}` : 'No hours logged this week'}
            icon={BookOpenCheck}
            iconColorClass=""
            iconBgClass=""
            badge={mostStudiedSubjectThisWeek ? { text: mostStudiedSubjectThisWeek.subject.code || 'Peak', type: 'info' } : undefined}
          >
            <div className="text-xs text-white/60">
              {mostStudiedSubjectThisWeek ? (
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                  <span className="truncate">
                    Focused course: <strong className="text-white/80 font-mono font-bold">{mostStudiedSubjectThisWeek.subject.code || 'This subject'}</strong>
                  </span>
                </div>
              ) : (
                <div className="text-white/40 italic">Start logging to track weekly focus leader.</div>
              )}
            </div>
          </MetricCard>

          {/* Metric 4: Academic Summary Stats */}
          <MetricCard
            title="Overall Stats"
            value={`${totalLifetimeHours} hrs`}
            subtext="Total lifetime study hours logged"
            icon={Award}
            iconColorClass=""
            iconBgClass=""
          >
            <div className="text-xs space-y-2 text-white/60">
              {favoriteSubject ? (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-brand-accent" />
                  <span className="truncate">
                    Focus Course: <strong className="text-white/80 font-mono font-bold">{favoriteSubject.code || favoriteSubject.name}</strong>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-white/30" />
                  <span>No primary focus yet.</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <BookOpenCheck className="w-3.5 h-3.5 text-brand-accent" />
                <span>Total entries: <strong className="text-white/80">{sessions.length}</strong> logged sessions</span>
              </div>
            </div>
          </MetricCard>
        </section>

        {/* 4. Core Layout Split: Progress List & Main History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT PANEL: Log history ledger (8 columns) */}
          <div className="lg:col-span-8 order-2 lg:order-1 flex flex-col gap-6">
            <SessionList
              sessions={sessions}
              subjects={subjects}
              onDeleteSession={handleDeleteSession}
              onClearAllSampleData={handleClearAll}
              onResetToSampleData={handleResetToSampleData}
            />
          </div>

          {/* RIGHT PANEL: Subject Targets & Core KPIs (4 columns) */}
          <div className="lg:col-span-4 order-1 lg:order-2 flex flex-col gap-6">
            <SubjectProgressList
              subjects={subjects}
              sessionsThisWeek={sessionsThisWeek}
              onQuickLog={handleQuickLog}
              onManageSubjects={() => setIsAddSubjectOpen(true)}
            />

            {/* Quick Helpful Study Card */}
            <div className="brutalist-card border-brand-accent/40 p-6 shadow-sm relative overflow-hidden bg-brand-panel">
              <h4 className="text-xs font-bold text-white mb-2 font-display uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-accent animate-pulse" />
                Effective Study Strategy
              </h4>
              <p className="text-xs text-white/70 leading-relaxed mb-4">
                Research shows distributed study sessions (e.g. 60–90 minutes daily) are vastly more effective for memory retention than cramming for 8 hours on Sunday. Establish small, specific daily objectives for each of your <strong>{subjects.length}</strong> subjects.
              </p>
              <div className="flex items-center justify-between border-t border-white/10 pt-3 text-[9px] text-white/40 font-mono uppercase tracking-widest">
                <span>SYSTEM DATE: JUL 14, 2026</span>
                <span>STATUS: TRACKING ACTIVE</span>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* 5. Modals Overlays */}
      <AddSubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        onAddSubject={handleAddSubject}
      />

      <LogSessionModal
        isOpen={isLogSessionOpen}
        onClose={() => {
          setIsLogSessionOpen(false);
          setQuickLogSubjectId('');
        }}
        subjects={subjects}
        onLogSession={handleLogSession}
        preselectedSubjectId={quickLogSubjectId}
        defaultDateStr="2026-07-14"
      />
    </div>
  );
}
