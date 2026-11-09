/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'guest' | 'resident' | 'security' | 'admin';

export type DeliveryPreference = 'evdeyim' | 'cafedeyim' | 'kapiya_biraksinlar';

export type OrderWorkflowStatus = 'bekleniyor' | 'cevaplandi' | 'onaylandi';

export type NotificationChannelPreference = 'app' | 'whatsapp' | 'both';

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
}

export interface SecurityGuard {
  id: string;
  siteId: string;
  name: string;
  surname: string;
  username: string;
  password?: string;
  phone?: string;
  isActive: boolean;
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
  status: 'bekleniyor' | 'giris_yapti' | 'iptal'; // Sadece bekleniyor / giris_yapti / iptal
  entryTime?: string;
  plateNumber?: string; // İsteğe bağlı
  vehicleBrandModel?: string; // İsteğe bağlı Marka/model
  vehicleColor?: string; // İsteğe bağlı Renk
  notes?: string; // Güvenlik notu
  residentOption?: ResidentGuestOption; // 4 sakin seçeneğinden biri
  parkingEscort?: ParkingEscortPreference; // Kapalı otopark alt seçeneği
  pinCode?: string;
  createdAt: string;
  source: 'sakin' | 'guvenlik';
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
}

export interface ResidentUser {
  id: string;
  siteId: string;
  fullName: string;
  block: string;
  apartment: string;
  phone: string;
  email?: string;
  username?: string;
  notificationPreference?: NotificationChannelPreference;
}

export interface DriveBackupConfig {
  isEnabled: boolean;
  frequency: 'daily' | 'weekly' | 'manual';
  lastBackupDate?: string;
  targetFolderId?: string;
}
