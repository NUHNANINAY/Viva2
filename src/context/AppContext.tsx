/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  SiteInfo,
  ResidentUser,
  OrderNotification,
  GuestEntry,
  CargoItem,
  CargoCarrier,
  ResidentCargoPreference,
  ResidentGuestOption,
  ParkingEscortPreference,
  SuggestionItem,
  DeliveryPreference,
  SuggestionCategory,
  UrgencyLevel,
  SecurityGuard,
  SecurityShift,
  SecurityDutyStatus,
  FacilityEntry,
  SiteAdmin,
  SiteResident,
  NotificationChannelPreference,
  StaffMember,
  StaffCategory,
  TimeRecord,
  DueItem,
  DuePaymentStatus,
  PayrollRecord,
  KeyHandoverItem,
  SiteAnnouncement,
  ResidentBusinessProfile,
  ExpenseRecord,
  UserTheme,
} from '../types';
import {
  INITIAL_SITE_INFO,
  INITIAL_RESIDENT_USER,
  INITIAL_ORDER_LIST,
  INITIAL_GUEST_LIST,
  INITIAL_CARGO_LIST,
  INITIAL_SUGGESTION_LIST,
  INITIAL_SECURITY_GUARDS,
  INITIAL_ADMINS,
  INITIAL_FACILITY_LIST,
  SITE_RESIDENTS,
  INITIAL_STAFF_MEMBERS,
  INITIAL_TIME_RECORDS,
  INITIAL_DUES,
  INITIAL_KEY_HANDOVERS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_BUSINESS_PROFILES,
  INITIAL_EXPENSES,
} from '../data/initialData';
import {
  playNotificationChime,
  startOrderAlertAlarm,
  stopOrderAlertAlarm,
  playSuccessChime,
  playGuestAlertChime,
  playCargoAlertChime,
  playMysticGuestAlertChime,
  startGuestAlertAlarm,
  stopGuestAlertAlarm,
} from '../utils/audio';
import {
  subscribeToAllSites,
  subscribeToSite,
  subscribeToResidents,
  subscribeToGuards,
  subscribeToAdmins,
  subscribeToGuests,
  subscribeToOrders,
  subscribeToCargos,
  subscribeToSuggestions,
  subscribeToFacilityEntries,
  subscribeToStaff,
  subscribeToTimeRecords,
  subscribeToDues,
  subscribeToPayrollRecords,
  syncSiteDoc,
  deleteSiteDoc,
  syncResidentDoc,
  removeResidentDoc,
  syncGuardDoc,
  syncAdminDoc,
  syncGuestDoc,
  syncOrderDoc,
  syncCargoDoc,
  syncSuggestionDoc,
  syncFacilityDoc,
  removeFacilityDoc,
  syncStaffDoc,
  removeStaffDoc,
  syncTimeRecordDoc,
  removeTimeRecordDoc,
  syncDueDoc,
  removeDueDoc,
  syncPayrollRecordDoc,
  migrateLocalSitesToFirestore,
  testConnection,
  syncUserProfile,
  ensureFirebaseAuth,
} from '../services/firebase';
import { hashString } from '../utils/crypto';

interface SecurityAlertState {
  order: OrderNotification;
  active: boolean;
}

interface SecurityCargoAlertState {
  cargo: CargoItem;
  active: boolean;
}

interface SecurityGuestAlertState {
  guest: GuestEntry;
  active: boolean;
}

interface AppContextType {
  // Navigation & Role
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  isMobilePreview: boolean;
  setIsMobilePreview: (val: boolean) => void;

  // Multi-Site Isolation & Switching
  sites: SiteInfo[];
  currentSiteId: string;
  siteInfo: SiteInfo;
  setSiteInfo: (info: SiteInfo) => void;
  switchSite: (siteId: string) => void;
  deleteSite: (siteId: string) => void;
  createAndRegisterSite: (data: {
    siteInfo: SiteInfo;
    managers: SiteAdmin[];
    securityGuards: SecurityGuard[];
    residents: SiteResident[];
  }) => void;

  // Cloud Synchronization Status (Cross-Device)
  cloudSyncStatus: 'connected' | 'connecting' | 'offline' | 'error';
  cloudSyncError: string | null;
  refreshCloudSites: () => Promise<void>;

  // Active Resident User
  residentUser: ResidentUser;
  setResidentUser: (user: ResidentUser) => void;
  updateResidentNotificationPreference: (pref: NotificationChannelPreference) => void;

  // Directory for active site
  siteResidents: SiteResident[];
  addResidentToSite: (res: Omit<SiteResident, 'id' | 'siteId'>) => SiteResident;
  updateResident: (id: string, updated: Partial<SiteResident>) => void;
  deleteResident: (id: string) => void;

  // Guards for active site & Security Management
  siteGuards: SecurityGuard[];
  addSecurityGuard: (g: Omit<SecurityGuard, 'id' | 'siteId'>, initialPin?: string) => Promise<SecurityGuard>;
  updateSecurityGuard: (id: string, updated: Partial<SecurityGuard>) => void;
  deleteSecurityGuard: (id: string) => void;
  toggleGuardActiveStatus: (id: string) => void;
  resetSecurityGuardPin: (id: string, newPin: string) => Promise<boolean>;
  activeGuard: SecurityGuard | null;
  setActiveGuard: (guard: SecurityGuard | null) => void;

  // Managers for active site
  siteAdmins: SiteAdmin[];
  addSiteAdmin: (adm: Omit<SiteAdmin, 'id' | 'siteId'>) => void;
  updateSiteAdmin: (id: string, updated: Partial<SiteAdmin>) => void;

  // Orders Module (UNCHANGED as per protection rules)
  orderList: OrderNotification[];
  createSecurityOrder: (order: {
    company: string;
    block: string;
    apartment: string;
    residentName: string;
    courierName?: string;
  }) => OrderNotification;
  respondToOrderDeliveryPreference: (orderId: string, preference: DeliveryPreference) => void;
  confirmSecurityOrderApproval: (orderId: string) => void;
  activeResidentOrderPrompt: OrderNotification | null;
  dismissResidentOrderPrompt: () => void;
  securityOrderAlert: SecurityAlertState | null;
  dismissSecurityOrderAlert: () => void;

  // Guest Module
  guestList: GuestEntry[];
  addResidentGuest: (data: {
    guestType: 'yaya' | 'aracli';
    titlePrefix?: 'Bey' | 'Hanım' | '';
    firstName: string;
    lastName: string;
    block: string;
    apartment: string;
    residentName: string;
    expectedDate: string;
    expectedTime?: string;
    isImmediate?: boolean;
    plateNumber?: string;
    vehicleBrandModel?: string;
    vehicleColor?: string;
    notes?: string;
    residentOption: ResidentGuestOption;
    parkingEscort?: ParkingEscortPreference;
  }) => GuestEntry;
  updateResidentGuest: (id: string, updated: Partial<GuestEntry>) => void;
  cancelResidentGuest: (id: string) => void;
  addSecurityGuest: (data: {
    guestType: 'yaya' | 'aracli';
    firstName?: string;
    lastName?: string;
    block: string;
    apartment: string;
    residentName: string;
    plateNumber?: string;
    vehicleBrandModel?: string;
    vehicleColor?: string;
    notes?: string;
    isQuickEntry?: boolean;
  }) => { success: boolean; error?: string; guest?: GuestEntry };
  checkInGuest: (id: string) => void;
  checkOutGuest: (id: string, guardName?: string) => void;
  addGuest: (guest: Omit<GuestEntry, 'id' | 'createdAt' | 'status' | 'siteId'>) => GuestEntry;
  updateGuestStatus: (id: string, status: GuestEntry['status']) => void;
  respondToGuestArrival: (guestId: string, response: 'EVDEYIM' | 'CAFEDEYIM' | 'YOKUM') => void;
  securityGuestAlert: SecurityGuestAlertState | null;
  dismissSecurityGuestAlert: () => void;

  // Cargo Module
  cargoList: CargoItem[];
  addBatchCargo: (
    items: {
      carrier: CargoCarrier | string;
      block: string;
      apartment: string;
      recipientName: string;
      pieceCount: number;
      notes?: string;
      trackingCode?: string;
    }[]
  ) => CargoItem[];
  addCargo: (cargo: Omit<CargoItem, 'id' | 'receivedAt' | 'createdAt' | 'notificationStatus' | 'deliveryStatus' | 'siteId'>) => CargoItem;
  respondToCargoPreference: (cargoId: string, preference: ResidentCargoPreference, smsCode?: string) => void;
  confirmSecurityCargoSeen: (cargoId: string) => void;
  deliverCargo: (cargoId: string) => void;
  activeResidentCargoPrompt: CargoItem | null;
  dismissResidentCargoPrompt: () => void;
  securityCargoAlert: SecurityCargoAlertState | null;
  dismissSecurityCargoAlert: () => void;

  // Suggestions Module
  suggestionList: SuggestionItem[];
  addSuggestion: (sug: {
    title: string;
    category: SuggestionCategory;
    urgency: UrgencyLevel;
    message: string;
  }) => void;
  respondToSuggestion: (id: string, response: string) => void;

  // Facility / Vendor Module (TESİS / TEDARİKÇİ)
  facilityList: FacilityEntry[];
  addFacilityEntry: (entry: Omit<FacilityEntry, 'id' | 'siteId' | 'createdAt' | 'status' | 'entryTime'> & { entryTime?: string }) => FacilityEntry;
  checkOutFacilityEntry: (facilityId: string) => void;

  // Central Staff Management (Requirement 2)
  staffList: StaffMember[];
  addStaffMember: (data: Omit<StaffMember, 'id' | 'siteId'>, initialPin?: string) => Promise<StaffMember>;
  updateStaffMember: (id: string, updated: Partial<StaffMember>) => void;
  deleteStaffMember: (id: string) => void;
  toggleStaffActiveStatus: (id: string) => void;
  resetStaffPin: (id: string, newPin: string) => Promise<boolean>;

  // Staff Time Attendance / Puantaj (Requirement 3)
  timeRecords: TimeRecord[];
  clockInStaff: (staffId: string, note?: string) => Promise<TimeRecord>;
  clockOutStaff: (staffId: string, note?: string) => Promise<TimeRecord | null>;
  adminAdjustTimeRecord: (recordId: string, updates: Partial<TimeRecord>, reason: string) => void;

