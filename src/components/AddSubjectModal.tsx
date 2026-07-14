/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Target, Palette, Bookmark, HelpCircle } from 'lucide-react';
import { Subject } from '../types';
import { COLOR_MAPS, SUBJECT_COLORS } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSubject: (subject: Omit<Subject, 'id'>) => void;
}

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  isOpen,
  onClose,
  onAddSubject,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [targetHours, setTargetHours] = useState<number>(5);
  const [color, setColor] = useState('teal');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Subject name is required');
      return;
    }
    if (targetHours <= 0 || targetHours > 40) {
      setError('Please set a realistic weekly target between 1 and 40 hours');
      return;
    }

    onAddSubject({
      name: name.trim(),
      code: code.trim().toUpperCase() || undefined,
      targetHours,
      color,
    });

    // Reset Form
    setName('');
    setCode('');
    setTargetHours(5);
    setColor('teal');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" id="add-subject-modal-portal">
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
              id="add-subject-modal-content"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-lg p-1 text-stone-400 hover:bg-stone-50 hover:text-stone-700 transition-colors"
                id="btn-close-subject-modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-stone-900">Add New Subject</h3>
                  <p className="text-xs text-stone-500">Track a new course in your study portal</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 border border-red-200 text-xs text-red-700 font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Subject Name */}
                <div>
                  <label htmlFor="subject-name" className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    id="subject-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Advanced Organic Chemistry"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-stone-50/50 hover:bg-stone-50 transition-colors"
                    maxLength={50}
                    required
                  />
                </div>

                {/* Course Code & Target Hours Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Course Code */}
                  <div>
                    <label htmlFor="course-code" className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
                      Course Code <span className="text-stone-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      id="course-code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="e.g. CHEM-302"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-stone-50/50 hover:bg-stone-50 transition-colors uppercase"
                      maxLength={10}
                    />
                  </div>

                  {/* Target Hours */}
                  <div>
                    <label htmlFor="target-hours" className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
                      Weekly Target <span className="text-stone-400 font-normal">(Hrs)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="target-hours"
                        value={targetHours}
                        onChange={(e) => setTargetHours(Number(e.target.value))}
                        min={1}
                        max={40}
                        className="w-full px-3.5 py-2.5 pr-8 text-sm rounded-xl border border-stone-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-stone-50/50 hover:bg-stone-50 transition-colors"
                        required
                      />
                      <Target className="absolute right-3 top-3 w-4 h-4 text-stone-400" />
                    </div>
                  </div>
                </div>

                {/* Color Selector */}
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5 text-stone-400" />
                    Subject Dashboard Color Accent
                  </label>
                  <div className="flex flex-wrap gap-2.5 bg-stone-50 p-3 rounded-xl border border-stone-200/50">
                    {SUBJECT_COLORS.map((colorName) => {
                      const colorTheme = COLOR_MAPS[colorName];
                      const isSelected = color === colorName;
                      return (
                        <button
                          key={colorName}
                          type="button"
                          onClick={() => setColor(colorName)}
                          className={`w-7 h-7 rounded-full ${colorTheme.bg} flex items-center justify-center border-2 transition-all cursor-pointer ${
                            isSelected ? 'border-stone-800 scale-110 shadow-md ring-2 ring-stone-800/20' : 'border-transparent hover:scale-105'
                          }`}
                          title={`Select ${colorName}`}
                        >
                          {isSelected && (
                            <span className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Study Guidelines tip box */}
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 flex items-start gap-2 text-[11px] text-stone-500 leading-relaxed">
                  <HelpCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Tip:</strong> Aim for 2-3 hours of study for every unit hour. Standard full-time subjects typically require <strong>5 to 8 hours</strong> of weekly study.
                  </p>
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
                    className="flex-1 py-2.5 bg-linear-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-teal-500/15 hover:shadow-lg transition-all cursor-pointer"
                  >
                    Create Subject
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
