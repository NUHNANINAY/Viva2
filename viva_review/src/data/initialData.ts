/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SiteInfo,
  ResidentUser,
  SiteResident,
  OrderNotification,
  GuestEntry,
  CargoItem,
  CargoCarrier,
  SuggestionItem,
  CafeItem,
  SecurityGuard,
  SiteAdmin,
} from '../types';

export const ALL_POSSIBLE_BLOCKS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'
] as const;

export const INITIAL_SITE_INFO: SiteInfo = {
  id: 'site-viva-1',
  name: 'VİVA REZİDANS & EVLERİ',
  address: 'Çamlıca Mah. Akasya Sok. No: 14',
  city: 'İstanbul',
  district: 'Üsküdar',
  blockCount: 8,
  apartmentCount: 120,
  securityCount: 6,
  adminName: 'Ahmet Karahan',
  adminEmail: 'yonetim@vivaresidence.com',
  adminPhone: '+90 532 100 20 30',
  securityPhone: '+90 532 999 88 77',
  securityPasswordHash: '1234', // default security pin
  isDemo: true,
  blocks: [
    { block: 'A', apartmentCount: 15 },
    { block: 'B', apartmentCount: 15 },
    { block: 'C', apartmentCount: 15 },
    { block: 'E', apartmentCount: 15 },
    { block: 'F', apartmentCount: 15 },
    { block: 'G', apartmentCount: 15 },
    { block: 'H', apartmentCount: 15 },
    { block: 'I', apartmentCount: 15 },
  ],
};

export const INITIAL_RESIDENT_USER: ResidentUser = {
  id: 'res-ersan-g12',
  siteId: 'site-viva-1',
  fullName: 'Ersan Özgür',
  block: 'G',
  apartment: '12',
  phone: '+90 533 123 45 67',
  email: 'ersan.ozgur@vivaresidence.com',
  username: 'ersan.ozgur',
  notificationPreference: 'app',
};

// Site blokları (Demo): A, B, C, E, F, G, H, I
export const SITE_BLOCKS = ['A', 'B', 'C', 'E', 'F', 'G', 'H', 'I'] as const;

// Kargo Firmaları: 12 Seçenek (Requirement 3)
export const CARGO_CARRIERS: CargoCarrier[] = [
  'Trendyol',
  'Hepsijet',
  'Sürat',
  'Yurtiçi',
  'Aras',
  'DHL',
  'Kolay Gelsin',
  'Bir Günde Kargo',
  'PTT Kargo',
  'PTT Zarf',
  'Kargo X',
  'Diğer',
];

// 6 Security Guards (Requirement 4-B)
export const INITIAL_SECURITY_GUARDS: SecurityGuard[] = [
  { id: 'sec-1', siteId: 'site-viva-1', name: 'Mehmet', surname: 'Demir', username: 'guvenlik1', phone: '+90 532 999 88 71', isActive: true },
  { id: 'sec-2', siteId: 'site-viva-1', name: 'Ali', surname: 'Öztürk', username: 'guvenlik2', phone: '+90 532 999 88 72', isActive: true },
  { id: 'sec-3', siteId: 'site-viva-1', name: 'Hasan', surname: 'Kaya', username: 'guvenlik3', phone: '+90 532 999 88 73', isActive: true },
  { id: 'sec-4', siteId: 'site-viva-1', name: 'Mustafa', surname: 'Yıldız', username: 'guvenlik4', phone: '+90 532 999 88 74', isActive: true },
  { id: 'sec-5', siteId: 'site-viva-1', name: 'Serkan', surname: 'Çelik', username: 'guvenlik5', phone: '+90 532 999 88 75', isActive: true },
  { id: 'sec-6', siteId: 'site-viva-1', name: 'Onur', surname: 'Aydın', username: 'guvenlik6', phone: '+90 532 999 88 76', isActive: true },
];

