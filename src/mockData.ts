import { Department, Patient, HospitalStats, Doctor } from './types';

export const DEPARTMENTS: Department[] = [
  {
    id: 'er',
    name: 'Emergency Room',
    capacity: 50,
    avgWaitTime: 45,
    trend: 'up',
  },
  {
    id: 'opd',
    name: 'Outpatient Dept',
    capacity: 200,
    avgWaitTime: 15,
    trend: 'down',
  },
  {
    id: 'icu',
    name: 'Intensive Care Unit',
    capacity: 20,
    avgWaitTime: 0,
    trend: 'stable',
  },
  {
    id: 'cardio',
    name: 'Cardiology',
    capacity: 40,
    avgWaitTime: 20,
    trend: 'stable',
  },
  {
    id: 'radio',
    name: 'Radiology',
    capacity: 45,
    avgWaitTime: 60,
    trend: 'up',
  },
];

export const DOCTORS: Doctor[] = [
  { id: 'D001', name: 'Dr. Sarah Connor', specialty: 'Emergency Medicine', status: 'Available', departmentId: 'er', patientsTreatedToday: 12 },
  { id: 'D002', name: 'Dr. James Wilson', specialty: 'Cardiology', status: 'In Consultation', departmentId: 'cardio', patientsTreatedToday: 8 },
  { id: 'D003', name: 'Dr. Lisa Cuddy', specialty: 'General Practice', status: 'Available', departmentId: 'opd', patientsTreatedToday: 15 },
  { id: 'D004', name: 'Dr. Gregory House', specialty: 'Diagnostics', status: 'On Break', departmentId: 'icu', patientsTreatedToday: 4 },
  { id: 'D005', name: 'Dr. Eric Foreman', specialty: 'Neurology', status: 'Available', departmentId: 'icu', patientsTreatedToday: 6 },
  { id: 'D006', name: 'Dr. Allison Cameron', specialty: 'Radiology', status: 'In Consultation', departmentId: 'radio', patientsTreatedToday: 10 },
];

export const PATIENTS: Patient[] = [];

export const HOSPITAL_STATS: HospitalStats = {
  totalPatients: 240,
  activeEmergency: 12,
  availableBeds: 45,
  avgWaitTime: 28,
};

export const OCCUPANCY_HISTORY = [
  { time: '08:00', occupancy: 120 },
  { time: '10:00', occupancy: 180 },
  { time: '12:00', occupancy: 210 },
  { time: '14:00', occupancy: 240 },
  { time: '16:00', occupancy: 220 },
  { time: '18:00', occupancy: 190 },
  { time: '20:00', occupancy: 150 },
];
