export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  username: string;
  email: string;
  role: string;
}

export interface SignupRequest {
  fullName: string;
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface AdmissionApplication {
  id?: number;
  applicationNumber?: string;
  academicYear?: number;
  permanentRollNumber?: string;
  studentName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  appliedClass: string;
  assignedClass?: string;
  assignedSection?: string;
  previousSchool: string;
  marksPercentage: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  remarks?: string;
  registeredBy?: string;
  appliedDate?: string;
  decisionDate?: string;
}

export interface StudentRegistrationDto {
  username?: string;
  password?: string;
  studentName?: string;
  fullName?: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  appliedClass: string;
  previousSchool: string;
  marksPercentage: number;
}

export interface AdminStudentRegistrationDto {
  fullName: string;
  studentName?: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  appliedClass: string;
  previousSchool?: string;
  marksPercentage: number;
  createUserAccount: boolean;
  username?: string;
  password?: string;
  initialStatus: 'PENDING' | 'APPROVED';
  assignedClass?: string;
  assignedSection?: string;
  remarks?: string;
}

export interface ApprovalDto {
  assignedClass: string;
  assignedSection: string;
  remarks: string;
}

export interface RejectionDto {
  remarks: string;
}

export interface AdminDashboardData {
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  recentApplications: AdmissionApplication[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface StudentDashboardData {
  username: string;
  fullName: string;
  role: string;
  hasApplication: boolean;
  admissionApp?: AdmissionApplication;
  allApplications?: AdmissionApplication[];
}

export interface ReportData {
  students: AdmissionApplication[];
  selectedClass?: string;
  selectedSection?: string;
  availableClasses: string[];
  availableSections: string[];
  totalEnrolled: number;
}

export const ALL_CLASSES: string[] = [
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10'
];

export const CLASSES = ALL_CLASSES;

export const CLASS_CATEGORIES = [
  {
    category: 'Classes (1 - 10)',
    classes: ALL_CLASSES
  }
];