// Site Managers (Requirement 4-C)
export const INITIAL_ADMINS: SiteAdmin[] = [
  {
    id: 'adm-1',
    siteId: 'site-viva-1',
    name: 'Ahmet',
    surname: 'Karahan',
    email: 'yonetim@vivaresidence.com',
    phone: '+90 532 100 20 30',
    role: 'Bina Yöneticisi',
    permissions: ['all', 'security_manage', 'resident_manage', 'reports', 'settings'],
  },
  {
    id: 'adm-2',
    siteId: 'site-viva-1',
    name: 'Deniz',
    surname: 'Yılmaz',
    email: 'muhasebe@vivaresidence.com',
    phone: '+90 533 111 22 33',
    role: 'Muhasebe',
    permissions: ['reports', 'resident_view'],
  },
];

// Comprehensive site residents directory for blocks A, B, C, E, F, G, H, I (Apartments 1-15)
export const SITE_RESIDENTS: SiteResident[] = [
  // A Block
  { id: 'res-a1', siteId: 'site-viva-1', block: 'A', apartment: '1', fullName: 'Ahmet Karahan', phone: '+90 532 100 20 30', smsVerified: true },
  { id: 'res-a2', siteId: 'site-viva-1', block: 'A', apartment: '3', fullName: 'Selin Demirtaş', phone: '+90 533 222 33 44', smsVerified: true },
  { id: 'res-a3', siteId: 'site-viva-1', block: 'A', apartment: '5', fullName: 'Ufuk Gültekin', phone: '+90 535 777 88 99', smsVerified: true },
  { id: 'res-a4', siteId: 'site-viva-1', block: 'A', apartment: '8', fullName: 'Ceren Yılmaz', phone: '+90 542 333 44 55', smsVerified: true },
  { id: 'res-a5', siteId: 'site-viva-1', block: 'A', apartment: '14', fullName: 'Mert Aksoy', phone: '+90 531 444 55 66', smsVerified: true },

  // B Block
  { id: 'res-b1', siteId: 'site-viva-1', block: 'B', apartment: '2', fullName: 'Bülent Şahin', phone: '+90 532 555 66 77', smsVerified: true },
  { id: 'res-b2', siteId: 'site-viva-1', block: 'B', apartment: '7', fullName: 'Zeynep Koç', phone: '+90 533 666 77 88', smsVerified: true },
  { id: 'res-b3', siteId: 'site-viva-1', block: 'B', apartment: '11', fullName: 'Burak Tan', phone: '+90 535 888 99 00', smsVerified: true },
  { id: 'res-b4', siteId: 'site-viva-1', block: 'B', apartment: '15', fullName: 'İrem Çetin', phone: '+90 541 222 33 44', smsVerified: true },

  // C Block
  { id: 'res-c1', siteId: 'site-viva-1', block: 'C', apartment: '4', fullName: 'Canan Güneş', phone: '+90 532 777 11 22', smsVerified: true },
  { id: 'res-c2', siteId: 'site-viva-1', block: 'C', apartment: '9', fullName: 'Cem Yıldırım', phone: '+90 533 888 22 33', smsVerified: true },
  { id: 'res-c3', siteId: 'site-viva-1', block: 'C', apartment: '15', fullName: 'Cansu Öztürk', phone: '+90 536 999 33 44', smsVerified: true },

  // E Block
  { id: 'res-e1', siteId: 'site-viva-1', block: 'E', apartment: '3', fullName: 'Emre Kılıç', phone: '+90 532 444 66 88', smsVerified: true },
  { id: 'res-e2', siteId: 'site-viva-1', block: 'E', apartment: '8', fullName: 'Elif Doğan', phone: '+90 533 555 77 99', smsVerified: true },
  { id: 'res-e3', siteId: 'site-viva-1', block: 'E', apartment: '12', fullName: 'Ece Aydın', phone: '+90 535 666 88 00', smsVerified: true },

  // F Block
  { id: 'res-f1', siteId: 'site-viva-1', block: 'F', apartment: '5', fullName: 'Faruk Aslan', phone: '+90 532 111 44 77', smsVerified: true },
  { id: 'res-f2', siteId: 'site-viva-1', block: 'F', apartment: '10', fullName: 'Fatma Tekin', phone: '+90 533 222 55 88', smsVerified: true },
  { id: 'res-f3', siteId: 'site-viva-1', block: 'F', apartment: '14', fullName: 'Fırat Bilgin', phone: '+90 536 333 66 99', smsVerified: true },

  // G Block (Includes G12 - Ersan Özgür)
  { id: 'res-g1', siteId: 'site-viva-1', block: 'G', apartment: '2', fullName: 'Gamze Çelik', phone: '+90 532 999 11 33', smsVerified: true },
  { id: 'res-g2', siteId: 'site-viva-1', block: 'G', apartment: '7', fullName: 'Gökhan Polat', phone: '+90 533 888 33 55', smsVerified: true },
  { id: 'res-g3', siteId: 'site-viva-1', block: 'G', apartment: '12', fullName: 'Ersan Özgür', phone: '+90 533 123 45 67', smsVerified: true },
  { id: 'res-g4', siteId: 'site-viva-1', block: 'G', apartment: '15', fullName: 'Gülriz Akman', phone: '+90 535 777 44 66', smsVerified: true },

  // H Block
  { id: 'res-h1', siteId: 'site-viva-1', block: 'H', apartment: '4', fullName: 'Hakan Erdem', phone: '+90 532 333 55 77', smsVerified: true },
  { id: 'res-h2', siteId: 'site-viva-1', block: 'H', apartment: '9', fullName: 'Hülya Şen', phone: '+90 533 444 66 88', smsVerified: true },
  { id: 'res-h3', siteId: 'site-viva-1', block: 'H', apartment: '14', fullName: 'Halil Avcı', phone: '+90 536 555 77 99', smsVerified: true },

  // I Block
  { id: 'res-i1', siteId: 'site-viva-1', block: 'I', apartment: '1', fullName: 'İsmail Kara', phone: '+90 532 666 88 00', smsVerified: true },
  { id: 'res-i2', siteId: 'site-viva-1', block: 'I', apartment: '6', fullName: 'İpek Kurt', phone: '+90 533 777 99 11', smsVerified: true },
  { id: 'res-i3', siteId: 'site-viva-1', block: 'I', apartment: '10', fullName: 'İlker Bulut', phone: '+90 535 888 00 22', smsVerified: true },
];

