export type UserRole = 'PATIENT' | 'DOCTOR' | 'STUDENT' | 'PROVIDER' | 'ADMIN';

export type VerificationStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export type BookingStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'RESCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED_BY_PATIENT'
  | 'CANCELLED_BY_PROVIDER'
  | 'NO_SHOW'
  | 'REJECTED';

export type PaymentStatus = 
  | 'UNPAID'
  | 'PENDING'
  | 'PAID'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED'
  | 'FAILED';

export type TransactionStatus = 
  | 'INITIATED'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'REVERSED';

export interface Address {
  id: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  phone?: string;
  bio?: string;
  address?: Address;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  profile?: UserProfile;
  patientProfile?: any;
  doctorProfile?: DoctorProfile;
  studentProfile?: StudentProfile;
  providerProfile?: ProviderProfile;
}

export interface DoctorProfile {
  id: string;
  registrationNumber: string;
  category: string;
  specialties: string[];
  experience: number;
  consultationFee: number;
  onlineConsultFee: number;
  verificationStatus: VerificationStatus;
  user?: User;
}

export interface StudentProfile {
  id: string;
  institutionName: string;
  enrollmentNumber?: string;
  courseOfStudy?: string;
  yearOfStudy?: number;
  verificationStatus: VerificationStatus;
  user?: User;
}

export interface ProviderProfile {
  id: string;
  providerType: string;
  legalName: string;
  registrationNumber?: string;
  verificationStatus: VerificationStatus;
  address?: Address;
  user?: User;
}

export interface Booking {
  id: string;
  bookingReference: string;
  patientId: string;
  patient?: User;
  doctorProfileId?: string;
  doctorProfile?: DoctorProfile;
  providerProfileId?: string;
  providerProfile?: ProviderProfile;
  appointmentType: string;
  scheduledDate: string;
  scheduledTime: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalFee: number;
  patientNotes?: string;
  cancellationReason?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  booking?: Booking;
  amount: number;
  currency: string;
  method?: string;
  status: PaymentStatus;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  paidAt?: string;
  createdAt: string;
}

export interface Payout {
  id: string;
  doctorProfileId?: string;
  doctorProfile?: DoctorProfile;
  providerProfileId?: string;
  providerProfile?: ProviderProfile;
  amount: number;
  platformFee: number;
  netAmount: number;
  status: TransactionStatus;
  bankAccount?: string;
  utrNumber?: string;
  processedAt?: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reportedById: string;
  reportedBy?: User;
  subjectUserId?: string;
  subjectUser?: User;
  subjectType: 'user' | 'content' | 'review';
  subjectId: string;
  reason: string;
  description?: string;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedNotes?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId?: string;
  actor?: User;
  action: string;
  entityType: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  metadata?: any;
}
