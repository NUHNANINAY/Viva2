/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Site,
  ResidentUser,
  AdminUser,
  SecurityUser,
  CargoCarrier,
  CargoPackage,
  GuestNotification,
  OrderNotification,
  SuggestionOrComplaint,
  SiteAnnouncement,
} from '../types';

export const SITE_BLOCKS = ['A', 'B', 'C', 'E', 'F', 'G', 'H', 'I'] as const;

export const APARTMENT_NUMBERS = Array.from({ length: 15 }, (_, i) => i + 1);

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

export const INITIAL_SITES: Site[] = [
  {
    id: 'site-riva',
    name: 'Viva Riva Konakları',
    city: 'İstanbul',
    district: 'Beykoz',
    address: 'Çubuklu Mah. Boğaziçi Cad. No: 48, Beykoz / İstanbul',
    blocks: ['A', 'B', 'C', 'E', 'F', 'G', 'H', 'I'],
    maxApartmentsPerBlock: 15,
    managerName: 'Ahmet Karahan (Site Müdürü)',
    managerPhone: '+90 216 412 8800',
    securityPhone: '+90 216 412 8801',
    createdAt: '2025-01-15',
  },
  {
    id: 'site-panorama',
    name: 'Viva Panorama Rezidans',
    city: 'İstanbul',
    district: 'Beşiktaş / Levent',
    address: 'Büyükdere Cad. No: 122, Levent / İstanbul',
    blocks: ['A', 'B', 'C', 'E', 'F'],
    maxApartmentsPerBlock: 15,
    managerName: 'Selim Vardarlı',
    managerPhone: '+90 212 345 9000',
    securityPhone: '+90 212 345 9001',
    createdAt: '2025-03-20',
  },
  {
    id: 'site-park',
    name: 'Viva Park Evleri',
    city: 'Ankara',
    district: 'Çankaya / Çayyolu',
    address: 'Alacaatlı Mah. Park Cad. No: 14, Çankaya / Ankara',
    blocks: ['A', 'B', 'C', 'E', 'F', 'G'],
    maxApartmentsPerBlock: 15,
    managerName: 'Mert Aksoy',
    managerPhone: '+90 312 284 1200',
    securityPhone: '+90 312 284 1201',
    createdAt: '2025-04-10',
  },
];

export const DEMO_RESIDENT: ResidentUser = {
  name: 'Ufuk Gültekin',
  block: 'A',
  apartment: 5,
  phone: '+90 532 555 0123',
  email: 'ufgultekin@gmail.com',
  isDemo: true,
};

export const DEMO_ADMIN: AdminUser = {
  name: 'Ahmet Karahan',
  title: 'Yönetim Kurulu Başkanı / Genel Koordinatör',
  phone: '+90 533 555 9900',
  email: 'yonetim@vivasite.com',
  driveConnected: false,
  driveSyncDate: undefined,
};

export const DEMO_SECURITY: SecurityUser = {
  name: 'Nöbetçi Güvenlik Görevlisi',
  shift: '08:00 - 20:00 Gündüz Vardiyası',
  gateName: 'A Kapısı Ana Giriş Güvenlik',
  phone: '+90 216 412 8801',
};

// No fake cargo records - only real packages entered by security personnel
export const INITIAL_CARGO_LIST: CargoPackage[] = [];

// No dummy guests - only real notifications from residents
export const INITIAL_GUEST_LIST: GuestNotification[] = [];