// Clean initial lists: No fake mock records shown as real user data
export const INITIAL_ORDER_LIST: OrderNotification[] = [];

export const INITIAL_GUEST_LIST: GuestEntry[] = [];

export const INITIAL_CARGO_LIST: CargoItem[] = [];

export const INITIAL_SUGGESTION_LIST: SuggestionItem[] = [
  {
    id: 'sug-301',
    siteId: 'site-viva-1',
    title: 'G Blok Giriş Fotoselli Kapı Gecikmesi',
    category: 'Teknik & Bakım',
    urgency: 'normal',
    message: 'G blok girişindeki fotoselli kapı zaman zaman geç açılıyor, sensör temizliği veya ayarı gerekebilir.',
    residentName: 'Ersan Özgür',
    residentBlock: 'G',
    residentApartment: '12',
    createdAt: 'Dün 14:15',
    status: 'yanitlandi',
    adminResponse: 'Teknik ekibimize iş emri açıldı, gün içinde sensör kalibrasyonu yapılacaktır.',
    respondedAt: 'Dün 16:00',
  },
];

export const INITIAL_CAFE_ITEMS: CafeItem[] = [
  {
    id: 'cafe-1',
    name: 'Viva Signature Flat White',
    category: 'Kahve & Sıcak',
    price: 95,
    description: 'Çift shot espresso ve kadife dokulu süt',
    isAvailable: true,
  },
  {
    id: 'cafe-2',
    name: 'Iced Spanish Latte',
    category: 'Soğuk İçecek',
    price: 110,
    description: 'Yoğunlaştırılmış süt, espresso ve buz',
    isAvailable: true,
  },
  {
    id: 'cafe-3',
    name: 'Taze Kruvasan & Çilek Reçeli',
    category: 'Tatlı & Atıştırmalık',
    price: 130,
    description: 'Fransız tereyağlı çıtır kruvasan',
    isAvailable: true,
  },
  {
    id: 'cafe-4',
    name: 'Füme Somonlu Avokado Tost',
    category: 'Sandviç & Tost',
    price: 195,
    description: 'Ekşi mayalı ekmek, labne, taze avokado ve dereotu',
    isAvailable: true,
  },
];
