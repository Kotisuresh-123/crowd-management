import { Patient, PatientCategory } from '../types';

/**
 * Priority Logic:
 * 1. Triage Level (1-5, lower is more urgent) is the primary factor.
 * 2. Within the same triage level, Category provides a boost:
 *    - Pregnancy: Highest boost
 *    - Child: High boost
 *    - Elderly: Medium boost
 *    - Standard: No boost
 */

const CATEGORY_WEIGHTS: Record<PatientCategory, number> = {
  'Pregnancy': 100,
  'Child': 50,
  'Elderly': 30,
  'Standard': 0,
};

export function calculatePriorityScore(patient: Patient): number {
  // Base score from triage (1 -> 5000, 2 -> 4000, ..., 5 -> 1000)
  const triageScore = (6 - patient.triageLevel) * 1000;
  
  // Category boost
  const categoryBoost = CATEGORY_WEIGHTS[patient.category];
  
  // Time waiting boost (1 point per minute)
  const waitMinutes = Math.floor((Date.now() - new Date(patient.checkInTime).getTime()) / (1000 * 60));
  
  return triageScore + categoryBoost + waitMinutes;
}

export function estimateWaitTime(patient: Patient, queue: Patient[]): number {
  if (patient.status !== 'Waiting') return 0;
  
  const myScore = calculatePriorityScore(patient);
  const aheadInQueue = queue.filter(p => 
    p.status === 'Waiting' && 
    p.id !== patient.id && 
    calculatePriorityScore(p) > myScore
  ).length;
  
  // Assume each doctor takes ~15 mins per patient, and there are 3 doctors per dept
  const AVG_CONSULTATION_TIME = 15;
  const DOCTORS_COUNT = 3;
  
  return Math.max(5, Math.ceil((aheadInQueue * AVG_CONSULTATION_TIME) / DOCTORS_COUNT));
}