  // Payroll / Bordro Calculation (Requirement 3)
  payrollRecords: PayrollRecord[];
  approvePayrollRecord: (recordId: string) => void;
  calculateStaffPayroll: (staffId: string, month: string) => PayrollRecord;

  // Resident Dues & Debt (Requirement 4)
  duesList: DueItem[];
  addDueItem: (item: Omit<DueItem, 'id' | 'siteId'>) => DueItem;
  updateDuePayment: (dueId: string, paidAmount: number, paymentMethod?: DueItem['paymentMethod'], source?: 'bank' | 'admin_manual') => void;

  // Floating Toast Alert & Loud Chime Testing (Requirement 6)
  floatingAlert: { id: string; title: string; message: string; type: 'order' | 'guest' | 'cargo' | 'info'; actionLabel?: string; onAction?: () => void } | null;
  showFloatingAlert: (alert: { id?: string; title: string; message: string; type?: 'order' | 'guest' | 'cargo' | 'info'; actionLabel?: string; onAction?: () => void }) => void;
  dismissFloatingAlert: () => void;
  testNotificationSystem: () => void;

  // Theme Customization (Requirement 19)
  theme: UserTheme;
  setTheme: (t: UserTheme) => void;

  // Anahtar & Zimmet Takibi (Requirement 9)
  keyHandovers: KeyHandoverItem[];
  addKeyHandover: (k: Omit<KeyHandoverItem, 'id' | 'siteId'>) => KeyHandoverItem;
  returnKeyHandover: (id: string, returnedTo?: string) => void;

  // Duyuru & Bildirim Sistemi (Requirement 12)
  announcements: SiteAnnouncement[];
  addAnnouncement: (a: Omit<SiteAnnouncement, 'id' | 'siteId' | 'createdAt' | 'readByUids'>) => SiteAnnouncement;
  markAnnouncementAsRead: (id: string, uid: string) => void;

  // Sakinler Arası İş Ağı ve Ticari İş Birliği (Requirement 17)
  businessProfiles: ResidentBusinessProfile[];
  saveBusinessProfile: (p: Omit<ResidentBusinessProfile, 'id' | 'siteId' | 'updatedAt'>) => void;

  // Gelir-Gider & Fatura Takibi (Requirement 11)
  expenses: ExpenseRecord[];
  addExpense: (e: Omit<ExpenseRecord, 'id' | 'siteId' | 'createdAt'>) => ExpenseRecord;
  updateExpensePayment: (id: string, paidDate: string, method?: ExpenseRecord['paymentMethod']) => void;

  // Modüler Site Ayarları & Entegrasyonlar (Requirement 4, 13, 14, 15, 16)
  updateSiteModules: (siteId: string, modules: NonNullable<SiteInfo['modules']>) => void;
  updateSiteWhatsapp: (siteId: string, config: NonNullable<SiteInfo['whatsappConfig']>) => void;
  updateSiteGeofence: (siteId: string, config: NonNullable<SiteInfo['geofenceConfig']>) => void;
  updateSiteHardware: (siteId: string, config: NonNullable<SiteInfo['hardwareConfig']>) => void;

  // Modals & Navigation
  showAdModal: boolean;
  setShowAdModal: (val: boolean) => void;
  showDriveSetupModal: boolean;
  setShowDriveSetupModal: (val: boolean) => void;
  showNewSiteModal: boolean;
  setShowNewSiteModal: (val: boolean) => void;
  securityIsLoggedIn: boolean;
  setSecurityIsLoggedIn: (val: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('resident');
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [securityIsLoggedIn, setSecurityIsLoggedIn] = useState(true);

  // Cloud Synchronization state
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'connected' | 'connecting' | 'offline' | 'error'>('connecting');
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);

  // 1. Registered Sites List
  const [sites, setSites] = useState<SiteInfo[]>(() => {
    try {
      const saved = localStorage.getItem('viva_sites_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Sites storage read failed', e);
    }
    return [INITIAL_SITE_INFO];
  });