export const INITIAL_ORDER_LIST: OrderNotification[] = [
  {
    id: 'ord-301',
    residentName: 'Ufuk Gültekin',
    residentBlock: 'A',
    residentApartment: 5,
    company: 'Yemeksepeti (Sushi Express)',
    deliveryLocation: 'direct_home',
    notificationPreference: 'call_on_arrival',
    courierNote: 'Zil çalışmıyor, geldiğinde kapıdan cepten aransın.',
    status: 'bekleniyor',
    createdAt: 'Bugün 14:00',
    isDemo: true,
  },
  {
    id: 'ord-302',
    residentName: 'Ufuk Gültekin',
    residentBlock: 'A',
    residentApartment: 5,
    company: 'Getir Su (19L Damacana)',
    deliveryLocation: 'leave_at_door',
    notificationPreference: 'whatsapp_message',
    courierNote: 'Kapının solundaki dolaba bırakılsın, boş damacana dışarıda.',
    status: 'teslim_edildi',
    createdAt: 'Dün 11:30',
    isDemo: true,
  },
  {
    id: 'ord-303',
    residentName: 'Tolga Pekcan',
    residentBlock: 'C',
    residentApartment: 4,
    company: 'Trendyol Hızlı Market',
    deliveryLocation: 'redirect_to_cafe',
    notificationPreference: 'both',
    courierNote: 'Rezidans Cafe barına teslim edilebilir.',
    status: 'bekleniyor',
    createdAt: 'Bugün 13:40',
    isDemo: true,
  },
];

export const INITIAL_SUGGESTIONS: SuggestionOrComplaint[] = [
  {
    id: 'sug-401',
    residentName: 'Ufuk Gültekin',
    residentBlock: 'A',
    residentApartment: 5,
    category: 'Otopark Düzeni',
    urgency: 'normal',
    title: 'Kapalı Otopark -2 Katı Aydınlatma Sensörü',
    message: 'A Blok otopark girişindeki hareket sensörü bazen geç algılıyor, teknik ekibin hassasiyet ayarını kontrol etmesini rica ederim.',
    status: 'inceleniyor',
    adminResponse: 'Teknik personelimiz Serdar Bey bugün saat 15:30 için programına aldı.',
    respondedAt: 'Bugün 11:45',
    createdAt: 'Dün 18:20',
    isDemo: true,
  },
  {
    id: 'sug-402',
    residentName: 'Ufuk Gültekin',
    residentBlock: 'A',
    residentApartment: 5,
    category: 'Peyzaj & Bahçe',
    urgency: 'normal',
    title: 'İç Avlu Süs Havuzu Çevresi Aydınlatması',
    message: 'Akşam saatlerinde süs havuzu çevresindeki fildişi zemin ışıkları çok şık duruyor, bahar aylarında sürenin 23:30\'a uzatılmasını öneririm.',
    status: 'yanitlandi',
    adminResponse: 'Harika bir öneri! Yönetim kurulu kararımızla zaman ayarı 23:45 olarak güncellendi.',
    respondedAt: '03.11.2026',
    createdAt: '02.11.2026',
    isDemo: true,
  },
  {
    id: 'sug-403',
    residentName: 'Banu Tan',
    residentBlock: 'F',
    residentApartment: 11,
    category: 'Teknik & Bakım',
    urgency: 'oncelikli',
    title: 'F Blok Sağ Asansör Çağrı Butonu',
    message: 'Zemin kattaki yukarı yön çağrı butonunun ışığı yanmıyor.',
    status: 'yeni',
    createdAt: 'Bugün 10:05',
    isDemo: true,
  },
];

export const INITIAL_ANNOUNCEMENTS: SiteAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'Viva Privé Cafe & Lounge Yakında Açılıyor',
    content: 'Rezidans sakinlerimize özel barista kahveleri, taze fırın ürünleri ve toplantı köşeleriyle Viva Lounge çok yakında hizmete giriyor.',
    date: '05 Kasım 2026',
    author: 'Yönetim Kurulu',
    category: 'Etkinlik',
  },
  {
    id: 'ann-2',
    title: 'Kapalı Otopark Zemin Temizliği ve Çizgi Yenileme',
    content: '10-12 Kasım tarihleri arasında sırayla -1 ve -2 otopark katlarımızda endüstriyel cila ve yönlendirme bakım çalışmaları yapılacaktır.',
    date: '02 Kasım 2026',
    author: 'Teknik Hizmetler',
    category: 'Bakım',
  },
];
