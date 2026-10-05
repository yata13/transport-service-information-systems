export interface BajajVehicle {
  id: string;
  digitalId: string; // e.g. DID-25-000784521
  plateNumber: string; // e.g. 3-AM-04521 or AA-12345
  vin: string; // Chassis number e.g. MBN12345678912345
  vehicleType: string; // Bajaj (ባጃጅ)
  bajajModel: string; // TVS King, Bajaj RE 4S, Piaggio Ape City, Mahindra Alfa
  bajajAssociation: string; // e.g. Addis Bajaj Share Company, ፋሲል የባጃጅ ማህበር (Fasil Bajaj), አዘዞ ማህበር
  color: string; // Red, Blue, White, Green, Yellow
  owner: string; // e.g. አቶ ታምራት አለማየሁ (Tamirat Alemayehu)
  ownerPhone: string;
  driverName: string;
  driverPhone?: string; // e.g. +251 91 876 5432
  driverPhoto?: string; // URL / base64 or fallback avatar
  kebele?: string; // e.g. ቀበሌ 03 (Kebele 03)
  address?: string; // e.g. አራዳ፣ ቀበሌ 03፣ ጎንደር
  permitNo: string; // PRM-25-5566
  issueDate: string; // 2025-01-10
  expiryDate: string; // 2026-01-09
  authorizedArea: string; // ሰበሰተፖል (Sebastopol), አራዳ - ፒያሳ - ፋሲል (ዞን 1), አዘዞ - ኤርፖርት (ዞን 2), ማራኪ ዩኒቨርሲቲ (ዞን 3)
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'ILLEGAL' | 'MISMATCH';
  isBlacklisted: boolean;
  blacklistReason?: string;
  notes?: string;
  qrCodeValue: string;
  registeredCity: string; // ጎንደር (Gondar)
}

export interface VerificationCheckStep {
  id: string;
  titleAm: string;
  titleEn: string;
  status: 'pending' | 'checking' | 'passed' | 'failed';
}

export interface TrafficViolationReport {
  id: string;
  reportNumber: string;
  digitalId: string;
  vehiclePlate: string;
  registeredPlate?: string;
  reason: string;
  reasonAm: string;
  actionTaken: string;
  fineAmount?: number;
  checkedOn: string;
  checkedBy: string;
  notes: string;
  status: 'SUBMITTED' | 'PAID' | 'IMPOUNDED' | 'RESOLVED';
  location: string;
}

export type NavScreen = 
  | 'login'
  | 'dashboard'
  | 'verification'
  | 'progress'
  | 'validityResult'
  | 'vehicleDetails'
  | 'violationReport'
  | 'vehicles'
  | 'reports'
  | 'users'
  | 'settings';
