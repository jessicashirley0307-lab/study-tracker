/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Search, Filter, Trash2, Calendar, Clock, BookOpen, ChevronDown, RefreshCw, Download } from 'lucide-react';
import { Subject, StudySession } from '../types';
import { COLOR_MAPS, formatDuration, formatFriendlyDate } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

interface SessionListProps {
  sessions: StudySession[];
  subjects: Subject[];
  onDeleteSession: (sessionId: string) => void;
  onClearAllSampleData?: () => void;
  onResetToSampleData?: () => void;
}

export const SessionList: React.FC<SessionListProps> = ({
  sessions,
  subjects,
  onDeleteSession,
  onClearAllSampleData,
  onResetToSampleData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedDurationRange, setSelectedDurationRange] = useState<string>('all'); // 'all', 'short', 'medium', 'long'

  // Subject lookup map for quick O(1) details
  const subjectMap = useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  // Filters calculation
  const filteredSessions = useMemo(() => {
    return sessions
      .filter((session) => {
        // 1. Search term (notes, course code, or subject name)
        const sub = subjectMap.get(session.subjectId);
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          session.note.toLowerCase().includes(searchLower) ||
          (sub && sub.name.toLowerCase().includes(searchLower)) ||
          (sub && sub.code?.toLowerCase().includes(searchLower));

        // 2. Subject filter
        const matchesSubject = selectedSubjectId === 'all' || session.subjectId === selectedSubjectId;

        // 3. Duration filter
        let matchesDuration = true;
        if (selectedDurationRange === 'short') {
          matchesDuration = session.duration < 60; // < 1hr
        } else if (selectedDurationRange === 'medium') {
          matchesDuration = session.duration >= 60 && session.duration <= 120; // 1-2 hrs
        } else if (selectedDurationRange === 'long') {
          matchesDuration = session.duration > 120; // > 2hrs
        }

        return matchesSearch && matchesSubject && matchesDuration;
      })
      .sort((a, b) => b.date.localeCompare(a.date)); // Sort newest sessions first
  }, [sessions, searchTerm, selectedSubjectId, selectedDurationRange, subjectMap]);

  const handleExportCSV = () => {
    if (sessions.length === 0) return;

    // CSV Headers
    const headers = ["Session ID", "Date", "Course Code", "Subject Name", "Duration (Minutes)", "Duration (Readable)", "Study Notes"];

    // CSV Rows mapping
    const rows = sessions.map((session) => {
      const sub = subjectMap.get(session.subjectId);
      const subjectCode = sub?.code || "N/A";
      const subjectName = sub?.name || "Deleted Subject";
      const readableDuration = formatDuration(session.duration);

      const escapedNote = (session.note || "").replace(/"/g, '""');
      const escapedSubjectName = subjectName.replace(/"/g, '""');
      const escapedSubjectCode = subjectCode.replace(/"/g, '""');

      return [
        `"${session.id}"`,
        `"${session.date}"`,
        `"${escapedSubjectCode}"`,
        `"${escapedSubjectName}"`,
        `${session.duration}`,
        `"${readableDuration}"`,
        `"${escapedNote}"`
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `EduTrack_Study_Sessions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="brutalist-card p-6 shadow-sm relative overflow-hidden" id="session-list-panel">
      {/* Absolute top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-accent" />

      {/* Header and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold font-display uppercase tracking-wider text-brand-ink flex items-center gap-2">
            <div className="p-1.5 bg-white/5 text-brand-accent border border-white/10 rounded-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            Study Session History
          </h3>
          <p className="text-xs text-white/50 mt-1">
            Showing <strong className="text-white/80">{filteredSessions.length}</strong> of <strong className="text-white/80">{sessions.length}</strong> logged sessions
          </p>
        </div>

        {/* Quick developer actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            disabled={sessions.length === 0}
            className={`text-[10px] uppercase font-bold tracking-wider transition-all py-1.5 px-3 rounded-sm border flex items-center gap-1.5 cursor-pointer ${
              sessions.length === 0
                ? 'border-white/5 bg-white/[0.01] text-white/30 cursor-not-allowed opacity-50'
                : 'bg-white/5 hover:bg-white/10 text-brand-ink border-white/10 hover:border-white/20'
            }`}
            id="btn-export-csv"
            title="Export all study sessions to a CSV file"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          {onResetToSampleData && (
            <button
              onClick={onResetToSampleData}
              className="text-[10px] uppercase font-bold tracking-wider text-white/60 hover:text-brand-ink hover:bg-white/5 transition-all py-1.5 px-3 rounded-sm border border-white/10 bg-transparent flex items-center gap-1 cursor-pointer"
              id="btn-reset-data"
              title="Reset state to initial sample data"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Sample
            </button>
          )}
          {onClearAllSampleData && (
            <button
              onClick={onClearAllSampleData}
              className="text-[10px] uppercase font-bold tracking-wider text-white/40 hover:text-brand-accent transition-colors py-1.5 px-2.5 rounded-sm hover:bg-white/5 flex items-center gap-1 cursor-pointer"
              id="btn-clear-data"
              title="Clear all sessions and subjects"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6 bg-white/[0.02] p-4 rounded-sm border border-white/10">
        {/* Search */}
        <div className="md:col-span-5 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
          <input
            type="text"
            placeholder="Search notes, course codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white/[0.03] text-brand-ink rounded-sm border border-white/10 focus:border-brand-accent/50 focus:bg-white/[0.05] transition-all"
            id="input-session-search"
          />
        </div>

        {/* Subject Filter */}
        <div className="md:col-span-4 relative">
          <Filter className="absolute left-3 top-2.5 h-4 w-4 text-white/40 pointer-events-none" />
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm bg-white/[0.03] text-brand-ink rounded-sm border border-white/10 appearance-none focus:border-brand-accent/50 focus:bg-white/[0.05] transition-all cursor-pointer"
            id="select-filter-subject"
          >
            <option value="all">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code ? `[${sub.code}] ` : ''}
                {sub.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-3 h-3.5 w-3.5 text-white/40 pointer-events-none" />
        </div>

        {/* Duration Filter */}
        <div className="md:col-span-3 relative">
          <Clock className="absolute left-3 top-2.5 h-4 w-4 text-white/40 pointer-events-none" />
          <select
            value={selectedDurationRange}
            onChange={(e) => setSelectedDurationRange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm bg-white/[0.03] text-brand-ink rounded-sm border border-white/10 appearance-none focus:border-brand-accent/50 focus:bg-white/[0.05] transition-all cursor-pointer"
            id="select-filter-duration"
          >
            <option value="all">All Durations</option>
            <option value="short">Quick (&lt; 1 hour)</option>
            <option value="medium">Standard (1 - 2 hours)</option>
            <option value="long">Deep Work (&gt; 2 hours)</option>
          </select>
          <ChevronDown className="absolute right-3 top-3 h-3.5 w-3.5 text-white/40 pointer-events-none" />
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="overflow-x-auto rounded-sm border border-white/10" id="session-logs-wrapper">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white/[0.01]">
            <Calendar className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-sm font-semibold text-white/60">No matching study sessions found</p>
            <p className="text-xs text-white/40 mt-1 max-w-md mx-auto">
              Try adjusting your search keywords, clear filters, or log a new study session.
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-white/5 text-left text-sm" id="session-logs-table">
            <thead className="bg-white/[0.03] font-bold text-white/60 uppercase tracking-widest text-[9px] border-b border-white/10">
              <tr>
                <th scope="col" className="px-5 py-3">Subject</th>
                <th scope="col" className="px-5 py-3">Date Completed</th>
                <th scope="col" className="px-5 py-3">Study Duration</th>
                <th scope="col" className="px-5 py-3">Focus Area & Notes</th>
                <th scope="col" className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence initial={false}>
                {filteredSessions.map((session) => {
                  const sub = subjectMap.get(session.subjectId);
                  const colorTheme = sub ? (COLOR_MAPS[sub.color] || COLOR_MAPS.teal) : COLOR_MAPS.teal;

                  return (
                    <motion.tr
                      key={session.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className="hover:bg-white/[0.02] group transition-all duration-150"
                      id={`session-row-${session.id}`}
                    >
                      {/* Subject info */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {sub ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold font-mono px-2 py-0.5 rounded-sm bg-white/5 text-brand-ink border border-white/10">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colorTheme.bg || 'bg-brand-accent'}`} />
                              {sub.code && <span className="opacity-75">{sub.code}:</span>}
                              {sub.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-white/30 italic text-xs">Deleted Subject</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-white/80">
                          <Calendar className="w-3.5 h-3.5 text-white/30" />
                          <span className="font-medium text-white/80">
                            {formatFriendlyDate(session.date, true)}
                          </span>
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-white/30" />
                          <span className="font-mono font-bold text-brand-accent bg-white/5 px-2 py-0.5 rounded-sm text-xs border border-white/10">
                            {formatDuration(session.duration)}
                          </span>
                        </div>
                      </td>

                      {/* Notes / Covered content */}
                      <td className="px-5 py-3.5 max-w-sm">
                        <p className="text-white/60 text-xs leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                          {session.note || <span className="text-white/30 italic">No description logged.</span>}
                        </p>
                      </td>

                      {/* Delete Action */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <button
                          onClick={() => onDeleteSession(session.id)}
                          className="p-1.5 text-white/40 hover:text-brand-accent rounded-sm hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                          title="Delete study session"
                          id={`btn-delete-session-${session.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
