/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'guest' | 'resident' | 'security' | 'admin' | 'staff';

export type DeliveryPreference = 'evdeyim' | 'cafedeyim' | 'kapiya_biraksinlar';

export type OrderWorkflowStatus = 'bekleniyor' | 'cevaplandi' | 'onaylandi';

export type NotificationChannelPreference = 'app' | 'whatsapp' | 'both';

export type SecurityViewMode = 'hub' | 'guest_full' | 'order_full' | 'facility_full' | 'cargo_full';

export interface SiteBlockConfig {
  block: string;
  apartmentCount: number;
}

export interface SiteResident {
  id: string;
  siteId: string;
  block: string;
  apartment: string;
  fullName: string;
  phone?: string;
  username?: string;
  password?: string;
  smsVerified?: boolean;
  notificationPreference?: NotificationChannelPreference;
  registeredAt?: string;
}

export type SecurityShift = 'Gündüz (08:00 - 16:00)' | 'Akşam (16:00 - 00:00)' | 'Gece (00:00 - 08:00)' | string;
export type SecurityDutyStatus = 'gorevde' | 'izinli' | 'molada';

// Staff Management Categories (Requirement 2)
export type StaffCategory =
  | 'Güvenlik'
  | 'Temizlik'
  | 'Cafeterya / Lounge Cafe'
  | 'Meydancı'
  | 'Teknik bakım'
  | 'Diğer';

export type StaffSalaryType = 'monthly' | 'hourly';

