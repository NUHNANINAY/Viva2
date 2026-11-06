/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'resident' | 'admin' | 'security';

export interface Site {
  id: string;
  name: string;
  city: string;
  district: string;
  address: string;
  blocks: string[]; // ['A', 'B', 'C', 'E', 'F', 'G', 'H', 'I']
  maxApartmentsPerBlock: number; // 15
  managerName: string;
  managerPhone: string;
  securityPhone: string;
  createdAt: string;
  isCustom?: boolean;
}

export interface ResidentUser {
  name: string;
  block: string;
  apartment: number;
  phone: string;
  email: string;
  isDemo: boolean;
}

export interface AdminUser {
  name: string;
  title: string;
  phone: string;
  email: string;
  driveConnected: boolean;
  driveSyncDate?: string;
}

export interface SecurityGuardAccount {
  id: string;
  siteId: string;
  firstName: string;
  lastName: string;
  username: string;
  passwordHash: string; // SHA-256 hash
  shift?: string;
  gateName?: string;
  createdAt: string;
}

export interface SecurityUser {
  id?: string;
  name: string;
  username?: string;
  shift: string;
  gateName: string;
  phone: string;
}

export type ParkingOption = 
  | 'short_term_indoor'       // Kısa süreli kapalı otopark
  | 'resident_has_one_spot'   // Kapalı otoparkta bir kişilik yerim var
  | 'standard_outdoor'        // Açık misafir otoparkı
  | 'none';                   // Araçsız / Otopark gereksiz

export type ParkingType = 'acik_otopark' | 'kapali_otopark' | 'none';

export type IndoorEscortOption = 
  | 'escort_needed'            // Güvenlik refakat etsin, park yerimi göstersin
  | 'knows_spot_no_escort';    // Park yerimi biliyor, refakat gerekmiyor

export interface GuestNotification {
  id: string;
  siteId?: string;
  residentName: string;
  residentBlock: string;
  residentApartment: number;
  guestFirstName?: string;
  guestLastName?: string;
  guestName: string; // Ad Soyad birleşik
  hasVehicle: boolean;
  plateNumber?: string;
  vehicleBrandModel?: string;
  vehicleColor?: string;
  parkingType?: ParkingType;
  indoorEscortOption?: IndoorEscortOption;
  parkingOption?: ParkingOption; // geriye dönük uyumluluk
  registrationSource: 'resident' | 'security'; // Sakin veya Güvenlik tarafından oluşturuldu
  status: 'bekleniyor' | 'giris_yapti' | 'ayrildi' | 'iptal';
  createdAt: string;
  entryTime?: string;
  isSeenBySecurity?: boolean;
  note?: string;
  isDemo?: boolean;
  isImmediate?: boolean;
  scheduledDate?: string;
  scheduledTime?: string;
}

export type DeliveryLocation = 
  | 'direct_home'        // Doğrudan eve
  | 'leave_at_door'      // Kapıya bırak
  | 'redirect_to_cafe';  // Cafe'ye yönlendir

export type NotificationPreference = 
  | 'call_on_arrival'    // Geldiğinde aranmak istiyorum
  | 'whatsapp_message'   // WhatsApp mesajı istiyorum
  | 'both';              // Arama ve WhatsApp

export interface OrderNotification {
  id: string;
  residentName: string;
  residentBlock: string;
  residentApartment: number;
  company: string; // Yemeksepeti, Getir, Trendyol Yemek, Migros, Su/Tüp vb.
  deliveryLocation: DeliveryLocation;
  notificationPreference: NotificationPreference;
  courierNote?: string;
  status: 'bekleniyor' | 'guvenlikte' | 'teslim_edildi';
  createdAt: string;
  isDemo?: boolean;
}

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

export type CargoDeliveryOption = 
  | 'unspecified'        // Henüz yanıt verilmedi
  | 'send_to_apartment'  // Eve gönderilsin
  | 'hold_at_security';  // Güvenlikte emanet kalsın

export type CargoStatus = 
  | 'yanit_bekliyor'          // Yanıt bekliyor
  | 'eve_gonderilecek'        // Eve gönderilecek
  | 'guvenlikte_emanet'       // Güvenlikte emanet
  | 'kodlu_onay'              // Kodlu onay
  | 'kodsuz_onay'             // Kodsuz onay
  | 'fiziksel_teslim_alindi'  // Güvenlikte fiziksel teslim alındı
  | 'teslim_edildi'           // Sakinine teslim edildi
  | 'kurye_dagitimda';        // Geriye dönük uyumluluk (dağıtımda)

export interface CargoPackage {
  id: string;
  trackingCode: string;
  carrier: CargoCarrier;
  otherCarrierName?: string;
  block: string;
  apartment: number;
  recipientName?: string;
  deliveryOption: CargoDeliveryOption;
  status: CargoStatus;
  receivedAt: string;
  deliveredAt?: string;
  physicallyReceivedAt?: string;
  registeredBy: string; // Nöbetçi Güvenlik Görevlisi
  notes?: string;
  isDemo?: boolean;
  approvalType?: 'kodlu_onay' | 'kodsuz_onay';
  smsCodeEntered?: string;
  residentResponseAt?: string;
}

export type SuggestionCategory = 
  | 'Temizlik'
  | 'Teknik & Bakım'
  | 'Güvenlik'
  | 'Peyzaj & Bahçe'
  | 'Otopark Düzeni'
  | 'Genel Öneri';

export type UrgencyLevel = 'normal' | 'oncelikli' | 'acil';

export interface SuggestionOrComplaint {
  id: string;
  residentName: string;
  residentBlock: string;
  residentApartment: number;
  category: SuggestionCategory;
  urgency: UrgencyLevel;
  title: string;
  message: string;
  status: 'yeni' | 'inceleniyor' | 'yanitlandi' | 'cozuldu';
  adminResponse?: string;
  respondedAt?: string;
  createdAt: string;
  isDemo?: boolean;
}

export interface SiteAnnouncement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  category: 'Duyuru' | 'Bakım' | 'Etkinlik';
}
