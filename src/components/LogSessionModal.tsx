/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, FileText, CheckCircle } from 'lucide-react';
import { Subject, StudySession } from '../types';
import { formatISODate } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

interface LogSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  onLogSession: (session: Omit<StudySession, 'id'>) => void;
  preselectedSubjectId?: string;
  defaultDateStr?: string;
}

export const LogSessionModal: React.FC<LogSessionModalProps> = ({
  isOpen,
  onClose,
  subjects,
  onLogSession,
  preselectedSubjectId = '',
  defaultDateStr = '2026-07-14', // Default to current system date
}) => {
  const [subjectId, setSubjectId] = useState('');
  const [duration, setDuration] = useState<number>(60);
  const [date, setDate] = useState(defaultDateStr);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  // Sync state with preselected subject when opened
  useEffect(() => {
    if (isOpen) {
      if (preselectedSubjectId) {
        setSubjectId(preselectedSubjectId);
      } else if (subjects.length > 0 && !subjectId) {
        setSubjectId(subjects[0].id);
      }
      setDate(defaultDateStr);
    }
  }, [isOpen, preselectedSubjectId, subjects, defaultDateStr]);

  const durationPresets = [
    { label: '30m', val: 30 },
    { label: '45m', val: 45 },
    { label: '1h', val: 60 },
    { label: '1.5h', val: 90 },
    { label: '2h', val: 120 },
    { label: '3h', val: 180 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) {
      setError('Please select a subject');
      return;
    }
    if (duration <= 0 || duration > 1440) {
      setError('Please enter a valid study duration between 1 minute and 24 hours (1440 mins)');
      return;
    }
    if (!date) {
      setError('Date is required');
      return;
    }

    onLogSession({
      subjectId,
      duration,
      date,
      note: note.trim(),
    });

    // Reset Form (note only, keeping others for quick multi-entry context)
    setNote('');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" id="log-session-modal-portal">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 shadow-xl"
              id="log-session-modal-content"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-lg p-1 text-stone-400 hover:bg-stone-50 hover:text-stone-700 transition-colors"
                id="btn-close-session-modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-stone-900">Log Study Session</h3>
                  <p className="text-xs text-stone-500">Record your hours and study outcomes</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 border border-red-200 text-xs text-red-700 font-medium">
                  {error}
                </div>
              )}

              {subjects.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-stone-500 text-sm">Please add a subject first before logging a study session.</p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Subject Dropdown */}
                  <div>
                    <label htmlFor="log-subject" className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
                      Subject *
                    </label>
                    <select
                      id="log-subject"
                      value={subjectId}
                      onChange={(e) => setSubjectId(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50/50 hover:bg-stone-50 border border-stone-200 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 cursor-pointer"
                      required
                    >
                      <option value="" disabled>Select a Subject</option>
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.code ? `[${sub.code}] ` : ''}
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Duration Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="log-duration" className="block text-xs font-semibold text-stone-600 uppercase tracking-wider">
                        Study Duration (Minutes) *
                      </label>
                      <span className="text-xs text-stone-500 font-mono">
                        {duration >= 60 ? `(${Math.floor(duration / 60)}h ${duration % 60}m)` : `(${duration}m)`}
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        id="log-duration"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        min={1}
                        max={1440}
                        placeholder="e.g. 90"
                        className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border border-stone-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-stone-50/50 hover:bg-stone-50 transition-colors"
                        required
                      />
                      <Clock className="absolute right-3 top-3 w-4.5 h-4.5 text-stone-400" />
                    </div>

                    {/* Quick presets list */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {durationPresets.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setDuration(preset.val)}
                          className={`text-xs py-1 px-2.5 rounded-lg border transition-all cursor-pointer ${
                            duration === preset.val
                              ? 'bg-teal-50 text-teal-700 border-teal-300 font-medium'
                              : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-600'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Input */}
                  <div>
                    <label htmlFor="log-date" className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
                      Study Date *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        id="log-date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        max={defaultDateStr} // Prevent future study logs
                        className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border border-stone-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-stone-50/50 hover:bg-stone-50 transition-colors"
                        required
                      />
                      <Calendar className="absolute right-3 top-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Covered description */}
                  <div>
                    <label htmlFor="log-notes" className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
                      Focus Area & Study Notes <span className="text-stone-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <textarea
                        id="log-notes"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="What specific topics did you review? e.g. Drew resonance structures and practiced 10 mechanism problems."
                        rows={3}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-stone-50/50 hover:bg-stone-50 transition-colors resize-none leading-relaxed"
                        maxLength={280}
                      />
                      <FileText className="absolute right-3 bottom-3 w-4.5 h-4.5 text-stone-400 pointer-events-none" />
                    </div>
                    <div className="text-right text-[10px] text-stone-400 mt-0.5">
                      {note.length}/280 characters
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-2.5 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-linear-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-teal-500/15 hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Save Log
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
