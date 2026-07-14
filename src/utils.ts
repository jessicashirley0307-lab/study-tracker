/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StudySession } from './types';

// Parse ISO date YYYY-MM-DD safely without timezone shifting
export function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Format Date object back to ISO YYYY-MM-DD
export function formatISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get the Monday (start of week) for a given date
export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // Monday is 1, Sunday is 0. If day is 0, subtract 6. Otherwise subtract day - 1.
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(d.setDate(diff));
  start.setHours(0, 0, 0, 0);
  return start;
}

// Get standard date strings for the week (Mon to Sun) given a reference date
export function getWeekDays(referenceDate: Date): string[] {
  const start = getStartOfWeek(referenceDate);
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(formatISODate(d));
  }
  return days;
}

// Calculate the study streak in days
export function calculateStreak(sessions: StudySession[], todayStr: string): number {
  if (sessions.length === 0) return 0;

  // Filter out any sessions with 0 or negative duration
  const activeSessions = sessions.filter(s => s.duration > 0);
  if (activeSessions.length === 0) return 0;

  // Set of unique study dates
  const studyDates = new Set(activeSessions.map(s => s.date));

  // Determine starting point
  let current = parseISODate(todayStr);
  const currentStr = formatISODate(current);

  // Yesterday date string
  const yesterday = new Date(current);
  yesterday.setDate(current.getDate() - 1);
  const yesterdayStr = formatISODate(yesterday);

  let startFrom: Date;

  if (studyDates.has(currentStr)) {
    startFrom = current;
  } else if (studyDates.has(yesterdayStr)) {
    startFrom = yesterday;
  } else {
    // If the student didn't study today or yesterday, the streak is broken
    return 0;
  }

  let streakCount = 0;
  let testDate = new Date(startFrom);

  while (true) {
    const testStr = formatISODate(testDate);
    if (studyDates.has(testStr)) {
      streakCount++;
      // Move to previous day
      testDate.setDate(testDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streakCount;
}

// Format duration from minutes to standard readable hours + minutes (e.g. 1h 45m)
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

// Formats date string to friendly display: e.g. "Jul 14" or "Tuesday, Jul 14"
export function formatFriendlyDate(dateStr: string, includeDayName = false): string {
  const d = parseISODate(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const dayName = days[d.getDay()];
  const monthName = months[d.getMonth()];
  const dayNum = d.getDate();
  
  if (includeDayName) {
    return `${dayName}, ${monthName} ${dayNum}`;
  }
  return `${monthName} ${dayNum}`;
}

export const COLOR_MAPS: Record<string, {
  bg: string; // solid color
  text: string;
  border: string;
  progressBg: string;
  textColor: string;
  accent: string;
  lightBg: string;
}> = {
  teal: {
    bg: 'bg-teal-600',
    text: 'text-teal-700',
    border: 'border-teal-200',
    progressBg: 'bg-teal-600',
    textColor: 'text-teal-800',
    accent: 'bg-teal-50 text-teal-700 border-teal-200',
    lightBg: 'bg-teal-50/50',
  },
  indigo: {
    bg: 'bg-indigo-600',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    progressBg: 'bg-indigo-600',
    textColor: 'text-indigo-800',
    accent: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    lightBg: 'bg-indigo-50/50',
  },
  emerald: {
    bg: 'bg-emerald-600',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    progressBg: 'bg-emerald-600',
    textColor: 'text-emerald-800',
    accent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    lightBg: 'bg-emerald-50/50',
  },
  violet: {
    bg: 'bg-violet-600',
    text: 'text-violet-700',
    border: 'border-violet-200',
    progressBg: 'bg-violet-600',
    textColor: 'text-violet-800',
    accent: 'bg-violet-50 text-violet-700 border-violet-200',
    lightBg: 'bg-violet-50/50',
  },
  amber: {
    bg: 'bg-amber-600',
    text: 'text-amber-700',
    border: 'border-amber-200',
    progressBg: 'bg-amber-600',
    textColor: 'text-amber-800',
    accent: 'bg-amber-50 text-amber-700 border-amber-200',
    lightBg: 'bg-amber-50/50',
  },
  rose: {
    bg: 'bg-rose-600',
    text: 'text-rose-700',
    border: 'border-rose-200',
    progressBg: 'bg-rose-600',
    textColor: 'text-rose-800',
    accent: 'bg-rose-50 text-rose-700 border-rose-200',
    lightBg: 'bg-rose-50/50',
  },
  sky: {
    bg: 'bg-sky-600',
    text: 'text-sky-700',
    border: 'border-sky-200',
    progressBg: 'bg-sky-600',
    textColor: 'text-sky-800',
    accent: 'bg-sky-50 text-sky-700 border-sky-200',
    lightBg: 'bg-sky-50/50',
  }
};

// Available colors list for adding new subjects
export const SUBJECT_COLORS = ['teal', 'indigo', 'emerald', 'violet', 'amber', 'rose', 'sky'];
