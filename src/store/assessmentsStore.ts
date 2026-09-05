import { create } from 'zustand';
import type { Assessment, Attempt } from '../types';
import { STORAGE_KEYS, getFromStorage, saveToStorage, generateId } from '../data/seed';

interface AssessmentsState {
  assessments: Assessment[];
  attempts: Attempt[];
  load: () => void;
  addAssessment: (a: Omit<Assessment, 'id' | 'createdAt'>) => void;
  updateAssessment: (id: string, updates: Partial<Assessment>) => void;
  deleteAssessment: (id: string) => void;
  submitAttempt: (attempt: Omit<Attempt, 'id'>) => void;
  getAttemptsByTrainee: (traineeId: string) => Attempt[];
  getAttemptsByAssessment: (assessmentId: string) => Attempt[];
  hasAttempted: (assessmentId: string, traineeId: string) => boolean;
  getTrainerAssessments: (trainerId: string) => Assessment[];
}

export const useAssessmentsStore = create<AssessmentsState>((set, get) => ({
  assessments: [],
  attempts: [],

  load: () => {
    set({
      assessments: getFromStorage<Assessment>(STORAGE_KEYS.ASSESSMENTS),
      attempts: getFromStorage<Attempt>(STORAGE_KEYS.ATTEMPTS),
    });
  },

  addAssessment: (a) => {
    const { assessments } = get();
    const newA: Assessment = { ...a, id: generateId('assess'), createdAt: new Date().toISOString() };
    const updated = [...assessments, newA];
    saveToStorage(STORAGE_KEYS.ASSESSMENTS, updated);
    set({ assessments: updated });
  },

  updateAssessment: (id, updates) => {
    const { assessments } = get();
    const updated = assessments.map(a => a.id === id ? { ...a, ...updates } : a);
    saveToStorage(STORAGE_KEYS.ASSESSMENTS, updated);
    set({ assessments: updated });
  },

  deleteAssessment: (id) => {
    const { assessments } = get();
    const updated = assessments.filter(a => a.id !== id);
    saveToStorage(STORAGE_KEYS.ASSESSMENTS, updated);
    set({ assessments: updated });
  },

  submitAttempt: (attempt) => {
    const { attempts } = get();
    const newAttempt: Attempt = { ...attempt, id: generateId('att') };
    const updated = [...attempts, newAttempt];
    saveToStorage(STORAGE_KEYS.ATTEMPTS, updated);
    set({ attempts: updated });
  },

  getAttemptsByTrainee: (traineeId) => get().attempts.filter(a => a.traineeId === traineeId),
  getAttemptsByAssessment: (assessmentId) => get().attempts.filter(a => a.assessmentId === assessmentId),
  hasAttempted: (assessmentId, traineeId) => get().attempts.some(a => a.assessmentId === assessmentId && a.traineeId === traineeId),
  getTrainerAssessments: (trainerId) => get().assessments.filter(a => a.createdBy === trainerId),
}));
