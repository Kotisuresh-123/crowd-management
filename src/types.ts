export type DepartmentStatus = 'Normal' | 'Busy' | 'Critical';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  status: 'Available' | 'In Consultation' | 'On Break' | 'Off Duty';
  departmentId: string;
  patientsTreatedToday: number;
}

export interface Department {
  id: string;
  name: string;
  capacity: number;
  avgWaitTime: number; // in minutes
  trend: 'up' | 'down' | 'stable';
}

export type PatientCategory = 'Pregnancy' | 'Elderly' | 'Child' | 'Standard';

export interface Patient {
  id: string;
  name: string;
  age: number;
  category: PatientCategory;
  triageLevel: 1 | 2 | 3 | 4 | 5; // 1 is most urgent
  department: string;
  checkInTime: string;
  status: 'Waiting' | 'In Consultation' | 'Discharged';
  estimatedWaitTime?: number; // in minutes
}

export interface HospitalStats {
  totalPatients: number;
  activeEmergency: number;
  availableBeds: number;
  avgWaitTime: number;
}