export interface StaffMember {
  id: string;
  siteId: string;
  name: string;
  surname: string;
  phone?: string;
  category?: StaffCategory;
  pinHash?: string; // SHA-256 for secure terminal clock-in
  username?: string;
  password?: string;
  isActive: boolean;
  isArchived?: boolean; // soft-delete so historical logs remain intact
  salaryType?: StaffSalaryType;
  baseSalary?: number; // Aylık baz ücret (TL) veya saatlik taban ücret
  hourlyRate?: number; // Saat başı fazla mesai veya saatlik ücret
  shift?: SecurityShift;
  dutyStatus?: SecurityDutyStatus;
  badgeNumber?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SecurityGuard extends StaffMember {
  // Backward compatibility alias for security guards
}

// Time Attendance / Puantaj Records (Requirement 3)
export interface TimeRecord {
  id: string;
  siteId: string;
  staffId: string;
  staffName: string;
  category: StaffCategory;
  date: string; // YYYY-MM-DD
  clockIn: string; // HH:mm
  clockOut?: string; // HH:mm
  clockInTimestamp: number;
  clockOutTimestamp?: number;
  totalHours?: number;
  overtimeHours?: number;
  status: 'working' | 'completed' | 'admin_adjusted';
  note?: string;
  editedBy?: string; // Admin who modified it
  editedAt?: string;
  editReason?: string;
}

// Managerial Payroll / Bordro Calculation (Requirement 3)
export interface PayrollRecord {
  id: string;
  siteId: string;
  staffId: string;
  staffName: string;
  category: StaffCategory;
  month: string; // YYYY-MM
  totalRegularHours: number;
  totalOvertimeHours: number;
  baseAmount: number;
  overtimeAmount: number;
  bonuses: number;
  advances: number;
  deductions: number;
  netPayable: number;
  isApprovedByAdmin: boolean;
  approvedAt?: string;
  approvedBy?: string;
  notes?: string;
}

// Resident Dues & Debt Models (Requirement 4)
export type DuePaymentStatus = 'odendi' | 'kismi_odendi' | 'odenmedi';
export type DueCategory = 'Aidat' | 'Ortak Alan Elektrik' | 'Demirbaş / Ek Bütçe' | 'Isınma / Yakıt' | 'Diğer';

export interface DueItem {
  id: string;
  siteId: string;
  block: string;
  apartment: string;
  residentName: string;
  period: string; // örn. "Şubat 2026"
  year: number; // 2026, 2025
  month: number; // 1-12
  category: DueCategory;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string; // "15.02.2026"
  status: DuePaymentStatus;
  paidDate?: string;
  paymentMethod?: 'Banka Havalesi / EFT' | 'Kredi Kartı' | 'Yönetim Elden / Kasa';
  paymentSource?: 'bank' | 'admin_manual';
  description?: string;
  isDemo?: boolean;
  breakdown?: { label: string; amount: number }[];
}

export interface SiteAdmin {
  id: string;
  siteId: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  password?: string;
  role: string;
  permissions: string[];
}

// Order Notifications (UNCHANGED as per protection rules, with siteId)
export interface OrderNotification {
  id: string;
  siteId: string;
  company: string;
  block: string;
  apartment: string;
  residentName: string;
  createdAt: string;
  courierName?: string;
  status: OrderWorkflowStatus;
  deliveryPreference?: DeliveryPreference;
  answeredAt?: string;
  approvedBySecurityAt?: string;
  securityApproved: boolean;
  notes?: string;
  guardAcknowledged?: boolean;
}

// Guest Module Types
export type GuestType = 'yaya' | 'aracli';

export type ResidentGuestOption =
  | 'misafirim_gelecek'
  | 'aracli_misafirim'
  | 'kisa_sureli_otopark'
  | 'otopark_yerim_var';

export type ParkingEscortPreference =
  | 'eslik_edin' // "Lütfen eşlik edip yerimi gösterin"
  | 'eslik_etmeyin'; // "Eşlik etmenize gerek yok, yerimi biliyor"

export interface GuestEntry {
  id: string;
  siteId: string;
  guestType: GuestType; // 'yaya' | 'aracli'
  titlePrefix?: 'Bey' | 'Hanım' | '';
  firstName: string;
  lastName: string;
  fullName: string;
  block: string;
  apartment: string;
  residentName: string;
  expectedDate: string; // 'Bugün' | date string
  expectedTime?: string;
  isImmediate?: boolean; // hemen mi yoksa ileri tarih mi
  status: 'bekleniyor' | 'giris_yapti' | 'ayrildi' | 'iptal' | 'iceride'; // Ayrildi ve iceride uyumluluğu
  entryTime?: string;
  exitTime?: string;
  isQuickEntry?: boolean; // 1-dokunuş hızlı nizamiye kaydı
  plateNumber?: string; // İsteğe bağlı
  vehicleBrandModel?: string; // İsteğe bağlı Marka/model
  vehicleColor?: string; // İsteğe bağlı Renk
  notes?: string; // Güvenlik notu
  residentOption?: ResidentGuestOption; // 4 sakin seçeneğinden biri
  parkingEscort?: ParkingEscortPreference; // Kapalı otopark alt seçeneği
  pinCode?: string;
  createdAt: string;
  source: 'sakin' | 'guvenlik';
  residentResponse?: 'EVDEYIM' | 'CAFEDEYIM' | 'YOKUM' | null;
  residentRespondedAt?: string;
  guardAcknowledged?: boolean;
}

export interface InviteCode {
  id: string;
  siteId: string;
  code: string;
  block: string;
  apartment: string;
  residentDocId?: string;
  expiresAt: string;
  used: boolean;
  usedByUid?: string;
  usedByEmail?: string;
  usedAt?: string;
  createdAt: string;
}

// Cargo Module Types
export type CargoCarrier =
  | 'Trendyol'
  | 'Hepsijet'
  | 'Sürat'
  | 'Yurtiçi'
  | 'Aras'
  | 'DHL'
  | 'Kolay Gelsin'
  | 'Bir Günde Kargo'
  | 'PTT Kargo'
  | 'PTT Zarf'
  | 'Kargo X'
  | 'Diğer';

export type ResidentCargoPreference = 'eve_gonderilsin' | 'emanet_kalsin';

export type CargoNotificationStatus = 'bekleniyor' | 'cevaplandi' | 'zaman_asimi';

export type CargoDeliveryStatus = 'guvenlikte' | 'teslim_edildi';

export interface CargoItem {
  id: string; // Benzersiz kayıt numarası (Örn: CRG-88219)
  siteId: string;
  carrier: CargoCarrier | string;
  block: string;
  apartment: string;
  recipientName: string;
  pieceCount: number; // Kargo adedi
  createdAt: string; // Tarih ve saat
  receivedAt: string; // Tarih ve saat
  deliveredAt?: string;
  residentPreference?: ResidentCargoPreference; // 'eve_gonderilsin' | 'emanet_kalsin'
  answeredAt?: string;
  notificationStatus: CargoNotificationStatus; // 'bekleniyor' | 'cevaplandi' | 'zaman_asimi'
  deliveryStatus: CargoDeliveryStatus; // 'guvenlikte' | 'teslim_edildi'
  securityOfficerName?: string;
  notes?: string;
  securitySeen?: boolean; // Güvenlik sakinin tercihini onayladı mı
  smsCode?: string; // Emanet için 4 haneli SMS kodu
  smsCodeVerified?: boolean;
  status?: string; // backward-compatibility alias
  trackingCode?: string; // backward-compatibility alias
}

export type SuggestionCategory =
  | 'Temizlik'
  | 'Teknik & Bakım'
  | 'Güvenlik'
  | 'Peyzaj & Bahçe'
  | 'Otopark Düzeni'
  | 'Genel Öneri';

export type UrgencyLevel = 'normal' | 'oncelikli' | 'acil';

export interface SuggestionItem {
  id: string;
  siteId: string;
  title: string;
  category: SuggestionCategory;
  urgency: UrgencyLevel;
  message: string;
  residentName: string;
  residentBlock: string;
  residentApartment: string;
  createdAt: string;
  status: 'inceleniyor' | 'yanitlandi' | 'cozuldu';
  adminResponse?: string;
  respondedAt?: string;
}

export interface CafeItem {
  id: string;
  name: string;
  category: 'Kahve & Sıcak' | 'Soğuk İçecek' | 'Tatlı & Atıştırmalık' | 'Sandviç & Tost';
  price: number;
  description: string;
  isAvailable: boolean;
}

export interface CafeOrder {
  id: string;
  siteId: string;
  items: { item: CafeItem; quantity: number }[];
  totalPrice: number;
  block: string;
  apartment: string;
  residentName: string;
  status: 'hazirlaniyor' | 'yolda' | 'teslim_edildi';
  orderedAt: string;
  deliveryOption: 'masaya' | 'daireye';
  tableNumber?: string;
}

export interface SiteInfo {
  id: string;
  name: string;
  address: string;
  city: string;
  district?: string;
  blockCount: number;
  apartmentCount: number;
  securityCount: number;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  securityPhone: string;
  securityPasswordHash?: string;
  blocks?: SiteBlockConfig[];
  isDemo?: boolean;
  registrationCode?: string; // Siteye özel sakin kayıt kodu
  modules?: {
    cafe?: boolean;
    facilities?: boolean;
    businessNetwork?: boolean;
    keyHandover?: boolean;
    whatsapp?: boolean;
    faceRecognition?: boolean;
    nfc?: boolean;
    geofence?: boolean;
  };
  whatsappConfig?: {
    enabled: boolean;
    phoneNumberId?: string;
    waitMinutes?: number;
    accountStatus?: 'connected' | 'disconnected' | 'testing';
  };
  geofenceConfig?: {
    enabled: boolean;
    boundaryPoints?: { lat: number; lng: number }[];
    zones?: { id: string; name: string; type: string }[];
  };
  hardwareConfig?: {
    faceRecognitionEnabled: boolean;
    kvkkConsentApproved: boolean;
    cameraCount?: number;
    nfcGateEnabled: boolean;
  };
}

export type UserTheme = 'sage' | 'fuchsia' | 'rose' | 'pearl';

export interface ResidentUser {
  id: string;
  siteId: string;
  fullName: string;
  block: string;
  apartment: string;
  phone: string;
  email?: string;
  username?: string;
  isOwner?: boolean; // Ev sahibi (true) / Kiracı (false)
  familyMembers?: { name: string; relation: string; phone?: string }[];
  vehicles?: { plateNumber: string; brand?: string; color?: string; nfcTagUid?: string }[];
  notificationPreference?: NotificationChannelPreference;
}

export interface DriveBackupConfig {
  isEnabled: boolean;
  frequency: 'daily' | 'weekly' | 'manual';
  lastBackupDate?: string;
  targetFolderId?: string;
}

// Facility & Vendor Entry Types (TESİS / TEDARİKÇİ)
export type FacilityCategory =
  | 'Su / Tüp Dağıtım'
  | 'Teknik Servis'
  | 'Nakliye & Taşınma'
  | 'Temizlik & Hizmet'
  | 'Peyzaj & Bahçe'
  | 'Diğer Tedarikçi';

export interface FacilityEntry {
  id: string;
  siteId: string;
  category: FacilityCategory;
  companyName: string;
  personName?: string;
  phone?: string;
  targetArea: 'ortak_alan' | 'daire';
  block?: string;
  apartment?: string;
  plateNumber?: string;
  notes?: string;
  entryTime: string;
  exitTime?: string;
  status: 'iceride' | 'ayrildi';
  officerName?: string;
  createdAt: string;
}

// Anahtar & Zimmet Takibi (Requirement 9)
export interface KeyHandoverItem {
  id: string;
  siteId: string;
  keyName: string;
  title?: string; // alias for keyName
  category: 'Ortak Alan' | 'Teknik Oda' | 'Tesis & Spor' | 'Otopark / Bariyer Kumandası' | 'Depo & Sığınak' | string;
  itemType?: string;
  codeOrBarcode?: string;
  block?: string;
  apartment?: string;
  recipientName: string;
  holderName?: string; // alias
  holderRole?: string;
  recipientPhone?: string;
  holderPhone?: string; // alias
  handedOverAt: string;
  givenAt?: string; // alias
  handedOverBy: string;
  securityGuardName?: string; // alias
  expectedReturnAt?: string;
  returnedAt?: string;
  returnedTo?: string;
  status: 'teslim_edildi' | 'iade_alindi' | 'gecikmis' | 'held' | 'returned' | 'overdue';
  notes?: string;
}

// Duyuru ve Bildirim Sistemi (Requirement 12)
export interface SiteAnnouncement {
  id: string;
  siteId: string;
  title: string;
  content: string;
  category?: string;
  priority: 'bilgi' | 'onemli' | 'acil' | 'high' | 'low' | 'normal' | 'urgent';
  targetType?: 'tum_site' | 'blok' | 'daire';
  targetAudience?: 'all' | 'block' | 'unit';
  targetBlock?: string;
  targetApartment?: string;
  createdAt: string;
  validUntil?: string;
  authorName: string;
  readByUids?: string[];
  imageUrl?: string;
  isActive?: boolean;
}

// Sakinler Arası İş Ağı ve Ticari İş Birliği (Requirement 17)
export interface ResidentBusinessProfile {
  id: string;
  residentId: string;
  siteId: string;
  fullName: string;
  block: string;
  apartment: string;
  companyName?: string;
  title?: string;
  profession?: string; // alias
  category:
    | 'Bilişim & Yazılım'
    | 'Hukuk & Mali Müşavirlik'
    | 'Mimarlık & İnşaat'
    | 'Sağlık & Medikal'
    | 'Eğitim & Danışmanlık'
    | 'Tasarım & Reklam'
    | 'Ticaret & Tedarik'
    | 'Diğer Hizmet'
    | string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  showPhone: boolean;
  isPhonePublic?: boolean; // alias
  preferredContactMethod?: 'whatsapp' | 'phone' | 'email';
  showEmail: boolean;
  showApartment: boolean;
  isAvailableForNetworking: boolean;
  updatedAt: string;
}

// Finans: Gelir-Gider & Fatura OCR (Requirement 11)
export interface ExpenseRecord {
  id: string;
  siteId: string;
  category:
    | 'Elektrik & Su'
    | 'Asansör & Bakım'
    | 'Personel Maaş & SGK'
    | 'Peyzaj & Bahçe'
    | 'Temizlik & Sarf'
    | 'Güvenlik Donanımı'
    | 'Yönetim Giderleri'
    | 'Diğer'
    | string;
  vendorName: string;
  description?: string;
  invoiceNumber?: string;
  taxNumber?: string;
  taxId?: string; // alias
  invoiceDate: string;
  date?: string; // alias
  dueDate?: string;
  amount: number;
  totalAmount?: number; // alias
  vatAmount?: number;
  isPaid: boolean;
  status?: 'odendi' | 'bekliyor' | 'gecikti' | 'paid' | 'pending';
  paidDate?: string;
  paymentMethod?: 'Banka Havalesi / EFT' | 'Kredi Kartı' | 'Kasa' | string;
  receiptUrl?: string;
  ocrRawData?: any;
  createdAt: string;
  createdBy: string;
}
