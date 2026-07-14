/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Subject {
  id: string;
  name: string;
  targetHours: number; // target study hours per week
  color: string; // Tailwind class color or theme hex
  code?: string; // Course code e.g., CS-301
}

export interface StudySession {
  id: string;
  subjectId: string;
  duration: number; // in minutes
  date: string; // ISO format: YYYY-MM-DD
  note: string;
}

export interface DashboardStats {
  totalHoursThisWeek: number;
  streakDays: number;
  subjectProgress: {
    subjectId: string;
    hoursCompleted: number;
    hoursTarget: number;
    percentage: number;
  }[];
}
