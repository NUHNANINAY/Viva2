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
  SiteAdmin,
  SiteResident,
  NotificationChannelPreference,
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
  SITE_RESIDENTS,
} from '../data/initialData';
import {
  playNotificationChime,
  startOrderAlertAlarm,
  stopOrderAlertAlarm,
  playSuccessChime,
  playGuestAlertChime,
  playCargoAlertChime,
  playMysticGuestAlertChime,
} from '../utils/audio';

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
  createAndRegisterSite: (data: {
    siteInfo: SiteInfo;
    managers: SiteAdmin[];
    securityGuards: SecurityGuard[];
    residents: SiteResident[];
  }) => void;

  // Active Resident User
  residentUser: ResidentUser;
  setResidentUser: (user: ResidentUser) => void;
  updateResidentNotificationPreference: (pref: NotificationChannelPreference) => void;

  // Directory for active site
  siteResidents: SiteResident[];
  addResidentToSite: (res: Omit<SiteResident, 'id' | 'siteId'>) => SiteResident;
  updateResident: (id: string, updated: Partial<SiteResident>) => void;
  deleteResident: (id: string) => void;

  // Guards for active site
  siteGuards: SecurityGuard[];
  addSecurityGuard: (g: Omit<SecurityGuard, 'id' | 'siteId'>) => void;
  updateSecurityGuard: (id: string, updated: Partial<SecurityGuard>) => void;
  deleteSecurityGuard: (id: string) => void;

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
    firstName: string;
    lastName: string;
    block: string;
    apartment: string;
    residentName: string;
    plateNumber?: string;
    vehicleBrandModel?: string;
    vehicleColor?: string;
    notes?: string;
  }) => { success: boolean; error?: string; guest?: GuestEntry };
  checkInGuest: (id: string) => void;
  addGuest: (guest: Omit<GuestEntry, 'id' | 'createdAt' | 'status' | 'siteId'>) => GuestEntry;
  updateGuestStatus: (id: string, status: GuestEntry['status']) => void;
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
  const siteGuards = allSecurityGuards.filter((g) => g.siteId === currentSiteId);
  const siteAdmins = allAdmins.filter((a) => a.siteId === currentSiteId);
  const orderList = allOrders.filter((o) => o.siteId === currentSiteId);
  const guestList = allGuests.filter((g) => g.siteId === currentSiteId);
  const cargoList = allCargo.filter((c) => c.siteId === currentSiteId);
  const suggestionList = allSuggestions.filter((s) => s.siteId === currentSiteId);

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
      localStorage.setItem('viva_active_resident_v3', JSON.stringify(residentUser));
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
    residentUser,
  ]);

  // Switch between registered sites
  const switchSite = (siteId: string) => {
    const targetSite = sites.find((s) => s.id === siteId);
    if (!targetSite) return;
    setCurrentSiteId(siteId);

    // Never silently log in as another resident when switching sites.
    setResidentUser({
      id: '', siteId, fullName: '', block: '', apartment: '', phone: '',
      notificationPreference: 'app',
    });

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
    setSites((prev) => [...prev, data.siteInfo]);
    setCurrentSiteId(newSiteId);

    // Add guards, managers and residents
    setAllAdmins((prev) => [...prev, ...readyManagers]);
    setAllSecurityGuards((prev) => [...prev, ...readyGuards]);
    setAllResidents((prev) => [...prev, ...readyResidents]);

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
      // No fabricated resident account: residents register themselves after setup.
      setResidentUser({ id: '', siteId: newSiteId, fullName: '', block: '', apartment: '', phone: '', notificationPreference: 'app' });
    }

    // Reset modals and jump to guest / role selector
    setShowNewSiteModal(false);
    setCurrentRole('guest');
    playSuccessChime();
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
      smsVerified: true,
      notificationPreference: 'app',
    };
    setAllResidents((prev) => [...prev, newRes]);
    playSuccessChime();
    return newRes;
  };

  const updateResident = (id: string, updated: Partial<SiteResident>) => {
    setAllResidents((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
    );
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
    playSuccessChime();
  };

  const addSecurityGuard = (g: Omit<SecurityGuard, 'id' | 'siteId'>) => {
    const newGuard: SecurityGuard = {
      id: `sec-${Date.now().toString(36)}`,
      siteId: currentSiteId,
      name: g.name.trim(),
      surname: g.surname.trim(),
      username: g.username.trim(),
      phone: g.phone?.trim(),
      isActive: true,
    };
    setAllSecurityGuards((prev) => [...prev, newGuard]);
    playSuccessChime();
  };

  const updateSecurityGuard = (id: string, updated: Partial<SecurityGuard>) => {
    setAllSecurityGuards((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updated } : g))
    );
    playSuccessChime();
  };

  const deleteSecurityGuard = (id: string) => {
    setAllSecurityGuards((prev) => prev.filter((g) => g.id !== id));
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
    playSuccessChime();
  };

  const updateSiteAdmin = (id: string, updated: Partial<SiteAdmin>) => {
    setAllAdmins((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
    );
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

    setAllOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            securityApproved: true,
            status: 'onaylandi',
            approvedBySecurityAt: `Bugün ${timeStr}`,
          };
        }
        return ord;
      })
    );
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
    const cleanFirstName = data.firstName.trim() || 'Misafir';
    const cleanLastName = data.lastName.trim() || '(Bilgi sonradan girilecek)';
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
    playSuccessChime();
  };

  const cancelResidentGuest = (id: string) => {
    setAllGuests((prev) => prev.filter((g) => g.id !== id));
  };

  const addSecurityGuest = (data: {
    guestType: 'yaya' | 'aracli';
    firstName: string;
    lastName: string;
    block: string;
    apartment: string;
    residentName: string;
    plateNumber?: string;
    vehicleBrandModel?: string;
    vehicleColor?: string;
    notes?: string;
  }): { success: boolean; error?: string; guest?: GuestEntry } => {
    // Gate staff can complete guest identity details later; do not slow down entry.
    if (!data.block || !data.apartment) {
      return { success: false, error: 'Gidilecek blok ve daire seçilmelidir.' };
    }

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const cleanFirstName = data.firstName.trim() || 'Misafir';
    const cleanLastName = data.lastName.trim() || '(Bilgi sonradan girilecek)';

    const newGuest: GuestEntry = {
      id: `gst-${Date.now().toString(36)}`,
      siteId: currentSiteId,
      guestType: data.guestType,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      fullName: `${cleanFirstName} ${cleanLastName}`,
      block: data.block,
      apartment: data.apartment,
      residentName: data.residentName,
      expectedDate: 'Bugün',
      expectedTime: timeStr,
      entryTime: timeStr,
      status: 'giris_yapti',
      plateNumber: data.plateNumber?.trim() || undefined,
      vehicleBrandModel: data.vehicleBrandModel?.trim() || undefined,
      vehicleColor: data.vehicleColor?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
      createdAt: `Bugün ${timeStr}`,
      source: 'guvenlik',
    };

    setAllGuests((prev) => [newGuest, ...prev]);
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

    // Sakin tercih yaptığında güvenlik ekranında sesli uyarı oluşturulmalı
    if (updatedTarget) {
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
    setSecurityCargoAlert(null);
    playSuccessChime();
  };

  const deliverCargo = (cargoId: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setAllCargo((prev) =>
      prev.map((c) => {
        if (c.id === cargoId) {
          return {
            ...c,
            deliveryStatus: 'teslim_edildi',
            deliveredAt: `Bugün ${timeStr}`,
          };
        }
        return c;
      })
    );
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
  };

  const respondToSuggestion = (id: string, response: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setAllSuggestions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, adminResponse: response, status: 'yanitlandi', respondedAt: `Bugün ${timeStr}` } : s
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        isMobilePreview,
        setIsMobilePreview,
        // Multi-Site
        sites,
        currentSiteId,
        siteInfo: activeSite,
        setSiteInfo,
        switchSite,
        createAndRegisterSite,
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
        siteAdmins,
        addSiteAdmin,
        updateSiteAdmin,
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
        addGuest,
        updateGuestStatus,
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
