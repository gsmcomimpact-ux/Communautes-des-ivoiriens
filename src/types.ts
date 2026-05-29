export type UserRole = 'admin' | 'trésorier' | 'secrétaire' | 'superviseur' | 'membre';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  mfaEnabled?: boolean;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'actif' | 'suspendu' | 'inactif';
  joinDate: string;
  address: string;
  photoUrl?: string;
  membershipCardNumber: string;
  notes?: string;
}

export interface FinancialTransaction {
  id: string;
  type: 'recette' | 'dépense';
  category: string;
  amount: number;
  date: string;
  description: string;
  sourceOrDestination: string; // caisse, banque, donateur, etc.
  receiptId?: string;
  projectName?: string; // Optional links to projects
}

export interface Contribution {
  id: string;
  memberId: string;
  memberName: string;
  month: string; // YYYY-MM
  amountPaid: number;
  amountDue: number;
  status: 'payé' | 'partiel' | 'en_retard';
  lastPaymentDate?: string;
}

export interface Donation {
  id: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  date: string;
  projectLinked?: string;
  message?: string;
  receiptNumber: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  expenses: number;
  beneficiariesCount: number;
  startDate: string;
  endDate: string;
  status: 'planifié' | 'en_cours' | 'terminé';
  performanceIndex: number; // percentage completions
  activities: ProjectActivity[];
}

export interface ProjectActivity {
  id: string;
  title: string;
  date: string;
  status: 'à_faire' | 'en_cours' | 'complété';
  responsibleName: string;
}

export interface DocItem {
  id: string;
  title: string;
  category: string;
  fileName: string;
  fileSize: string;
  uploadedBy: string;
  uploadedAt: string;
  fileUrl?: string;
  contentBase64?: string; // Optional for mock storage upload
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userEmail: string;
  role: UserRole;
  action: string;
  details: string;
}

export interface SecurityStatus {
  lastBackup: string;
  encryptionKeyStrength: string;
  systemIntegrity: 'excellent' | 'compromis';
  threatAlerts: number;
}

export interface AIAnalysisResult {
  anomalies: string[];
  recommendations: string[];
  trendSummary: string;
  generatedAt: string;
}