  const [currentSiteId, setCurrentSiteId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('viva_current_site_id_v3');
      if (saved) return saved;
    } catch (e) {
      console.warn('Current site id read failed', e);
    }
    return INITIAL_SITE_INFO.id;
  });

  // Current Site Info
  const activeSite = sites.find((s) => s.id === currentSiteId) || sites[0] || INITIAL_SITE_INFO;

  const setSiteInfo = (updated: SiteInfo) => {
    setSites((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  };

  // 2. Directory & Users across all sites
  const [allResidents, setAllResidents] = useState<SiteResident[]>(() => {
    try {
      const saved = localStorage.getItem('viva_residents_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Residents storage read failed', e);
    }
    return SITE_RESIDENTS;
  });

  const [allSecurityGuards, setAllSecurityGuards] = useState<SecurityGuard[]>(() => {
    try {
      const saved = localStorage.getItem('viva_guards_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Guards storage read failed', e);
    }
    return INITIAL_SECURITY_GUARDS;
  });

  const [allAdmins, setAllAdmins] = useState<SiteAdmin[]>(() => {
    try {
      const saved = localStorage.getItem('viva_admins_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Admins storage read failed', e);
    }
    return INITIAL_ADMINS;
  });

  // Active Resident User
  const [residentUser, setResidentUser] = useState<ResidentUser>(() => {
    try {
      const saved = localStorage.getItem('viva_active_resident_v3');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Active resident read failed', e);
    }
    return INITIAL_RESIDENT_USER;
  });

  // 3. Isolated Transaction Lists
  const [allOrders, setAllOrders] = useState<OrderNotification[]>(() => {
    try {
      const saved = localStorage.getItem('viva_orders_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Orders storage read failed', e);
    }
    return INITIAL_ORDER_LIST;
  });

  const [allGuests, setAllGuests] = useState<GuestEntry[]>(() => {
    try {
      const saved = localStorage.getItem('viva_guests_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Guests storage read failed', e);
    }
    return INITIAL_GUEST_LIST;
  });

  const [allCargo, setAllCargo] = useState<CargoItem[]>(() => {
    try {
      const saved = localStorage.getItem('viva_cargo_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Cargo storage read failed', e);
    }
    return INITIAL_CARGO_LIST;
  });

  const [allSuggestions, setAllSuggestions] = useState<SuggestionItem[]>(() => {
    try {
      const saved = localStorage.getItem('viva_suggestions_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Suggestions storage read failed', e);
    }
    return INITIAL_SUGGESTION_LIST;
  });

  const [allFacilities, setAllFacilities] = useState<FacilityEntry[]>(() => {
    try {
      const saved = localStorage.getItem('viva_facilities_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Facilities storage read failed', e);
    }
    return INITIAL_FACILITY_LIST;
  });

  // Central Staff Management (Requirement 2)
  const [allStaff, setAllStaff] = useState<StaffMember[]>(() => {
    try {
      const saved = localStorage.getItem('viva_staff_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Staff storage read failed', e);
    }
    return INITIAL_STAFF_MEMBERS;
  });

  // Time Attendance / Puantaj (Requirement 3)
  const [allTimeRecords, setAllTimeRecords] = useState<TimeRecord[]>(() => {
    try {
      const saved = localStorage.getItem('viva_timerecords_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Time records storage read failed', e);
    }
    return INITIAL_TIME_RECORDS;
  });

  // Managerial Payroll Records (Requirement 3)
  const [allPayroll, setAllPayroll] = useState<PayrollRecord[]>(() => {
    try {
      const saved = localStorage.getItem('viva_payroll_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Payroll storage read failed', e);
    }
    return [];
  });

  // Resident Dues & Debt (Requirement 4)
  const [allDues, setAllDues] = useState<DueItem[]>(() => {
    try {
      const saved = localStorage.getItem('viva_dues_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Dues storage read failed', e);
    }
    return INITIAL_DUES;
  });

  // Theme Customization (Requirement 19)
  const [theme, setThemeState] = useState<UserTheme>(() => {
    try {
      const saved = localStorage.getItem('viva_user_theme');
      if (saved === 'fuchsia' || saved === 'rose' || saved === 'pearl') return saved;
    } catch {}
    return 'sage';
  });

  const setTheme = (t: UserTheme) => {
    setThemeState(t);
    try {
      localStorage.setItem('viva_user_theme', t);
      document.documentElement.setAttribute('data-theme', t);
    } catch {}
  };

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
    } catch {}
  }, [theme]);

  // Anahtar & Zimmet Takibi (Requirement 9)
  const [allKeyHandovers, setAllKeyHandovers] = useState<KeyHandoverItem[]>(() => {
    try {
      const saved = localStorage.getItem('viva_keys_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Keys storage read failed', e);
    }
    return INITIAL_KEY_HANDOVERS;
  });

  // Duyuru & Bildirim Sistemi (Requirement 12)
  const [allAnnouncements, setAllAnnouncements] = useState<SiteAnnouncement[]>(() => {
    try {
      const saved = localStorage.getItem('viva_announcements_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Announcements storage read failed', e);
    }
    return INITIAL_ANNOUNCEMENTS;
  });

  // Sakinler Arası İş Ağı ve Ticari İş Birliği (Requirement 17)
  const [allBusinessProfiles, setAllBusinessProfiles] = useState<ResidentBusinessProfile[]>(() => {
    try {
      const saved = localStorage.getItem('viva_business_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Business storage read failed', e);
    }
    return INITIAL_BUSINESS_PROFILES;
  });

  // Gelir-Gider & Fatura Takibi (Requirement 11)
  const [allExpenses, setAllExpenses] = useState<ExpenseRecord[]>(() => {
    try {
      const saved = localStorage.getItem('viva_expenses_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Expenses storage read failed', e);
    }
    return INITIAL_EXPENSES;
  });

  // Floating Toast Alert & Loud Chime (Requirement 6)
  const [floatingAlert, setFloatingAlert] = useState<{
    id: string;
    title: string;
    message: string;
    type: 'order' | 'guest' | 'cargo' | 'info';
    actionLabel?: string;
    onAction?: () => void;
  } | null>(null);

  const [activeGuard, setActiveGuard] = useState<SecurityGuard | null>(() => {
    try {
      const saved = localStorage.getItem('viva_active_guard_v3');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return null;
  });

  // Alerts
  const [activeResidentOrderPrompt, setActiveResidentOrderPrompt] = useState<OrderNotification | null>(null);
  const [securityOrderAlert, setSecurityOrderAlert] = useState<SecurityAlertState | null>(null);
  const [securityGuestAlert, setSecurityGuestAlert] = useState<SecurityGuestAlertState | null>(null);
  const [activeResidentCargoPrompt, setActiveResidentCargoPrompt] = useState<CargoItem | null>(null);
  const [securityCargoAlert, setSecurityCargoAlert] = useState<SecurityCargoAlertState | null>(null);

  // Modals
  const [showAdModal, setShowAdModal] = useState(false);
  const [showDriveSetupModal, setShowDriveSetupModal] = useState(false);
  const [showNewSiteModal, setShowNewSiteModal] = useState(false);

  // Filtered lists for the active site
  const siteResidents = allResidents.filter((r) => r.siteId === currentSiteId);
  const staffList = allStaff.filter((s) => s.siteId === currentSiteId && !s.isArchived);
  const siteGuards = (allSecurityGuards.length > 0
    ? allSecurityGuards.filter((g) => g.siteId === currentSiteId && !g.isArchived)
    : staffList.filter((s) => s.category === 'Güvenlik' || !s.category)) as SecurityGuard[];
  const siteAdmins = allAdmins.filter((a) => a.siteId === currentSiteId);
  const orderList = allOrders.filter((o) => o.siteId === currentSiteId);
  const guestList = allGuests.filter((g) => g.siteId === currentSiteId);
  const cargoList = allCargo.filter((c) => c.siteId === currentSiteId);
  const suggestionList = allSuggestions.filter((s) => s.siteId === currentSiteId);
  const facilityList = allFacilities.filter((f) => f.siteId === currentSiteId);
  const duesList = allDues.filter((d) => d.siteId === currentSiteId);
  const timeRecords = allTimeRecords.filter((t) => t.siteId === currentSiteId);
  const payrollRecords = allPayroll.filter((p) => p.siteId === currentSiteId);
  const keyHandovers = allKeyHandovers.filter((k) => k.siteId === currentSiteId);
  const announcements = allAnnouncements.filter((a) => a.siteId === currentSiteId);
  const businessProfiles = allBusinessProfiles.filter((b) => b.siteId === currentSiteId);
  const expenses = allExpenses.filter((e) => e.siteId === currentSiteId);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('viva_sites_v3', JSON.stringify(sites));
      localStorage.setItem('viva_current_site_id_v3', currentSiteId);
      localStorage.setItem('viva_residents_v3', JSON.stringify(allResidents));
      localStorage.setItem('viva_guards_v3', JSON.stringify(allSecurityGuards));
      localStorage.setItem('viva_admins_v3', JSON.stringify(allAdmins));
      localStorage.setItem('viva_orders_v3', JSON.stringify(allOrders));
      localStorage.setItem('viva_guests_v3', JSON.stringify(allGuests));
      localStorage.setItem('viva_cargo_v3', JSON.stringify(allCargo));
      localStorage.setItem('viva_suggestions_v3', JSON.stringify(allSuggestions));
      localStorage.setItem('viva_facilities_v3', JSON.stringify(allFacilities));
      localStorage.setItem('viva_staff_v3', JSON.stringify(allStaff));
      localStorage.setItem('viva_timerecords_v3', JSON.stringify(allTimeRecords));
      localStorage.setItem('viva_payroll_v3', JSON.stringify(allPayroll));
      localStorage.setItem('viva_dues_v3', JSON.stringify(allDues));
      localStorage.setItem('viva_keys_v3', JSON.stringify(allKeyHandovers));
      localStorage.setItem('viva_announcements_v3', JSON.stringify(allAnnouncements));
      localStorage.setItem('viva_business_v3', JSON.stringify(allBusinessProfiles));
      localStorage.setItem('viva_expenses_v3', JSON.stringify(allExpenses));
      localStorage.setItem('viva_active_resident_v3', JSON.stringify(residentUser));
      if (activeGuard) {
        localStorage.setItem('viva_active_guard_v3', JSON.stringify(activeGuard));
      } else {
        localStorage.removeItem('viva_active_guard_v3');
      }
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [
    sites,
    currentSiteId,
    allResidents,
    allSecurityGuards,
    allAdmins,
    allOrders,
    allGuests,
    allCargo,
    allSuggestions,
    allFacilities,
    allStaff,
    allTimeRecords,
    allPayroll,
    allDues,
    allKeyHandovers,
    allAnnouncements,
    allBusinessProfiles,
    allExpenses,
    residentUser,
    activeGuard,
  ]);

  // 0. Global real-time listener for ALL sites across devices (Phone A & Phone B sync)
  useEffect(() => {
    let isSubscribed = true;

    // Test live Firestore server connection
    testConnection().then((res) => {
      if (!isSubscribed) return;
      if (res.connected) {
        setCloudSyncStatus('connected');
        setCloudSyncError(null);
      } else {
        setCloudSyncStatus('error');
        setCloudSyncError(res.error || 'Bulut bağlantısı sağlanamadı');
      }
    });

    // Real-time listener for all registered sites in Firestore
    const unsubAllSites = subscribeToAllSites((remoteSites) => {
      if (!isSubscribed) return;
      setCloudSyncStatus('connected');
      setCloudSyncError(null);
      if (Array.isArray(remoteSites) && remoteSites.length > 0) {
        setSites((prev) => {
          const map = new Map<string, SiteInfo>();
          // Preserve initial demo site
          map.set(INITIAL_SITE_INFO.id, INITIAL_SITE_INFO);
          // Keep existing local sites
          prev.forEach((s) => map.set(s.id, s));
          // Overlay remote sites from Firestore
          remoteSites.forEach((s) => {
            if (s && s.id) {
              map.set(s.id, s as SiteInfo);
            }
          });
          return Array.from(map.values());
        });
      }
    });

    // Migrate any cached local sites (e.g., created on Phone A previously) to Firestore
    migrateLocalSitesToFirestore(sites, allResidents, allSecurityGuards, allAdmins).catch((err) => {
      console.warn('Initial site migration notice:', err);
    });

    return () => {
      isSubscribed = false;
      unsubAllSites();
    };
  }, []);

  // Real-time Firestore Subscriptions for active site across all devices
  useEffect(() => {
    // 1. Subscribe to active site doc
    const unsubSite = subscribeToSite(currentSiteId, (remoteSite) => {
      if (remoteSite && remoteSite.name) {
        setSites((prev) => {
          const idx = prev.findIndex((s) => s.id === currentSiteId);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...remoteSite };
            return next;
          }
          return [...prev, remoteSite];
        });
      }
    });

    // 2. Subscribe to residents
    const unsubResidents = subscribeToResidents(currentSiteId, (remoteResidents) => {
      if (remoteResidents && remoteResidents.length > 0) {
        setAllResidents((prev) => {
          const others = prev.filter((r) => r.siteId !== currentSiteId);
          return [...others, ...remoteResidents];
        });
      }
    });

    // 3. Subscribe to guards
    const unsubGuards = subscribeToGuards(currentSiteId, (remoteGuards) => {
      if (remoteGuards && remoteGuards.length > 0) {
        setAllSecurityGuards((prev) => {
          const others = prev.filter((g) => g.siteId !== currentSiteId);
          return [...others, ...remoteGuards];
        });
      }
    });

    // 4. Subscribe to admins
    const unsubAdmins = subscribeToAdmins(currentSiteId, (remoteAdmins) => {
      if (remoteAdmins && remoteAdmins.length > 0) {
        setAllAdmins((prev) => {
          const others = prev.filter((a) => a.siteId !== currentSiteId);
          return [...others, ...remoteAdmins];
        });
      }
    });

    // 5. Subscribe to guests
    const unsubGuests = subscribeToGuests(currentSiteId, (remoteGuests) => {
      if (remoteGuests) {
        setAllGuests((prev) => {
          const others = prev.filter((g) => g.siteId !== currentSiteId);
          return [...others, ...remoteGuests];
        });
      }
    });

    // 6. Subscribe to orders
    const unsubOrders = subscribeToOrders(currentSiteId, (remoteOrders) => {
      if (remoteOrders) {
        setAllOrders((prev) => {
          const others = prev.filter((o) => o.siteId !== currentSiteId);
          return [...others, ...remoteOrders];
        });
      }
    });

    // 7. Subscribe to cargos
    const unsubCargos = subscribeToCargos(currentSiteId, (remoteCargos) => {
      if (remoteCargos) {
        setAllCargo((prev) => {
          const others = prev.filter((c) => c.siteId !== currentSiteId);
          return [...others, ...remoteCargos];
        });
      }
    });

    // 8. Subscribe to suggestions
    const unsubSuggestions = subscribeToSuggestions(currentSiteId, (remoteSuggestions) => {
      if (remoteSuggestions) {
        setAllSuggestions((prev) => {
          const others = prev.filter((s) => s.siteId !== currentSiteId);
          return [...others, ...remoteSuggestions];
        });
      }
    });

    // 9. Subscribe to facility / vendor entries (TESİS / TEDARİKÇİ)
    const unsubFacilities = subscribeToFacilityEntries(currentSiteId, (remoteFacilities) => {
      if (remoteFacilities) {
        setAllFacilities((prev) => {
          const others = prev.filter((f) => f.siteId !== currentSiteId);
          return [...others, ...remoteFacilities];
        });
      }
    });

    // 10. Subscribe to central staff
    const unsubStaff = subscribeToStaff(currentSiteId, (remoteStaff) => {
      if (remoteStaff && remoteStaff.length > 0) {
        setAllStaff((prev) => {
          const others = prev.filter((s) => s.siteId !== currentSiteId);
          return [...others, ...remoteStaff];
        });
      }
    });

    // 11. Subscribe to time attendance / puantaj (Security & Admin only)
    let unsubTime = () => {};
    if (currentRole === 'security' || currentRole === 'admin') {
      unsubTime = subscribeToTimeRecords(currentSiteId, (remoteRecords) => {
        if (remoteRecords) {
          setAllTimeRecords((prev) => {
            const others = prev.filter((r) => r.siteId !== currentSiteId);
            return [...others, ...remoteRecords];
          });
        }
      });
    }

    // 12. Subscribe to resident dues & debts (Unit-filtered for resident; all for admin)
    let unsubDues = () => {};
    if (currentRole === 'admin') {
      unsubDues = subscribeToDues(currentSiteId, (remoteDues) => {
        if (remoteDues && remoteDues.length > 0) {
          setAllDues((prev) => {
            const others = prev.filter((d) => d.siteId !== currentSiteId);
            return [...others, ...remoteDues];
          });
        }
      });
    } else if (currentRole === 'resident') {
      unsubDues = subscribeToDues(
        currentSiteId,
        (remoteDues) => {
          if (remoteDues) {
            setAllDues((prev) => {
              const others = prev.filter(
                (d) =>
                  d.siteId !== currentSiteId ||
                  d.block !== residentUser.block ||
                  d.apartment !== residentUser.apartment
              );
              return [...others, ...remoteDues];
            });
          }
        },
        { block: residentUser.block, apartment: residentUser.apartment }
      );
    }

    // 13. Subscribe to managerial payroll (Admin only!)
    let unsubPayroll = () => {};
    if (currentRole === 'admin') {
      unsubPayroll = subscribeToPayrollRecords(currentSiteId, (remotePayroll) => {
        if (remotePayroll) {
          setAllPayroll((prev) => {
            const others = prev.filter((p) => p.siteId !== currentSiteId);
            return [...others, ...remotePayroll];
          });
        }
      });
    }

    return () => {
      unsubSite();
      unsubResidents();
      unsubGuards();
      unsubAdmins();
      unsubGuests();
      unsubOrders();
      unsubCargos();
      unsubSuggestions();
      unsubFacilities();
      unsubStaff();
      unsubTime();
      unsubDues();
      unsubPayroll();
    };
  }, [currentSiteId, currentRole, residentUser.block, residentUser.apartment]);

  // Synchronize Firebase Auth session claims to /users/{uid} whenever role or user changes
  useEffect(() => {
    syncUserProfile({
      siteId: currentSiteId,
      role: currentRole,
      block: currentRole === 'resident' ? residentUser.block : '',
      apartment: currentRole === 'resident' ? residentUser.apartment : '',
      staffId: currentRole === 'security' ? activeGuard?.id : '',
      name:
        currentRole === 'resident'
          ? residentUser.fullName
          : currentRole === 'security'
          ? activeGuard?.name || 'Nizamiye Güvenlik'
          : currentRole === 'admin'
          ? activeSite?.adminName || 'Site Yöneticisi'
          : 'Misafir',
      isActive: currentRole === 'security' ? activeGuard?.isActive !== false : true,
    }).catch((err) => {
      console.warn('User profile sync notice:', err);
    });
  }, [
    currentRole,
    currentSiteId,
    residentUser.block,
    residentUser.apartment,
    residentUser.fullName,
    activeGuard,
    activeSite?.adminName,
  ]);

  // Switch between registered sites
  const switchSite = (siteId: string) => {
    const targetSite = sites.find((s) => s.id === siteId);
    if (!targetSite) return;
    setCurrentSiteId(siteId);

    // Update active resident user to a resident from the switched site
    const matchingResidents = allResidents.filter((r) => r.siteId === siteId);
    if (matchingResidents.length > 0) {
      const first = matchingResidents[0];
      setResidentUser({
        id: first.id,
        siteId: first.siteId,
        fullName: first.fullName,
        block: first.block,
        apartment: first.apartment,
        phone: first.phone || '+90 532 000 00 00',
        username: first.username,
        notificationPreference: first.notificationPreference || 'app',
      });
    } else {
      setResidentUser({
        id: `res-guest-${siteId}`,
        siteId,
        fullName: 'Yeni Sakin',
        block: targetSite.blocks?.[0]?.block || 'A',
        apartment: '1',
        phone: '+90 530 000 00 00',
        notificationPreference: 'app',
      });
    }

    // Dismiss any active prompts from previous site
    setActiveResidentOrderPrompt(null);
    setSecurityOrderAlert(null);
    setSecurityGuestAlert(null);
    setActiveResidentCargoPrompt(null);
    setSecurityCargoAlert(null);
    playSuccessChime();
  };

  // Create new site cleanly with complete isolation
  const createAndRegisterSite = (data: {
    siteInfo: SiteInfo;
    managers: SiteAdmin[];
    securityGuards: SecurityGuard[];
    residents: SiteResident[];
  }) => {
    const newSiteId = data.siteInfo.id;

    // Attach siteId to all sub-entities
    const readyManagers = data.managers.map((m) => ({ ...m, siteId: newSiteId }));
    const readyGuards = data.securityGuards.map((g) => ({ ...g, siteId: newSiteId }));
    const readyResidents = data.residents.map((r) => ({ ...r, siteId: newSiteId }));

    // Update sites state
    setSites((prev) => {
      if (prev.some((s) => s.id === newSiteId)) return prev;
      return [...prev, data.siteInfo];
    });
    setCurrentSiteId(newSiteId);

    // Add guards, managers and residents
    setAllAdmins((prev) => [...prev, ...readyManagers]);
    setAllSecurityGuards((prev) => [...prev, ...readyGuards]);
    setAllResidents((prev) => [...prev, ...readyResidents]);

    // Real-time Cloud Write to Firestore so all connected devices receive it instantly
    syncSiteDoc(newSiteId, data.siteInfo);
    for (const m of readyManagers) {
      syncAdminDoc(newSiteId, m.id, m);
    }
    for (const g of readyGuards) {
      syncGuardDoc(newSiteId, g.id, g);
    }
    for (const r of readyResidents) {
      syncResidentDoc(newSiteId, r.id, r);
    }

    // Set active resident for this newly created site
    if (readyResidents.length > 0) {
      const first = readyResidents[0];
      setResidentUser({
        id: first.id,
        siteId: newSiteId,
        fullName: first.fullName,
        block: first.block,
        apartment: first.apartment,
        phone: first.phone || '+90 530 000 00 00',
        notificationPreference: 'app',
      });
    } else {
      setResidentUser({
        id: `res-default-${newSiteId}`,
        siteId: newSiteId,
        fullName: 'Site Sakini',
        block: data.siteInfo.blocks?.[0]?.block || 'A',
        apartment: '1',
        phone: '+90 530 000 00 00',
        notificationPreference: 'app',
      });
    }

    // Reset modals and jump to guest / role selector
    setShowNewSiteModal(false);
    setCurrentRole('guest');
    playSuccessChime();
  };

  // Delete custom site with Firestore deletion
  const deleteSite = (siteId: string) => {
    if (siteId === INITIAL_SITE_INFO.id) return; // Prevent deleting demo site
    setSites((prev) => prev.filter((s) => s.id !== siteId));
    deleteSiteDoc(siteId);
    if (currentSiteId === siteId) {
      switchSite(INITIAL_SITE_INFO.id);
    }
    playSuccessChime();
  };

  // Manual trigger to refresh cloud connection status
  const refreshCloudSites = async () => {
    setCloudSyncStatus('connecting');
    const res = await testConnection();
    if (res.connected) {
      setCloudSyncStatus('connected');
      setCloudSyncError(null);
    } else {
      setCloudSyncStatus('error');
      setCloudSyncError(res.error || 'Bağlantı hatası');
    }
  };

  // Notification preference update
  const updateResidentNotificationPreference = (pref: NotificationChannelPreference) => {
    setResidentUser((prev) => ({ ...prev, notificationPreference: pref }));
    setAllResidents((prev) =>
      prev.map((r) => (r.id === residentUser.id ? { ...r, notificationPreference: pref } : r))
    );
    playSuccessChime();
  };

  // Directory Management (CRUD)
  const addResidentToSite = (res: Omit<SiteResident, 'id' | 'siteId'>): SiteResident => {
    const newRes: SiteResident = {
      id: `res-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      siteId: currentSiteId,
      block: res.block,
      apartment: res.apartment,
      fullName: res.fullName.trim(),
      phone: res.phone?.trim() || '+90 530 000 00 00',
      username: res.username || res.fullName.toLowerCase().replace(/\s+/g, '.'),
      password: res.password,
      smsVerified: true,
      notificationPreference: 'app',
      registeredAt: new Date().toISOString(),
    };
    setAllResidents((prev) => [...prev, newRes]);
    syncResidentDoc(currentSiteId, newRes.id, newRes);
    playSuccessChime();
    return newRes;
  };

  const updateResident = (id: string, updated: Partial<SiteResident>) => {
    setAllResidents((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
    );
    syncResidentDoc(currentSiteId, id, updated);
    if (residentUser.id === id) {
      setResidentUser((prev) => ({
        ...prev,
        ...updated,
      }));
    }
    playSuccessChime();
  };

  const deleteResident = (id: string) => {
    setAllResidents((prev) => prev.filter((r) => r.id !== id));
    removeResidentDoc(currentSiteId, id);
    playSuccessChime();
  };

  const addSecurityGuard = async (
    g: Omit<SecurityGuard, 'id' | 'siteId'>,
    initialPin?: string
  ): Promise<SecurityGuard> => {
    const rawPin = initialPin?.trim() || '1234';
    const pinHash = await hashString(rawPin);
    const newGuard: SecurityGuard = {
      id: `sec-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      siteId: currentSiteId,
      name: g.name.trim(),
      surname: g.surname.trim(),
      username: g.username?.trim() || `${g.name.toLowerCase()}.${g.surname.toLowerCase()}`.replace(/\s+/g, ''),
      phone: g.phone?.trim() || '+90 532 000 00 00',
      shift: g.shift || 'Gündüz (08:00 - 16:00)',
      dutyStatus: g.dutyStatus || 'gorevde',
      pinHash,
      isActive: true,
      isArchived: false,
      notes: g.notes?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAllSecurityGuards((prev) => [...prev, newGuard]);
    syncGuardDoc(currentSiteId, newGuard.id, newGuard);
    playSuccessChime();
    return newGuard;
  };

  const updateSecurityGuard = (id: string, updated: Partial<SecurityGuard>) => {
    const payload = { ...updated, updatedAt: new Date().toISOString() };
    setAllSecurityGuards((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...payload } : g))
    );
    syncGuardDoc(currentSiteId, id, payload);
    if (activeGuard && activeGuard.id === id) {
      setActiveGuard((prev) => (prev ? { ...prev, ...payload } : null));
    }
    playSuccessChime();
  };

  // Soft-delete / Archive guard so historical logs, visitor entries, and cargo records remain intact
  const deleteSecurityGuard = (id: string) => {
    const archivePayload = {
      isArchived: true,
      isActive: false,
      dutyStatus: 'izinli' as const,
      updatedAt: new Date().toISOString(),
    };
    setAllSecurityGuards((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...archivePayload } : g))
    );
    syncGuardDoc(currentSiteId, id, archivePayload);
    if (activeGuard && activeGuard.id === id) {
      setActiveGuard(null);
    }
    playSuccessChime();
  };

  // Toggle active/passive status (when passive, guard login is immediately revoked)
  const toggleGuardActiveStatus = (id: string) => {
    const target = allSecurityGuards.find((g) => g.id === id);
    if (!target) return;
    const nextActive = !target.isActive;
    const payload = {
      isActive: nextActive,
      dutyStatus: nextActive ? ('gorevde' as const) : ('izinli' as const),
      updatedAt: new Date().toISOString(),
    };
    setAllSecurityGuards((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...payload } : g))
    );
    syncGuardDoc(currentSiteId, id, payload);
    if (!nextActive && activeGuard && activeGuard.id === id) {
      setActiveGuard(null);
    }
    playSuccessChime();
  };

  // Reset PIN (Never stored in plaintext, hashed with SHA-256)
  const resetSecurityGuardPin = async (id: string, newPin: string): Promise<boolean> => {
    if (!newPin || newPin.trim().length !== 4) return false;
    const pinHash = await hashString(newPin.trim());
    const payload = {
      pinHash,
      updatedAt: new Date().toISOString(),
    };
    setAllSecurityGuards((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...payload } : g))
    );
    syncGuardDoc(currentSiteId, id, payload);
    playSuccessChime();
    return true;
  };

  // Facility / Vendor Operations (TESİS / TEDARİKÇİ)
  const addFacilityEntry = (
    entry: Omit<FacilityEntry, 'id' | 'siteId' | 'createdAt' | 'status' | 'entryTime'> & { entryTime?: string }
  ): FacilityEntry => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const dateStr = `Bugün ${timeStr}`;

    const newEntry: FacilityEntry = {
      id: `fac-${Date.now().toString(36)}`,
      siteId: currentSiteId,
      category: entry.category,
      companyName: entry.companyName.trim(),
      targetArea: entry.targetArea,
      block: entry.block,
      apartment: entry.apartment,
      plateNumber: entry.plateNumber?.trim() || undefined,
      notes: entry.notes?.trim() || undefined,
      entryTime: dateStr,
      status: 'iceride',
      officerName: activeGuard ? `${activeGuard.name} ${activeGuard.surname}` : 'Güvenlik Görevlisi',
      createdAt: dateStr,
    };

    setAllFacilities((prev) => [newEntry, ...prev]);
    syncFacilityDoc(currentSiteId, newEntry.id, newEntry);
    playSuccessChime();
    return newEntry;
  };

  const checkOutFacilityEntry = (facilityId: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const exitDateStr = `Bugün ${timeStr}`;

    const updatePayload = {
      status: 'ayrildi' as const,
      exitTime: exitDateStr,
    };

    setAllFacilities((prev) =>
      prev.map((f) => (f.id === facilityId ? { ...f, ...updatePayload } : f))
    );
    syncFacilityDoc(currentSiteId, facilityId, updatePayload);
    playSuccessChime();
  };

  const addSiteAdmin = (adm: Omit<SiteAdmin, 'id' | 'siteId'>) => {
    const newAdm: SiteAdmin = {
      id: `adm-${Date.now().toString(36)}`,
      siteId: currentSiteId,
      name: adm.name.trim(),
      surname: adm.surname.trim(),
      email: adm.email.trim(),
      phone: adm.phone.trim(),
      role: adm.role,
      permissions: adm.permissions || ['all'],
    };
    setAllAdmins((prev) => [...prev, newAdm]);
    syncAdminDoc(currentSiteId, newAdm.id, newAdm);
    playSuccessChime();
  };

  const updateSiteAdmin = (id: string, updated: Partial<SiteAdmin>) => {
    setAllAdmins((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
    );
    syncAdminDoc(currentSiteId, id, updated);
    playSuccessChime();
  };

  // ==========================================
  // ORDERS MODULE (UNCHANGED AS PER RULE)
  // ==========================================
  const createSecurityOrder = (data: {
    company: string;
    block: string;
    apartment: string;
    residentName: string;
    courierName?: string;
  }): OrderNotification => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const dateStr = `Bugün ${timeStr}`;

    const newOrder: OrderNotification = {
      id: `ord-${Date.now().toString(36)}`,
      siteId: currentSiteId,
      company: data.company,
      block: data.block,
      apartment: data.apartment,
      residentName: data.residentName,
      createdAt: dateStr,
      courierName: data.courierName || 'Kurye',
      status: 'bekleniyor',
      securityApproved: false,
    };

    setAllOrders((prev) => [newOrder, ...prev]);
    syncOrderDoc(currentSiteId, newOrder.id, newOrder);
    setActiveResidentOrderPrompt(newOrder);
    playNotificationChime();
    return newOrder;
  };

  const respondToOrderDeliveryPreference = (orderId: string, preference: DeliveryPreference) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    let updatedTarget: OrderNotification | null = null;
    setAllOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          updatedTarget = {
            ...ord,
            deliveryPreference: preference,
            status: 'cevaplandi',
            answeredAt: `Bugün ${timeStr}`,
          };
          return updatedTarget;
        }
        return ord;
      })
    );

    setActiveResidentOrderPrompt(null);
    if (updatedTarget) {
      syncOrderDoc(currentSiteId, orderId, updatedTarget);
      setSecurityOrderAlert({
        order: updatedTarget,
        active: true,
      });
      startOrderAlertAlarm(3000);
    }
  };

  const confirmSecurityOrderApproval = (orderId: string) => {
    stopOrderAlertAlarm();
    playSuccessChime();

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const updateData = {
      securityApproved: true,
      guardAcknowledged: true,
      status: 'onaylandi' as const,
      approvedBySecurityAt: `Bugün ${timeStr}`,
    };

    setAllOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            ...updateData,
          };
        }
        return ord;
      })
    );
    syncOrderDoc(currentSiteId, orderId, updateData);
    setSecurityOrderAlert(null);
  };

  const dismissResidentOrderPrompt = () => {
    setActiveResidentOrderPrompt(null);
  };

  const dismissSecurityOrderAlert = () => {
    stopOrderAlertAlarm();
    setSecurityOrderAlert(null);
  };

  // ==========================================
  // GUEST MODULE
  // ==========================================
  const addResidentGuest = (data: {
    guestType: 'yaya' | 'aracli';
    titlePrefix?: 'Bey' | 'Hanım' | '';
    firstName: string;
    lastName: string;
    block: string;
    apartment: string;
    residentName: string;
    expectedDate: string;
    expectedTime?: string;
    isImmediate?: boolean;
    plateNumber?: string;
    vehicleBrandModel?: string;
    vehicleColor?: string;
    notes?: string;
    residentOption: ResidentGuestOption;
    parkingEscort?: ParkingEscortPreference;
  }): GuestEntry => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const cleanFirstName = data.firstName.trim();
    const cleanLastName = data.lastName.trim();
    const prefix = data.titlePrefix ? ` (${data.titlePrefix})` : '';
    const full = `${cleanFirstName} ${cleanLastName}${prefix}`.trim();

    const newGuest: GuestEntry = {
      id: `gst-${Date.now().toString(36)}`,
      siteId: currentSiteId,
      guestType: data.guestType,
      titlePrefix: data.titlePrefix || '',
      firstName: cleanFirstName,
      lastName: cleanLastName,
      fullName: full,
      block: data.block,
      apartment: data.apartment,
      residentName: data.residentName,
      expectedDate: data.expectedDate || 'Bugün',
      expectedTime: data.expectedTime || timeStr,
      isImmediate: data.isImmediate ?? true,
      status: 'bekleniyor',
      plateNumber: data.plateNumber?.trim() || undefined,
      vehicleBrandModel: data.vehicleBrandModel?.trim() || undefined,
      vehicleColor: data.vehicleColor?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
      residentOption: data.residentOption,
      parkingEscort: data.parkingEscort,
      createdAt: `Bugün ${timeStr}`,
      source: 'sakin',
    };

    setAllGuests((prev) => [newGuest, ...prev]);
    syncGuestDoc(currentSiteId, newGuest.id, newGuest);

    // Notify Security Screen with audible alert
    setSecurityGuestAlert({
      guest: newGuest,
      active: true,
    });
    playMysticGuestAlertChime();

    return newGuest;
  };

  const updateResidentGuest = (id: string, updated: Partial<GuestEntry>) => {
    setAllGuests((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const fn = updated.firstName ?? g.firstName;
          const ln = updated.lastName ?? g.lastName;
          const pref = (updated.titlePrefix ?? g.titlePrefix) ? ` (${updated.titlePrefix ?? g.titlePrefix})` : '';
          return {
            ...g,
            ...updated,
            fullName: `${fn} ${ln}${pref}`.trim(),
          };
        }
        return g;
      })
    );
    syncGuestDoc(currentSiteId, id, updated);
    playSuccessChime();
  };

  const respondToGuestArrival = (guestId: string, response: 'EVDEYIM' | 'CAFEDEYIM' | 'YOKUM') => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const updatePayload = {
      residentResponse: response,
      residentRespondedAt: `Bugün ${timeStr}`,
      guardAcknowledged: false,
    };
    setAllGuests((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, ...updatePayload } : g))
    );
    syncGuestDoc(currentSiteId, guestId, updatePayload);
  };

  const cancelResidentGuest = (id: string) => {
    setAllGuests((prev) => prev.filter((g) => g.id !== id));
    syncGuestDoc(currentSiteId, id, { status: 'iptal' });
  };

  const addSecurityGuest = (data: {
    guestType: 'yaya' | 'aracli';
    firstName?: string;
    lastName?: string;
    block: string;
    apartment: string;
    residentName: string;
    plateNumber?: string;
    vehicleBrandModel?: string;
    vehicleColor?: string;
    notes?: string;
    isQuickEntry?: boolean;
  }): { success: boolean; error?: string; guest?: GuestEntry } => {
    if (!data.block || !data.apartment) {
      return { success: false, error: 'Gidilecek blok ve daire seçilmelidir.' };
    }

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const cleanFirstName = data.firstName?.trim() || 'Misafir';
    const cleanLastName = data.lastName?.trim() || '';
    const full = `${cleanFirstName} ${cleanLastName}`.trim();

    const newGuest: GuestEntry = {
      id: `gst-${Date.now().toString(36)}`,
      siteId: currentSiteId,
      guestType: data.guestType,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      fullName: full,
      block: data.block,
      apartment: data.apartment,
      residentName: data.residentName,
      expectedDate: 'Bugün',
      expectedTime: timeStr,
      entryTime: timeStr,
      status: 'bekleniyor',
      isQuickEntry: data.isQuickEntry ?? true,
      plateNumber: data.plateNumber?.trim() || undefined,
      vehicleBrandModel: data.vehicleBrandModel?.trim() || undefined,
      vehicleColor: data.vehicleColor?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
      createdAt: `Bugün ${timeStr}`,
      source: 'guvenlik',
      guardAcknowledged: false,
    };

    setAllGuests((prev) => [newGuest, ...prev]);
    syncGuestDoc(currentSiteId, newGuest.id, newGuest);
    playSuccessChime();
    return { success: true, guest: newGuest };
  };

  const checkInGuest = (id: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setAllGuests((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          return {
            ...g,
            status: 'giris_yapti',
            entryTime: timeStr,
          };
        }
        return g;
      })
    );
    syncGuestDoc(currentSiteId, id, {
      status: 'giris_yapti',
      entryTime: timeStr,
    });
    playSuccessChime();
  };

  const checkOutGuest = (id: string, guardName?: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setAllGuests((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          if (g.status === 'ayrildi') return g; // prevent duplicate checkout
          return {
            ...g,
            status: 'ayrildi',
            exitTime: timeStr,
            notes: guardName ? `${g.notes ? g.notes + ' · ' : ''}Çıkış: ${guardName}` : g.notes,
          };
        }
        return g;
      })
    );
    syncGuestDoc(currentSiteId, id, {
      status: 'ayrildi',
      exitTime: timeStr,
    });
    playSuccessChime();
  };

  const addGuest = (guest: Omit<GuestEntry, 'id' | 'createdAt' | 'status' | 'siteId'>): GuestEntry => {
    return addResidentGuest({
      guestType: guest.guestType || 'yaya',
      titlePrefix: guest.titlePrefix,
      firstName: guest.firstName || guest.fullName?.split(' ')[0] || '',
      lastName: guest.lastName || guest.fullName?.split(' ').slice(1).join(' ') || '',
      block: guest.block,
      apartment: guest.apartment,
      residentName: guest.residentName,
      expectedDate: guest.expectedDate,
      expectedTime: guest.expectedTime,
      isImmediate: guest.isImmediate,
      plateNumber: guest.plateNumber,
      vehicleBrandModel: guest.vehicleBrandModel,
      vehicleColor: guest.vehicleColor,
      notes: guest.notes,
      residentOption: guest.residentOption || 'misafirim_gelecek',
      parkingEscort: guest.parkingEscort,
    });
  };

  const updateGuestStatus = (id: string, status: GuestEntry['status']) => {
    if (status === 'giris_yapti') {
      checkInGuest(id);
    } else if (status === 'ayrildi') {
      checkOutGuest(id);
    } else if (status === 'iptal') {
      cancelResidentGuest(id);
    }
  };

  const dismissSecurityGuestAlert = () => {
    setSecurityGuestAlert(null);
  };

  // ==========================================
  // CARGO MODULE
  // ==========================================
  const addBatchCargo = (
    items: {
      carrier: CargoCarrier | string;
      block: string;
      apartment: string;
      recipientName: string;
      pieceCount: number;
      notes?: string;
      trackingCode?: string;
    }[]
  ): CargoItem[] => {
    if (!items || items.length === 0) return [];

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const dateStr = `Bugün ${timeStr}`;

    const newCargoItems: CargoItem[] = items.map((item, index) => {
      const uniqueNum = Math.floor(10000 + Math.random() * 90000);
      return {
        id: `CRG-${uniqueNum}-${index}`,
        siteId: currentSiteId,
        carrier: item.carrier,
        block: item.block,
        apartment: item.apartment,
        recipientName: item.recipientName,
        pieceCount: Number(item.pieceCount) || 1,
        createdAt: dateStr,
        receivedAt: dateStr,
        notificationStatus: 'bekleniyor',
        deliveryStatus: 'guvenlikte',
        securityOfficerName: 'Güvenlik - Mehmet Demir',
        notes: item.notes,
        securitySeen: false,
        trackingCode: item.trackingCode || `CRG-${uniqueNum}`,
      };
    });

    setAllCargo((prev) => [...newCargoItems, ...prev]);

    // Real-time Cloud Write each cargo to Firestore
    for (const c of newCargoItems) {
      syncCargoDoc(currentSiteId, c.id, c);
    }

    // Send notification chime and prompt for current resident if any matches
    const matchedForResident = newCargoItems.find(
      (c) => c.block === residentUser.block && c.apartment === residentUser.apartment
    );
    if (matchedForResident) {
      setActiveResidentCargoPrompt(matchedForResident);
    } else if (newCargoItems.length > 0) {
      setActiveResidentCargoPrompt(newCargoItems[0]);
    }

    playCargoAlertChime();
    return newCargoItems;
  };

  const addCargo = (
    cargo: Omit<CargoItem, 'id' | 'receivedAt' | 'createdAt' | 'notificationStatus' | 'deliveryStatus' | 'siteId'>
  ): CargoItem => {
    const res = addBatchCargo([
      {
        carrier: cargo.carrier,
        block: cargo.block,
        apartment: cargo.apartment,
        recipientName: cargo.recipientName,
        pieceCount: cargo.pieceCount || 1,
        notes: cargo.notes,
        trackingCode: cargo.trackingCode,
      },
    ]);
    return res[0];
  };

  const respondToCargoPreference = (
    cargoId: string,
    preference: ResidentCargoPreference,
    smsCode?: string
  ) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    let updatedTarget: CargoItem | null = null;

    setAllCargo((prev) =>
      prev.map((c) => {
        if (c.id === cargoId) {
          updatedTarget = {
            ...c,
            residentPreference: preference,
            notificationStatus: 'cevaplandi',
            answeredAt: `Bugün ${timeStr}`,
            securitySeen: false,
            smsCode: smsCode?.trim() || undefined,
            smsCodeVerified: Boolean(smsCode && smsCode.trim().length >= 4),
          };
          return updatedTarget;
        }
        return c;
      })
    );

    setActiveResidentCargoPrompt(null);

    // Sakin tercih yaptığında güvenlik ekranında sesli uyarı oluşturulmalı ve Firestore güncellenmeli
    if (updatedTarget) {
      syncCargoDoc(currentSiteId, cargoId, updatedTarget);
      setSecurityCargoAlert({
        cargo: updatedTarget,
        active: true,
      });
      playCargoAlertChime();
    }
  };

  const confirmSecurityCargoSeen = (cargoId: string) => {
    setAllCargo((prev) =>
      prev.map((c) => (c.id === cargoId ? { ...c, securitySeen: true } : c))
    );
    syncCargoDoc(currentSiteId, cargoId, { securitySeen: true });
    setSecurityCargoAlert(null);
    playSuccessChime();
  };

  const deliverCargo = (cargoId: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const updatePayload = {
      deliveryStatus: 'teslim_edildi' as const,
      deliveredAt: `Bugün ${timeStr}`,
    };

    setAllCargo((prev) =>
      prev.map((c) => {
        if (c.id === cargoId) {
          return {
            ...c,
            ...updatePayload,
          };
        }
        return c;
      })
    );
    syncCargoDoc(currentSiteId, cargoId, updatePayload);
    playSuccessChime();
  };

  const dismissResidentCargoPrompt = () => {
    setActiveResidentCargoPrompt(null);
  };

  const dismissSecurityCargoAlert = () => {
    setSecurityCargoAlert(null);
  };

  // ==========================================
  // SUGGESTIONS MODULE
  // ==========================================
  const addSuggestion = (sug: {
    title: string;
    category: SuggestionCategory;
    urgency: UrgencyLevel;
    message: string;
  }) => {
    const newSug: SuggestionItem = {
      id: `sug-${Date.now().toString(36)}`,
      siteId: currentSiteId,
      title: sug.title,
      category: sug.category,
      urgency: sug.urgency,
      message: sug.message,
      residentName: residentUser.fullName,
      residentBlock: residentUser.block,
      residentApartment: residentUser.apartment,
      createdAt: 'Bugün',
      status: 'inceleniyor',
    };
    setAllSuggestions((prev) => [newSug, ...prev]);
    syncSuggestionDoc(currentSiteId, newSug.id, newSug);
  };

  const respondToSuggestion = (id: string, response: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const updatePayload = {
      adminResponse: response,
      status: 'yanitlandi' as const,
      respondedAt: `Bugün ${timeStr}`,
    };
    setAllSuggestions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, ...updatePayload } : s
      )
    );
    syncSuggestionDoc(currentSiteId, id, updatePayload);
  };

  // ==========================================
  // CENTRAL STAFF MANAGEMENT (Requirement 2)
  // ==========================================
  const addStaffMember = async (
    data: Omit<StaffMember, 'id' | 'siteId'>,
    initialPin: string = '1234'
  ): Promise<StaffMember> => {
    const pinHash = await hashString(initialPin);
    const newStaff: StaffMember = {
      ...data,
      id: `staff-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      siteId: currentSiteId,
      category: data.category || 'Güvenlik',
      isActive: data.isActive !== undefined ? data.isActive : true,
      isArchived: false,
      salaryType: data.salaryType || 'monthly',
      baseSalary: data.baseSalary !== undefined ? data.baseSalary : 24000,
      hourlyRate: data.hourlyRate !== undefined ? data.hourlyRate : 150,
      pinHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAllStaff((prev) => [...prev, newStaff]);
    if (newStaff.category === 'Güvenlik') {
      setAllSecurityGuards((prev) => [...prev, newStaff as SecurityGuard]);
      syncGuardDoc(currentSiteId, newStaff.id, newStaff);
    }
    syncStaffDoc(currentSiteId, newStaff.id, newStaff);
    playSuccessChime();
    return newStaff;
  };

  const updateStaffMember = (id: string, updated: Partial<StaffMember>) => {
    const payload = {
      ...updated,
      updatedAt: new Date().toISOString(),
    };
    setAllStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...payload } : s))
    );
    setAllSecurityGuards((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...payload } : g))
    );
    syncStaffDoc(currentSiteId, id, payload);
    if (updated.category === 'Güvenlik' || !updated.category) {
      syncGuardDoc(currentSiteId, id, payload);
    }
    playSuccessChime();
  };

  const deleteStaffMember = (id: string) => {
    // Soft-delete to keep historical logs & attendance intact
    const payload = {
      isArchived: true,
      isActive: false,
      updatedAt: new Date().toISOString(),
    };
    setAllStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...payload } : s))
    );
    setAllSecurityGuards((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...payload } : g))
    );
    syncStaffDoc(currentSiteId, id, payload);
    syncGuardDoc(currentSiteId, id, payload);
    playSuccessChime();
  };

  const toggleStaffActiveStatus = (id: string) => {
    const member = allStaff.find((s) => s.id === id);
    if (!member) return;
    const newStatus = !member.isActive;
    const payload = {
      isActive: newStatus,
      updatedAt: new Date().toISOString(),
    };
    setAllStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...payload } : s))
    );
    setAllSecurityGuards((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...payload } : g))
    );
    syncStaffDoc(currentSiteId, id, payload);
    syncGuardDoc(currentSiteId, id, payload);
    playSuccessChime();
  };

  const resetStaffPin = async (id: string, newPin: string): Promise<boolean> => {
    if (!newPin || newPin.length < 4) return false;
    const pinHash = await hashString(newPin);
    const payload = {
      pinHash,
      updatedAt: new Date().toISOString(),
    };
    setAllStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...payload } : s))
    );
    setAllSecurityGuards((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...payload } : g))
    );
    syncStaffDoc(currentSiteId, id, payload);
    syncGuardDoc(currentSiteId, id, payload);
    playSuccessChime();
    return true;
  };

  // ==========================================
  // STAFF TIME ATTENDANCE / PUANTAJ (Requirement 3)
  // ==========================================
  const clockInStaff = async (staffId: string, note?: string): Promise<TimeRecord> => {
    const staff = allStaff.find((s) => s.id === staffId);
    if (!staff) throw new Error('Personel bulunamadı');
    if (!staff.isActive) throw new Error('Personel hesabı pasif durumdadır. Mesaiye başlayamaz.');

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newRecord: TimeRecord = {
      id: `tr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      siteId: currentSiteId,
      staffId: staff.id,
      staffName: `${staff.name} ${staff.surname}`,
      category: staff.category || 'Güvenlik',
      date: dateStr,
      clockIn: timeStr,
      clockInTimestamp: now.getTime(),
      status: 'working',
      note: note || undefined,
    };

    setAllTimeRecords((prev) => [newRecord, ...prev]);
    syncTimeRecordDoc(currentSiteId, newRecord.id, newRecord);
    playSuccessChime();
    showFloatingAlert({
      title: 'Mesai Başladı',
      message: `${staff.name} ${staff.surname} (${staff.category || 'Personel'}) mesaiye girdi (${timeStr})`,
      type: 'info',
    });
    return newRecord;
  };

  const clockOutStaff = async (staffId: string, note?: string): Promise<TimeRecord | null> => {
    const activeShift = allTimeRecords.find(
      (r) => r.staffId === staffId && r.status === 'working' && r.siteId === currentSiteId
    );
    if (!activeShift) return null;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const outTimestamp = now.getTime();
    const durationMs = Math.max(0, outTimestamp - activeShift.clockInTimestamp);
    const totalHours = Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10;
    const overtimeHours = totalHours > 8 ? Math.round((totalHours - 8) * 10) / 10 : 0;

    const updatedRecord: TimeRecord = {
      ...activeShift,
      clockOut: timeStr,
      clockOutTimestamp: outTimestamp,
      totalHours,
      overtimeHours,
      status: 'completed',
      note: note ? (activeShift.note ? `${activeShift.note} | ${note}` : note) : activeShift.note,
    };

    setAllTimeRecords((prev) =>
      prev.map((r) => (r.id === activeShift.id ? updatedRecord : r))
    );
    syncTimeRecordDoc(currentSiteId, updatedRecord.id, updatedRecord);
    playSuccessChime();
    showFloatingAlert({
      title: 'Mesai Bitti',
      message: `${activeShift.staffName} mesai çıkışı yaptı. Süre: ${totalHours} saat`,
      type: 'info',
    });
    return updatedRecord;
  };

  const adminAdjustTimeRecord = (
    recordId: string,
    updates: Partial<TimeRecord>,
    reason: string
  ) => {
    const now = new Date();
    const payload: Partial<TimeRecord> = {
      ...updates,
      editedBy: 'Site Yöneticisi',
      editedAt: `${now.toLocaleDateString('tr-TR')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      editReason: reason,
      status: 'admin_adjusted',
    };

    setAllTimeRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, ...payload } : r))
    );
    syncTimeRecordDoc(currentSiteId, recordId, payload);
    playSuccessChime();
  };

  // ==========================================
  // MANAGERIAL PAYROLL CALCULATION (Requirement 3)
  // ==========================================
  const calculateStaffPayroll = (staffId: string, month: string): PayrollRecord => {
    const staff = allStaff.find((s) => s.id === staffId);
    const staffName = staff ? `${staff.name} ${staff.surname}` : 'Personel';
    const category = staff?.category || 'Güvenlik';
    const baseSalary = staff?.baseSalary || 24000;
    const hourlyRate = staff?.hourlyRate || 150;
    const salaryType = staff?.salaryType || 'monthly';

    const monthRecords = allTimeRecords.filter(
      (r) => r.staffId === staffId && r.date.startsWith(month)
    );

    let totalRegularHours = 0;
    let totalOvertimeHours = 0;

    monthRecords.forEach((r) => {
      const hours = r.totalHours || 0;
      const ot = r.overtimeHours || 0;
      totalRegularHours += Math.max(0, hours - ot);
      totalOvertimeHours += ot;
    });

    totalRegularHours = Math.round(totalRegularHours * 10) / 10;
    totalOvertimeHours = Math.round(totalOvertimeHours * 10) / 10;

    let baseAmount = baseSalary;
    if (salaryType === 'hourly') {
      baseAmount = Math.round(totalRegularHours * hourlyRate);
    }
    const overtimeAmount = Math.round(totalOvertimeHours * hourlyRate * 1.5);
    const bonuses = 0;
    const advances = 0;
    const deductions = 0;
    const netPayable = baseAmount + overtimeAmount + bonuses - advances - deductions;

    const record: PayrollRecord = {
      id: `pay-${staffId}-${month}`,
      siteId: currentSiteId,
      staffId,
      staffName,
      category,
      month,
      totalRegularHours,
      totalOvertimeHours,
      baseAmount,
      overtimeAmount,
      bonuses,
      advances,
      deductions,
      netPayable,
      isApprovedByAdmin: false,
      notes: 'Yönetimsel iç hesaplama pusulasıdır (SGK resmi bordrosu yerine geçmez).',
    };

    setAllPayroll((prev) => {
      const exists = prev.findIndex((p) => p.id === record.id);
      if (exists >= 0) {
        const next = [...prev];
        next[exists] = record;
        return next;
      }
      return [record, ...prev];
    });
    syncPayrollRecordDoc(currentSiteId, record.id, record);
    return record;
  };

  const approvePayrollRecord = (recordId: string) => {
    const now = new Date();
    const updatePayload = {
      isApprovedByAdmin: true,
      approvedAt: now.toLocaleDateString('tr-TR'),
      approvedBy: 'Site Yönetimi',
    };
    setAllPayroll((prev) =>
      prev.map((p) => (p.id === recordId ? { ...p, ...updatePayload } : p))
    );
    syncPayrollRecordDoc(currentSiteId, recordId, updatePayload);
    playSuccessChime();
  };

  // ==========================================
  // RESIDENT DUES & DEBT (Requirement 4)
  // ==========================================
  const addDueItem = (item: Omit<DueItem, 'id' | 'siteId'>): DueItem => {
    const newDue: DueItem = {
      ...item,
      id: `due-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      siteId: currentSiteId,
      remainingAmount: Math.max(0, item.amount - (item.paidAmount || 0)),
      status: (item.paidAmount || 0) >= item.amount ? 'odendi' : (item.paidAmount || 0) > 0 ? 'kismi_odendi' : 'odenmedi',
    };
    setAllDues((prev) => [newDue, ...prev]);
    syncDueDoc(currentSiteId, newDue.id, newDue);
    playSuccessChime();
    return newDue;
  };

  const updateDuePayment = (
    dueId: string,
    paidAmount: number,
    paymentMethod?: DueItem['paymentMethod'],
    source: 'bank' | 'admin_manual' = 'admin_manual'
  ) => {
    const target = allDues.find((d) => d.id === dueId);
    if (!target) return;

    const newPaid = Math.min(target.amount, target.paidAmount + paidAmount);
    const remaining = Math.max(0, target.amount - newPaid);
    const status: DuePaymentStatus = remaining <= 0 ? 'odendi' : newPaid > 0 ? 'kismi_odendi' : 'odenmedi';
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()}`;

    const payload: Partial<DueItem> = {
      paidAmount: newPaid,
      remainingAmount: remaining,
      status,
      paidDate: dateStr,
      paymentMethod: paymentMethod || 'Yönetim Elden / Kasa',
      paymentSource: source,
    };

    setAllDues((prev) =>
      prev.map((d) => (d.id === dueId ? { ...d, ...payload } : d))
    );
    syncDueDoc(currentSiteId, dueId, payload);
    playSuccessChime();
  };

  // ==========================================
  // ANAHTAR & ZİMMET TAKİBİ (Requirement 9)
  // ==========================================
  const addKeyHandover = (k: Omit<KeyHandoverItem, 'id' | 'siteId'>): KeyHandoverItem => {
    const newItem: KeyHandoverItem = {
      ...k,
      id: `key-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      siteId: currentSiteId,
    };
    setAllKeyHandovers((prev) => [newItem, ...prev]);
    playSuccessChime();
    return newItem;
  };

  const returnKeyHandover = (id: string, returnedTo: string = 'Nizamiye Güvenliği') => {
    const now = new Date();
    const timeStr = `${now.toLocaleDateString('tr-TR')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setAllKeyHandovers((prev) =>
      prev.map((k) =>
        k.id === id
          ? {
              ...k,
              returnedAt: timeStr,
              returnedTo,
              status: 'iade_alindi',
            }
          : k
      )
    );
    playSuccessChime();
  };

  // ==========================================
  // DUYURU & BİLDİRİM SİSTEMİ (Requirement 12)
  // ==========================================
  const addAnnouncement = (
    a: Omit<SiteAnnouncement, 'id' | 'siteId' | 'createdAt' | 'readByUids'>
  ): SiteAnnouncement => {
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()}`;
    const newAnn: SiteAnnouncement = {
      ...a,
      id: `ann-${Date.now().toString(36)}`,
      siteId: currentSiteId,
      createdAt: dateStr,
      readByUids: [],
    };
    setAllAnnouncements((prev) => [newAnn, ...prev]);
    playNotificationChime();
    return newAnn;
  };

  const markAnnouncementAsRead = (id: string, uid: string) => {
    setAllAnnouncements((prev) =>
      prev.map((ann) => {
        if (ann.id === id) {
          const reads = new Set(ann.readByUids || []);
          reads.add(uid);
          return { ...ann, readByUids: Array.from(reads) };
        }
        return ann;
      })
    );
  };

  // ==========================================
  // SAKİNLER ARASI İŞ AĞI & TİCARİ İŞ BİRLİĞİ (Requirement 17)
  // ==========================================
  const saveBusinessProfile = (p: Omit<ResidentBusinessProfile, 'id' | 'siteId' | 'updatedAt'>) => {
    const existing = allBusinessProfiles.find((b) => b.residentId === p.residentId && b.siteId === currentSiteId);
    if (existing) {
      setAllBusinessProfiles((prev) =>
        prev.map((b) =>
          b.id === existing.id
            ? { ...b, ...p, updatedAt: new Date().toISOString() }
            : b
        )
      );
    } else {
      const newProf: ResidentBusinessProfile = {
        ...p,
        id: `bus-${Date.now().toString(36)}`,
        siteId: currentSiteId,
        updatedAt: new Date().toISOString(),
      };
      setAllBusinessProfiles((prev) => [newProf, ...prev]);
    }
    playSuccessChime();
  };

  // ==========================================
  // GELİR-GİDER & FATURA YÖNETİMİ (Requirement 11)
  // ==========================================
  const addExpense = (e: Omit<ExpenseRecord, 'id' | 'siteId' | 'createdAt'>): ExpenseRecord => {
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()}`;
    const newExp: ExpenseRecord = {
      ...e,
      id: `exp-${Date.now().toString(36)}`,
      siteId: currentSiteId,
      createdAt: dateStr,
    };
    setAllExpenses((prev) => [newExp, ...prev]);
    playSuccessChime();
    return newExp;
  };

  const updateExpensePayment = (id: string, paidDateOrStatus: string, method?: ExpenseRecord['paymentMethod']) => {
    const isPaying = paidDateOrStatus !== 'pending';
    const today = new Date().toLocaleDateString('tr-TR');
    setAllExpenses((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              isPaid: isPaying,
              status: isPaying ? 'paid' : 'pending',
              paidDate: isPaying ? (paidDateOrStatus === 'paid' ? today : paidDateOrStatus) : undefined,
              paymentMethod: method || e.paymentMethod || 'Banka Havalesi / EFT',
            }
          : e
      )
    );
    playSuccessChime();
  };

  // ==========================================
  // MODÜLER SİTE YAPILANDIRMASI (Requirement 4, 13, 14, 15, 16)
  // ==========================================
  const updateSiteModules = (siteId: string, modules: NonNullable<SiteInfo['modules']>) => {
    setSites((prev) =>
      prev.map((s) => (s.id === siteId ? { ...s, modules: { ...s.modules, ...modules } } : s))
    );
    playSuccessChime();
  };

  const updateSiteWhatsapp = (siteId: string, config: NonNullable<SiteInfo['whatsappConfig']>) => {
    setSites((prev) =>
      prev.map((s) => (s.id === siteId ? { ...s, whatsappConfig: { ...s.whatsappConfig, ...config } } : s))
    );
    playSuccessChime();
  };

  const updateSiteGeofence = (siteId: string, config: NonNullable<SiteInfo['geofenceConfig']>) => {
    setSites((prev) =>
      prev.map((s) => (s.id === siteId ? { ...s, geofenceConfig: { ...s.geofenceConfig, ...config } } : s))
    );
    playSuccessChime();
  };

  const updateSiteHardware = (siteId: string, config: NonNullable<SiteInfo['hardwareConfig']>) => {
    setSites((prev) =>
      prev.map((s) => (s.id === siteId ? { ...s, hardwareConfig: { ...s.hardwareConfig, ...config } } : s))
    );
    playSuccessChime();
  };

  // ==========================================
  // FLOATING ALERT & LOUD CHIME (Requirement 6)
  // ==========================================
  const showFloatingAlert = (alert: {
    id?: string;
    title: string;
    message: string;
    type?: 'order' | 'guest' | 'cargo' | 'info';
    actionLabel?: string;
    onAction?: () => void;
  }) => {
    const alertId = alert.id || `alert-${Date.now()}`;
    setFloatingAlert({
      id: alertId,
      title: alert.title,
      message: alert.message,
      type: alert.type || 'info',
      actionLabel: alert.actionLabel,
      onAction: alert.onAction,
    });

    if (alert.type === 'order') {
      startOrderAlertAlarm(3000);
    } else if (alert.type === 'guest') {
      startGuestAlertAlarm(3000);
    } else if (alert.type === 'cargo') {
      playCargoAlertChime();
    } else {
      playNotificationChime();
    }
  };

  const dismissFloatingAlert = () => {
    stopOrderAlertAlarm();
    stopGuestAlertAlarm();
    setFloatingAlert(null);
  };

  const testNotificationSystem = () => {
    showFloatingAlert({
      title: '🔔 Kayan Bildirim & Ses Testi',
      message: 'Çift frekanslı zengin uyarı zili ve üst kayan bildirim başarıyla test edildi.',
      type: 'order',
      actionLabel: 'Tamam',
      onAction: () => dismissFloatingAlert(),
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        isMobilePreview,
        setIsMobilePreview,
        // Multi-Site & Cloud Sync
        sites,
        currentSiteId,
        siteInfo: activeSite,
        setSiteInfo,
        switchSite,
        deleteSite,
        createAndRegisterSite,
        cloudSyncStatus,
        cloudSyncError,
        refreshCloudSites,
        // Resident
        residentUser,
        setResidentUser,
        updateResidentNotificationPreference,
        // Directory & Guards & Admins
        siteResidents,
        addResidentToSite,
        updateResident,
        deleteResident,
        siteGuards,
        addSecurityGuard,
        updateSecurityGuard,
        deleteSecurityGuard,
        toggleGuardActiveStatus,
        resetSecurityGuardPin,
        activeGuard,
        setActiveGuard,
        siteAdmins,
        addSiteAdmin,
        updateSiteAdmin,
        // Central Staff Management
        staffList,
        addStaffMember,
        updateStaffMember,
        deleteStaffMember,
        toggleStaffActiveStatus,
        resetStaffPin,
        // Staff Time Attendance / Puantaj
        timeRecords,
        clockInStaff,
        clockOutStaff,
        adminAdjustTimeRecord,
        // Managerial Payroll
        payrollRecords,
        approvePayrollRecord,
        calculateStaffPayroll,
        // Resident Dues & Debts
        duesList,
        addDueItem,
        updateDuePayment,
        // Floating Alert & Notification Test
        floatingAlert,
        showFloatingAlert,
        dismissFloatingAlert,
        testNotificationSystem,
        // Orders (Unchanged)
        orderList,
        createSecurityOrder,
        respondToOrderDeliveryPreference,
        confirmSecurityOrderApproval,
        activeResidentOrderPrompt,
        dismissResidentOrderPrompt,
        securityOrderAlert,
        dismissSecurityOrderAlert,
        // Guests
        guestList,
        addResidentGuest,
        updateResidentGuest,
        cancelResidentGuest,
        addSecurityGuest,
        checkInGuest,
        checkOutGuest,
        addGuest,
        updateGuestStatus,
        respondToGuestArrival,
        securityGuestAlert,
        dismissSecurityGuestAlert,
        // Cargo
        cargoList,
        addBatchCargo,
        addCargo,
        respondToCargoPreference,
        confirmSecurityCargoSeen,
        deliverCargo,
        activeResidentCargoPrompt,
        dismissResidentCargoPrompt,
        securityCargoAlert,
        dismissSecurityCargoAlert,
        // Suggestions
        suggestionList,
        addSuggestion,
        respondToSuggestion,
        // Facility & Vendor Entries (TESİS / TEDARİKÇİ)
        facilityList,
        addFacilityEntry,
        checkOutFacilityEntry,
        // Theme & Customization (Requirement 19)
        theme,
        setTheme,
        // Anahtar & Zimmet Takibi (Requirement 9)
        keyHandovers,
        addKeyHandover,
        returnKeyHandover,
        // Duyuru & Bildirim Sistemi (Requirement 12)
        announcements,
        addAnnouncement,
        markAnnouncementAsRead,
        // Sakinler Arası İş Ağı & Ticari İş Birliği (Requirement 17)
        businessProfiles,
        saveBusinessProfile,
        // Gelir-Gider & Fatura Takibi (Requirement 11)
        expenses,
        addExpense,
        updateExpensePayment,
        // Modüler Site Ayarları & Entegrasyonlar
        updateSiteModules,
        updateSiteWhatsapp,
        updateSiteGeofence,
        updateSiteHardware,
        // Modals
        showAdModal,
        setShowAdModal,
        showDriveSetupModal,
        setShowDriveSetupModal,
        showNewSiteModal,
        setShowNewSiteModal,
        securityIsLoggedIn,
        setSecurityIsLoggedIn,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
