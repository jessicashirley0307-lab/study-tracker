/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Subject, StudySession } from './types';

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-1',
    name: 'Advanced Algorithms',
    code: 'CS-301',
    targetHours: 8,
    color: 'teal', // beautiful deep teal
  },
  {
    id: 'sub-2',
    name: 'Calculus III',
    code: 'MATH-215',
    targetHours: 6,
    color: 'indigo', // indigo slate
  },
  {
    id: 'sub-3',
    name: 'Organic Chemistry II',
    code: 'CHEM-202',
    targetHours: 7,
    color: 'emerald', // warm emerald
  },
  {
    id: 'sub-4',
    name: 'Linear Algebra',
    code: 'MATH-102',
    targetHours: 5,
    color: 'violet', // soft violet
  },
  {
    id: 'sub-5',
    name: 'Intro to Psychology',
    code: 'PSY-101',
    targetHours: 4,
    color: 'amber', // warm amber
  },
];

export const INITIAL_SESSIONS: StudySession[] = [
  {
    id: 'sess-1',
    subjectId: 'sub-1',
    duration: 90, // 1.5h
    date: '2026-07-14',
    note: 'Mastered dynamic programming and solved 3 hard memoization matrix problems.',
  },
  {
    id: 'sess-2',
    subjectId: 'sub-2',
    duration: 120, // 2.0h
    date: '2026-07-13',
    note: 'Practiced line integrals and Green\'s Theorem exercises with my virtual study group.',
  },
  {
    id: 'sess-3',
    subjectId: 'sub-3',
    duration: 60, // 1.0h
    date: '2026-07-13',
    note: 'Reviewed nucleophilic substitution mechanisms of alkyl halides and drew mechanisms.',
  },
  {
    id: 'sess-4',
    subjectId: 'sub-4',
    duration: 95, // ~1.58h
    date: '2026-07-12',
    note: 'Practiced matrix diagonalization, calculating eigenvalues, and eigenvectors of 3x3 matrices.',
  },
  {
    id: 'sess-5',
    subjectId: 'sub-5',
    duration: 150, // 2.5h
    date: '2026-07-11',
    note: 'Read Chapter 7 on cognitive development theories, Piaget\'s stages, and information processing.',
  },
  {
    id: 'sess-6',
    subjectId: 'sub-1',
    duration: 45, // 0.75h
    date: '2026-07-11',
    note: 'Debugged Red-Black tree node rotation code and verified height balance theorems.',
  },
  {
    id: 'sess-7',
    subjectId: 'sub-2',
    duration: 120, // 2.0h
    date: '2026-07-10',
    note: 'Solved triple integrals over spherical and cylindrical coordinates. Challenging geometry!',
  },
  {
    id: 'sess-8',
    subjectId: 'sub-3',
    duration: 90, // 1.5h
    date: '2026-07-09',
    note: 'Finished pre-lab organic chemistry assignment on the synthesis of aspirin and reaction yields.',
  },
  {
    id: 'sess-9',
    subjectId: 'sub-4',
    duration: 60, // 1.0h
    date: '2026-07-08',
    note: 'Reviewed vector spaces, subspaces, and wrote formal proofs on linear independence.',
  },
  {
    id: 'sess-10',
    subjectId: 'sub-1',
    duration: 110, // ~1.83h
    date: '2026-07-07',
    note: 'Implemented Dijkstra\'s shortest path algorithm from scratch in Python and profiled its runtimes.',
  },
];
