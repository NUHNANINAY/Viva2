/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Site,
  UserRole,
  ResidentUser,
  AdminUser,
  SecurityUser,
  SecurityGuardAccount,
  GuestNotification,
  OrderNotification,
  CargoPackage,
  SuggestionOrComplaint,
  SiteAnnouncement,
  ParkingType,
  IndoorEscortOption,
} from '../types';
import { hashPassword } from '../utils/crypto';
import { playLuxuryChime, playGateAlertChime } from '../utils/audio';
import {
  INITIAL_SITES,
  DEMO_RESIDENT,
  DEMO_ADMIN,
  DEMO_SECURITY,
  INITIAL_CARGO_LIST,
  INITIAL_GUEST_LIST,
  INITIAL_ORDER_LIST,
  INITIAL_SUGGESTIONS,
  INITIAL_ANNOUNCEMENTS,
} from '../data/initialData';

interface AppContextType {
  sites: Site[];
  currentSite: Site;
  currentRole: UserRole | null;
  residentUser: ResidentUser;
  adminUser: AdminUser;
  securityUser: SecurityUser;
  cargoList: CargoPackage[];
  guestList: GuestNotification[];
  orderList: OrderNotification[];
  suggestionList: SuggestionOrComplaint[];
  announcements: SiteAnnouncement[];
  hasSeenAd: boolean;
  showAdModal: boolean;
  showDriveModal: boolean;
  isMobilePreview: boolean;

  // Actions
  selectSite: (siteId: string) => void;
  addNewSite: (site: Omit<Site, 'id' | 'createdAt'>) => string;
  setRole: (role: UserRole | null) => void;
  logoutRole: () => void;
  returnToMainMenu: () => void;
  markAdAsSeen: () => void;
  triggerAdForTesting: () => void;
  closeAdModal: () => void;
  setShowDriveModal: (show: boolean) => void;
  toggleDriveConnection: (connected: boolean) => void;
  setIsMobilePreview: (value: boolean | ((prev: boolean) => boolean)) => void;

  // Guest actions
  addResidentGuest: (data: {
    guestFirstName: string;
    guestLastName: string;
    hasVehicle: boolean;
    plateNumber?: string;
    vehicleBrandModel?: string;
    vehicleColor?: string;
    parkingType?: ParkingType;
    indoorEscortOption?: IndoorEscortOption;
    note?: string;
  }) => { success: boolean; error?: string };
  addSecurityGuest: (data: {
    guestFirstName: string;
    guestLastName: string;
    hasVehicle: boolean;
    plateNumber?: string;
    vehicleBrandModel?: string;
    vehicleColor?: string;
    targetBlock: string;
    targetApartment: number;
    note?: string;
  }) => { success: boolean; error?: string };
  markGuestEntry: (id: string) => void;
  markGuestAsSeen: (id: string) => void;
  latestGuestAlert: {
    guestId: string;
    message: string;
    guest: GuestNotification;
    timestamp: number;
  } | null;
  clearGuestAlert: () => void;
  addGuest: (data: {
    guestName: string;
    hasVehicle: boolean;
    plateNumber?: string;
    parkingOption?: GuestNotification['parkingOption'];
    isImmediate?: boolean;
    scheduledDate?: string;
    scheduledTime?: string;
    note?: string;
  }) => void;
  updateGuestStatus: (id: string, status: GuestNotification['status']) => void;

  // Forgot password flow
  requestPasswordResetSms: (
    role: 'admin' | 'security' | 'resident',
    identifier: string
  ) => Promise<{ success: boolean; error?: string; demoCode?: string; maskedPhone?: string }>;
  verifyAndResetPassword: (
    role: 'admin' | 'security' | 'resident',
    identifier: string,
    code: string,
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;

  // Notification and background permissions
  permissionsState: {
    push: string;
    audio: boolean;
    backgroundGuideSeen: boolean;
  };
  requestPushPermission: () => Promise<string>;
  markBackgroundGuideSeen: () => void;

  // Order actions
  addOrder: (data: {
    company: string;
    deliveryLocation: OrderNotification['deliveryLocation'];
    notificationPreference: OrderNotification['notificationPreference'];
    courierNote?: string;
  }) => void;
  updateOrderStatus: (id: string, status: OrderNotification['status']) => void;

  // Cargo actions
  addCargo: (data: {
    trackingCode?: string;
    carrier: CargoPackage['carrier'];
    otherCarrierName?: string;
    block: string;
    apartment: number;
    recipientName?: string;
    deliveryOption?: CargoPackage['deliveryOption'];
    notes?: string;
  }) => void;
  addBatchCargo: (items: Array<{
    trackingCode?: string;
    carrier: CargoPackage['carrier'];
    otherCarrierName?: string;
    block: string;
    apartment: number;
    recipientName?: string;
    notes?: string;
  }>) => void;
  respondCargoDelivery: (
    cargoId: string,
    choice: 'send_to_apartment' | 'hold_at_security',
    smsCode?: string
  ) => void;
  physicallyReceiveCargo: (cargoId: string) => void;
  deliverCargoToResident: (cargoId: string) => void;
  deleteCargo: (cargoId: string) => void;
  updateCargoStatus: (id: string, status: CargoPackage['status']) => void;
  latestResidentResponse: { cargoId: string; message: string; timestamp: number } | null;
  clearLatestResidentResponse: () => void;

  // Suggestion actions
  addSuggestion: (data: {
    title: string;
    category: SuggestionOrComplaint['category'];
    urgency: SuggestionOrComplaint['urgency'];
    message: string;
  }) => void;
  replyToSuggestion: (id: string, reply: string, status: SuggestionOrComplaint['status']) => void;

  // Security Guards Management
  activeGuard: SecurityGuardAccount | null;
  hasGuardsForSite: (siteId: string) => boolean;
  getGuardsForSite: (siteId: string) => SecurityGuardAccount[];
  saveGuardsForSite: (siteId: string, guards: SecurityGuardAccount[]) => void;
  loginSecurityGuard: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  resetGuardsForSite: (siteId: string) => void;

  // Reset
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Sites
  const [sites, setSites] = useState<Site[]>(() => {
    try {
      const saved = localStorage.getItem('viva_sites');
      return saved ? JSON.parse(saved) : INITIAL_SITES;
    } catch {
      return INITIAL_SITES;
    }
  });

  const [currentSiteId, setCurrentSiteId] = useState<string>(() => {
    try {
      return localStorage.getItem('viva_current_site_id') || INITIAL_SITES[0].id;
    } catch {
      return INITIAL_SITES[0].id;
    }
  });

  // Current Role: 'resident' | 'admin' | 'security' | null (null = login screen)
  const [currentRole, setCurrentRole] = useState<UserRole | null>(() => {
    try {
      const saved = localStorage.getItem('viva_current_role');
      if (saved === 'security') {
        const siteId = localStorage.getItem('viva_current_site_id') || INITIAL_SITES[0].id;
        const active = localStorage.getItem(`viva_active_guard_${siteId}`);
        if (!active) return null; // Do not auto-login to security without active guard session
      }
      return (saved as UserRole) || null;
    } catch {
      return null;
    }
  });

  // Ad Screen
  const [hasSeenAd, setHasSeenAd] = useState<boolean>(() => {
    try {
      return localStorage.getItem('viva_has_seen_ad') === 'true';
    } catch {
      return false;
    }
  });
  const [showAdModal, setShowAdModal] = useState<boolean>(false);

  // Google Drive Modal
  const [showDriveModal, setShowDriveModal] = useState<boolean>(false);
  const [hasSeenDriveSetup, setHasSeenDriveSetup] = useState<boolean>(() => {
    try {
      return localStorage.getItem('viva_has_seen_drive_setup') === 'true';
    } catch {
      return false;
    }
  });

  // Mobile preview toggle (lets desktop users see in sleek smartphone bezel or full screen)
  const [isMobilePreview, setIsMobilePreview] = useState<boolean>(false);

  // Users
  const [residentUser] = useState<ResidentUser>(DEMO_RESIDENT);
  const [adminUser, setAdminUser] = useState<AdminUser>(() => {
    try {
      const saved = localStorage.getItem('viva_admin_user');
      return saved ? JSON.parse(saved) : DEMO_ADMIN;
    } catch {
      return DEMO_ADMIN;
    }
  });
  // Security Guards state
  const [activeGuard, setActiveGuard] = useState<SecurityGuardAccount | null>(() => {
    try {
      const saved = localStorage.getItem(`viva_active_guard_${currentSiteId}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [securityUser, setSecurityUser] = useState<SecurityUser>(() => {
    try {
      const saved = localStorage.getItem(`viva_active_guard_${currentSiteId}`);
      if (saved) {
        const guard = JSON.parse(saved) as SecurityGuardAccount;
        return {
          id: guard.id,
          name: `${guard.firstName} ${guard.lastName}`,
          username: guard.username,
          shift: guard.shift || 'Gündüz / Gece Vardiyası',
          gateName: guard.gateName || 'A Kapısı Ana Giriş Nizamiyesi',
          phone: '+90 216 412 8801',
        };
      }
    } catch { /* ignore */ }
    return DEMO_SECURITY;
  });

  // Content state
  const [latestResidentResponse, setLatestResidentResponse] = useState<{
    cargoId: string;
    message: string;
    timestamp: number;
  } | null>(null);

  const [latestGuestAlert, setLatestGuestAlert] = useState<{
    guestId: string;
    message: string;
    guest: GuestNotification;
    timestamp: number;
  } | null>(null);

  const [permissionsState, setPermissionsState] = useState<{
    push: string;
    audio: boolean;
    backgroundGuideSeen: boolean;
  }>(() => {
    try {
      const saved = localStorage.getItem('viva_permissions');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return {
      push: typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default',
      audio: true,
      backgroundGuideSeen: false,
    };
  });

  const [cargoList, setCargoList] = useState<CargoPackage[]>(() => {
    try {
      const saved = localStorage.getItem('viva_cargos');
      if (saved) {
        const parsed: CargoPackage[] = JSON.parse(saved);
        // Ensure no legacy dummy cargos persist from earlier runs
        return parsed.filter(
          (c) =>
            !['crg-101', 'crg-102', 'crg-103', 'crg-104', 'crg-105'].includes(c.id) &&
            !['Zeynep Aksoy', 'Emre Çetin', 'Mehmet Yılmaz'].includes(c.recipientName || '')
        );
      }
      return INITIAL_CARGO_LIST;
    } catch {
      return INITIAL_CARGO_LIST;
    }
  });

  const [guestList, setGuestList] = useState<GuestNotification[]>(() => {
    try {
      const saved = localStorage.getItem('viva_guests');
      if (saved) {
        const parsed: GuestNotification[] = JSON.parse(saved);
        // Ensure no dummy names persist from earlier runs
        return parsed.filter(
          (g) => !['Kerem Serhatlı', 'Cemre & Bora Alkan', 'Canan Güneş'].includes(g.guestName)
        );
      }
      return INITIAL_GUEST_LIST;
    } catch {
      return INITIAL_GUEST_LIST;
    }
  });

  const [orderList, setOrderList] = useState<OrderNotification[]>(() => {
    try {
      const saved = localStorage.getItem('viva_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDER_LIST;
    } catch {
      return INITIAL_ORDER_LIST;
    }
  });

  const [suggestionList, setSuggestionList] = useState<SuggestionOrComplaint[]>(() => {
    try {
      const saved = localStorage.getItem('viva_suggestions');
      return saved ? JSON.parse(saved) : INITIAL_SUGGESTIONS;
    } catch {
      return INITIAL_SUGGESTIONS;
    }
  });

  const [announcements] = useState<SiteAnnouncement[]>(INITIAL_ANNOUNCEMENTS);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('viva_sites', JSON.stringify(sites));
    } catch { /* ignore */ }
  }, [sites]);

  useEffect(() => {
    try {
      localStorage.setItem('viva_current_site_id', currentSiteId);
    } catch { /* ignore */ }
  }, [currentSiteId]);

  useEffect(() => {
    try {
      if (currentRole) {
        localStorage.setItem('viva_current_role', currentRole);
      } else {
        localStorage.removeItem('viva_current_role');
      }
    } catch { /* ignore */ }
  }, [currentRole]);

  useEffect(() => {
    try {
      localStorage.setItem('viva_cargos', JSON.stringify(cargoList));
    } catch { /* ignore */ }
  }, [cargoList]);

  useEffect(() => {
    try {
      localStorage.setItem('viva_guests', JSON.stringify(guestList));
    } catch { /* ignore */ }
  }, [guestList]);

  useEffect(() => {
    try {
      localStorage.setItem('viva_orders', JSON.stringify(orderList));
    } catch { /* ignore */ }
  }, [orderList]);

  useEffect(() => {
    try {
      localStorage.setItem('viva_suggestions', JSON.stringify(suggestionList));
    } catch { /* ignore */ }
  }, [suggestionList]);

  useEffect(() => {
    try {
      localStorage.setItem('viva_admin_user', JSON.stringify(adminUser));
    } catch { /* ignore */ }
  }, [adminUser]);

  const currentSite = sites.find((s) => s.id === currentSiteId) || sites[0];

  const selectSite = (siteId: string) => {
    setCurrentSiteId(siteId);
    try {
      const savedGuard = localStorage.getItem(`viva_active_guard_${siteId}`);
      if (savedGuard) {
        const guard = JSON.parse(savedGuard) as SecurityGuardAccount;
        setActiveGuard(guard);
        setSecurityUser({
          id: guard.id,
          name: `${guard.firstName} ${guard.lastName}`,
          username: guard.username,
          shift: guard.shift || 'Gündüz / Gece Vardiyası',
          gateName: guard.gateName || 'A Kapısı Ana Giriş Nizamiyesi',
          phone: sites.find((s) => s.id === siteId)?.securityPhone || '+90 216 412 8801',
        });
      } else {
        setActiveGuard(null);
      }
    } catch {
      setActiveGuard(null);
    }
  };

  const hasGuardsForSite = (siteId: string): boolean => {
    try {
      const raw = localStorage.getItem(`viva_security_guards_${siteId}`);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length >= 6;
    } catch {
      return false;
    }
  };

  const getGuardsForSite = (siteId: string): SecurityGuardAccount[] => {
    try {
      const raw = localStorage.getItem(`viva_security_guards_${siteId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveGuardsForSite = (siteId: string, guards: SecurityGuardAccount[]) => {
    try {
      localStorage.setItem(`viva_security_guards_${siteId}`, JSON.stringify(guards));
    } catch { /* ignore */ }
  };

  const resetGuardsForSite = (siteId: string) => {
    try {
      localStorage.removeItem(`viva_security_guards_${siteId}`);
      localStorage.removeItem(`viva_active_guard_${siteId}`);
      if (currentSiteId === siteId) {
        setActiveGuard(null);
      }
    } catch { /* ignore */ }
  };

  const loginSecurityGuard = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const guards = getGuardsForSite(currentSiteId);
    if (!guards || guards.length === 0) {
      return { success: false, error: 'Bu site için henüz güvenlik personeli tanımlanmamış.' };
    }
    const inputHash = await hashPassword(password);
    const matched = guards.find(
      (g) =>
        g.username.trim().toLowerCase() === username.trim().toLowerCase() &&
        g.passwordHash === inputHash
    );
    if (!matched) {
      return { success: false, error: 'Hatalı kullanıcı adı veya şifre.' };
    }
    setActiveGuard(matched);
    const updatedSecUser: SecurityUser = {
      id: matched.id,
      name: `${matched.firstName} ${matched.lastName}`,
      username: matched.username,
      shift: matched.shift || 'Gündüz / Gece Vardiyası',
      gateName: matched.gateName || 'A Kapısı Ana Giriş Nizamiyesi',
      phone: currentSite.securityPhone || '+90 216 412 8801',
    };
    setSecurityUser(updatedSecUser);
    try {
      localStorage.setItem(`viva_active_guard_${currentSiteId}`, JSON.stringify(matched));
    } catch { /* ignore */ }
    setRole('security');
    return { success: true };
  };

  const addNewSite = (siteData: Omit<Site, 'id' | 'createdAt'>): string => {
    const newId = `site-custom-${Date.now()}`;
    const newSite: Site = {
      ...siteData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
      isCustom: true,
    };
    const updated = [newSite, ...sites];
    setSites(updated);
    setCurrentSiteId(newId);

    // If initial registration, show 8-second ad screen if not seen
    if (!hasSeenAd) {
      setShowAdModal(true);
    }

    return newId;
  };

  const setRole = (role: UserRole | null) => {
    setCurrentRole(role);

    // If first admin login, check if Google Drive onboarding should show
    if (role === 'admin' && !hasSeenDriveSetup) {
      setShowDriveModal(true);
      setHasSeenDriveSetup(true);
      localStorage.setItem('viva_has_seen_drive_setup', 'true');
    }

    // If first time entering app and haven't seen ad, trigger ad
    if (role && !hasSeenAd) {
      setShowAdModal(true);
    }
  };

  const logoutRole = () => {
    if (currentRole === 'security') {
      try {
        localStorage.removeItem(`viva_active_guard_${currentSiteId}`);
      } catch { /* ignore */ }
      setActiveGuard(null);
    }
    setCurrentRole(null);
  };

  const returnToMainMenu = () => {
    setCurrentRole(null);
  };

  const markAdAsSeen = () => {
    setHasSeenAd(true);
    setShowAdModal(false);
    localStorage.setItem('viva_has_seen_ad', 'true');
  };

  const triggerAdForTesting = () => {
    setShowAdModal(true);
  };

  const closeAdModal = () => {
    markAdAsSeen();
  };

  const toggleDriveConnection = (connected: boolean) => {
    setAdminUser((prev) => ({
      ...prev,
      driveConnected: connected,
      driveSyncDate: connected ? 'Bugün 14:30 (Demo Senkronize)' : undefined,
    }));
  };

  // Guest actions
  const addResidentGuest = (data: {
    guestFirstName: string;
    guestLastName: string;
    hasVehicle: boolean;
    plateNumber?: string;
    vehicleBrandModel?: string;
    vehicleColor?: string;
    parkingType?: ParkingType;
    indoorEscortOption?: IndoorEscortOption;
    note?: string;
  }): { success: boolean; error?: string } => {
    const firstName = data.guestFirstName.trim();
    const lastName = data.guestLastName.trim();
    const fullName = `${firstName} ${lastName}`.trim();
    if (!fullName) return { success: false, error: 'Misafir adı ve soyadı zorunludur.' };

    // Prevent duplicate active submission
    const duplicate = guestList.find(
      (g) =>
        g.siteId === currentSiteId &&
        g.residentBlock === residentUser.block &&
        g.residentApartment === residentUser.apartment &&
        g.guestName.toLowerCase() === fullName.toLowerCase() &&
        g.status === 'bekleniyor'
    );
    if (duplicate) {
      return { success: false, error: 'Bu misafir için aktif bir beklenen bildirim zaten mevcut.' };
    }

    const timeStr = 'Bugün ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    const newGuest: GuestNotification = {
      id: `gst-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      siteId: currentSiteId,
      residentName: residentUser.name,
      residentBlock: residentUser.block,
      residentApartment: residentUser.apartment,
      guestFirstName: firstName,
      guestLastName: lastName,
      guestName: fullName,
      hasVehicle: data.hasVehicle,
      plateNumber: data.hasVehicle && data.plateNumber?.trim() ? data.plateNumber.trim().toUpperCase() : undefined,
      vehicleBrandModel: data.hasVehicle ? data.vehicleBrandModel?.trim() : undefined,
      vehicleColor: data.hasVehicle ? data.vehicleColor?.trim() : undefined,
      parkingType: data.hasVehicle ? data.parkingType : 'none',
      indoorEscortOption: data.hasVehicle && data.parkingType === 'kapali_otopark' ? data.indoorEscortOption : undefined,
      registrationSource: 'resident',
      status: 'bekleniyor',
      createdAt: timeStr,
      isSeenBySecurity: false,
      note: data.note?.trim(),
      isDemo: true,
    };

    setGuestList((prev) => [newGuest, ...prev]);

    // Play gate alert chime
    playGateAlertChime();

    // Alert security console
    setLatestGuestAlert({
      guestId: newGuest.id,
      message: `${residentUser.block} Blok D:${residentUser.apartment} (${residentUser.name}) yeni misafir bildirdi: ${fullName}${
        data.hasVehicle && newGuest.plateNumber ? ` [${newGuest.plateNumber}]` : ''
      }`,
      guest: newGuest,
      timestamp: Date.now(),
    });

    return { success: true };
  };

  const addSecurityGuest = (data: {
    guestFirstName: string;
    guestLastName: string;
    hasVehicle: boolean;
    plateNumber?: string;
    vehicleBrandModel?: string;
    vehicleColor?: string;
    targetBlock: string;
    targetApartment: number;
    note?: string;
  }): { success: boolean; error?: string } => {
    const firstName = data.guestFirstName.trim();
    const lastName = data.guestLastName.trim();
    const fullName = `${firstName} ${lastName}`.trim();
    const timeStr = 'Bugün ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    const newGuest: GuestNotification = {
      id: `gst-sec-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      siteId: currentSiteId,
      residentName: data.targetBlock === 'A' && data.targetApartment === 5 ? 'Ufuk Gültekin' : `Sakin (${data.targetBlock}-${data.targetApartment})`,
      residentBlock: data.targetBlock,
      residentApartment: Number(data.targetApartment),
      guestFirstName: firstName,
      guestLastName: lastName,
      guestName: fullName,
      hasVehicle: data.hasVehicle,
      plateNumber: data.hasVehicle && data.plateNumber?.trim() ? data.plateNumber.trim().toUpperCase() : undefined,
      vehicleBrandModel: data.hasVehicle ? data.vehicleBrandModel?.trim() : undefined,
      vehicleColor: data.hasVehicle ? data.vehicleColor?.trim() : undefined,
      parkingType: data.hasVehicle ? 'acik_otopark' : 'none',
      registrationSource: 'security',
      status: 'giris_yapti',
      createdAt: timeStr,
      entryTime: timeStr,
      isSeenBySecurity: true,
      note: data.note?.trim() || 'Nizamiyede doğrudan güvenlik tarafından kaydedildi.',
      isDemo: true,
    };

    setGuestList((prev) => [newGuest, ...prev]);
    return { success: true };
  };

  const markGuestEntry = (id: string) => {
    const timeStr = 'Bugün ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    setGuestList((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: 'giris_yapti', entryTime: timeStr, isSeenBySecurity: true } : g))
    );
    if (latestGuestAlert?.guestId === id) {
      setLatestGuestAlert(null);
    }
  };

  const markGuestAsSeen = (id: string) => {
    setGuestList((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isSeenBySecurity: true } : g))
    );
    if (latestGuestAlert?.guestId === id) {
      setLatestGuestAlert(null);
    }
  };

  const clearGuestAlert = () => {
    setLatestGuestAlert(null);
  };

  const addGuest = (data: {
    guestName: string;
    hasVehicle: boolean;
    plateNumber?: string;
    parkingOption?: GuestNotification['parkingOption'];
    isImmediate?: boolean;
    scheduledDate?: string;
    scheduledTime?: string;
    note?: string;
  }) => {
    const parts = data.guestName.trim().split(' ');
    const firstName = parts[0] || data.guestName;
    const lastName = parts.slice(1).join(' ') || '';
    addResidentGuest({
      guestFirstName: firstName,
      guestLastName: lastName,
      hasVehicle: data.hasVehicle,
      plateNumber: data.plateNumber,
      parkingType: data.hasVehicle ? 'acik_otopark' : 'none',
      note: data.note,
    });
  };

  const updateGuestStatus = (id: string, status: GuestNotification['status']) => {
    if (status === 'giris_yapti') {
      markGuestEntry(id);
    } else {
      setGuestList((prev) =>
        prev.map((g) => (g.id === id ? { ...g, status } : g))
      );
    }
  };

  // Password reset flow
  const requestPasswordResetSms = async (
    role: 'admin' | 'security' | 'resident',
    identifier: string
  ): Promise<{ success: boolean; error?: string; demoCode?: string; maskedPhone?: string }> => {
    const ident = identifier.trim().toLowerCase();
    if (!ident) return { success: false, error: 'Lütfen kullanıcı adı veya telefon numaranızı giriniz.' };

    if (role === 'security') {
      const guards = getGuardsForSite(currentSiteId);
      const guard = guards.find(
        (g) => g.username.toLowerCase() === ident || ident.includes(g.lastName.toLowerCase())
      );
      if (!guard) {
        return { success: false, error: 'Seçili sitede bu kullanıcı adına ait güvenlik personeli bulunamadı.' };
      }
      return {
        success: true,
        demoCode: '5832',
        maskedPhone: '+90 532 *** ** 44',
      };
    } else if (role === 'admin') {
      return {
        success: true,
        demoCode: '5832',
        maskedPhone: '+90 533 *** ** 00',
      };
    } else {
      return {
        success: true,
        demoCode: '5832',
        maskedPhone: '+90 532 *** ** 23',
      };
    }
  };

  const verifyAndResetPassword = async (
    role: 'admin' | 'security' | 'resident',
    identifier: string,
    code: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (code.trim() !== '5832' && code.trim() !== '1234') {
      return { success: false, error: 'Geçersiz veya süresi dolmuş SMS doğrulama kodu.' };
    }
    if (newPassword.trim().length < 4) {
      return { success: false, error: 'Yeni şifre en az 4 karakter olmalıdır.' };
    }

    if (role === 'security') {
      const guards = getGuardsForSite(currentSiteId);
      const ident = identifier.trim().toLowerCase();
      const guardIdx = guards.findIndex((g) => g.username.toLowerCase() === ident);
      if (guardIdx === -1) {
        return { success: false, error: 'Güvenlik personeli bulunamadı.' };
      }
      const newHash = await hashPassword(newPassword.trim());
      guards[guardIdx].passwordHash = newHash;
      saveGuardsForSite(currentSiteId, guards);
      return { success: true };
    }

    return { success: true };
  };

  // Permission settings
  const requestPushPermission = async (): Promise<string> => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        setPermissionsState((prev) => {
          const next = { ...prev, push: res };
          localStorage.setItem('viva_permissions', JSON.stringify(next));
          return next;
        });
        return res;
      } catch {
        return 'denied';
      }
    }
    return 'unsupported';
  };

  const markBackgroundGuideSeen = () => {
    setPermissionsState((prev) => {
      const next = { ...prev, backgroundGuideSeen: true };
      localStorage.setItem('viva_permissions', JSON.stringify(next));
      return next;
    });
  };

  // Order actions
  const addOrder = (data: {
    company: string;
    deliveryLocation: OrderNotification['deliveryLocation'];
    notificationPreference: OrderNotification['notificationPreference'];
    courierNote?: string;
  }) => {
    const newOrder: OrderNotification = {
      id: `ord-${Date.now()}`,
      residentName: residentUser.name,
      residentBlock: residentUser.block,
      residentApartment: residentUser.apartment,
      company: data.company,
      deliveryLocation: data.deliveryLocation,
      notificationPreference: data.notificationPreference,
      courierNote: data.courierNote,
      status: 'bekleniyor',
      createdAt: 'Az önce',
      isDemo: true,
    };
    setOrderList((prev) => [newOrder, ...prev]);
  };

  const updateOrderStatus = (id: string, status: OrderNotification['status']) => {
    setOrderList((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
  };

  // Cargo actions
  const addCargo = (data: {
    trackingCode?: string;
    carrier: CargoPackage['carrier'];
    otherCarrierName?: string;
    block: string;
    apartment: number;
    recipientName?: string;
    deliveryOption?: CargoPackage['deliveryOption'];
    notes?: string;
  }) => {
    const officer = activeGuard ? `${activeGuard.firstName} ${activeGuard.lastName}` : (securityUser.name || 'Nöbetçi Güvenlik Görevlisi');
    const newCargo: CargoPackage = {
      id: `crg-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      trackingCode: data.trackingCode?.trim() || `VR-${Math.floor(100000 + Math.random() * 900000)}`,
      carrier: data.carrier,
      otherCarrierName: data.otherCarrierName,
      block: data.block,
      apartment: Number(data.apartment),
      recipientName: data.recipientName || (data.block === 'A' && Number(data.apartment) === 5 ? 'Ufuk Gültekin' : `Sakin (${data.block} Blok D:${data.apartment})`),
      deliveryOption: data.deliveryOption || 'unspecified',
      status: 'yanit_bekliyor',
      receivedAt: 'Bugün ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      registeredBy: `Güvenlik - ${officer}`,
      notes: data.notes,
      isDemo: true,
    };
    setCargoList((prev) => [newCargo, ...prev]);
  };

  const addBatchCargo = (items: Array<{
    trackingCode?: string;
    carrier: CargoPackage['carrier'];
    otherCarrierName?: string;
    block: string;
    apartment: number;
    recipientName?: string;
    notes?: string;
  }>) => {
    const timeStr = 'Bugün ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const officer = activeGuard ? `${activeGuard.firstName} ${activeGuard.lastName}` : (securityUser.name || 'Nöbetçi Güvenlik Görevlisi');
    
    const newItems: CargoPackage[] = items.map((item, idx) => ({
      id: `crg-${Date.now()}-${idx}-${Math.floor(100 + Math.random() * 900)}`,
      trackingCode: item.trackingCode?.trim() || `VR-${Math.floor(100000 + Math.random() * 900000)}`,
      carrier: item.carrier,
      otherCarrierName: item.otherCarrierName,
      block: item.block,
      apartment: Number(item.apartment),
      recipientName: item.recipientName || (item.block === 'A' && Number(item.apartment) === 5 ? 'Ufuk Gültekin' : `Sakin (${item.block} Blok D:${item.apartment})`),
      deliveryOption: 'unspecified',
      status: 'yanit_bekliyor',
      receivedAt: timeStr,
      registeredBy: `Güvenlik - ${officer}`,
      notes: item.notes,
      isDemo: true,
    }));

    setCargoList((prev) => [...newItems, ...prev]);
  };

  const respondCargoDelivery = (
    cargoId: string,
    choice: 'send_to_apartment' | 'hold_at_security',
    smsCode?: string
  ) => {
    const timeStr = 'Bugün ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    let updatedTarget: CargoPackage | null = null;

    setCargoList((prev) =>
      prev.map((c) => {
        if (c.id === cargoId) {
          const isHome = choice === 'send_to_apartment';
          const hasSms = Boolean(smsCode && smsCode.trim().length > 0);
          const newStatus: CargoPackage['status'] = isHome
            ? 'eve_gonderilecek'
            : hasSms
            ? 'kodlu_onay'
            : 'kodsuz_onay';

          const updated: CargoPackage = {
            ...c,
            deliveryOption: choice,
            status: newStatus,
            approvalType: isHome ? undefined : hasSms ? 'kodlu_onay' : 'kodsuz_onay',
            smsCodeEntered: hasSms ? smsCode?.trim() : undefined,
            residentResponseAt: timeStr,
          };
          updatedTarget = updated;
          return updated;
        }
        return c;
      })
    );

    // Play pleasant concierge chime to notify security in real-time
    playLuxuryChime();

    if (updatedTarget) {
      const u = updatedTarget as CargoPackage;
      setLatestResidentResponse({
        cargoId,
        message: `${u.block} Blok D:${u.apartment} (${u.recipientName || 'Sakin'}) tercihi: ${
          choice === 'send_to_apartment' ? 'Eve Gönderilsin' : u.approvalType === 'kodlu_onay' ? 'Güvenlikte Emanet (Kodlu Onay)' : 'Güvenlikte Emanet (Kodsuz Onay)'
        }`,
        timestamp: Date.now(),
      });
    }
  };

  const physicallyReceiveCargo = (id: string) => {
    const timeStr = 'Bugün ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    setCargoList((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'fiziksel_teslim_alindi',
              physicallyReceivedAt: timeStr,
            }
          : c
      )
    );
  };

  const deliverCargoToResident = (id: string) => {
    const timeStr = 'Bugün ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    setCargoList((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'teslim_edildi',
              deliveredAt: timeStr,
            }
          : c
      )
    );
  };

  const deleteCargo = (id: string) => {
    setCargoList((prev) => prev.filter((c) => c.id !== id));
  };

  const clearLatestResidentResponse = () => {
    setLatestResidentResponse(null);
  };

  const updateCargoStatus = (id: string, status: CargoPackage['status']) => {
    const timeStr = 'Bugün ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    setCargoList((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status,
              deliveredAt: status === 'teslim_edildi' ? timeStr : c.deliveredAt,
            }
          : c
      )
    );
  };

  // Suggestion actions
  const addSuggestion = (data: {
    title: string;
    category: SuggestionOrComplaint['category'];
    urgency: SuggestionOrComplaint['urgency'];
    message: string;
  }) => {
    const newSug: SuggestionOrComplaint = {
      id: `sug-${Date.now()}`,
      residentName: residentUser.name,
      residentBlock: residentUser.block,
      residentApartment: residentUser.apartment,
      title: data.title,
      category: data.category,
      urgency: data.urgency,
      message: data.message,
      status: 'yeni',
      createdAt: 'Az önce',
      isDemo: true,
    };
    setSuggestionList((prev) => [newSug, ...prev]);
  };

  const replyToSuggestion = (id: string, reply: string, status: SuggestionOrComplaint['status']) => {
    setSuggestionList((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status,
              adminResponse: reply,
              respondedAt: 'Az önce',
            }
          : s
      )
    );
  };

  const resetDemoData = () => {
    setSites(INITIAL_SITES);
    setCurrentSiteId(INITIAL_SITES[0].id);
    setCargoList(INITIAL_CARGO_LIST);
    setGuestList(INITIAL_GUEST_LIST);
    setOrderList(INITIAL_ORDER_LIST);
    setSuggestionList(INITIAL_SUGGESTIONS);
    setAdminUser(DEMO_ADMIN);
    localStorage.removeItem('viva_sites');
    localStorage.removeItem('viva_cargos');
    localStorage.removeItem('viva_guests');
    localStorage.removeItem('viva_orders');
    localStorage.removeItem('viva_suggestions');
    localStorage.removeItem('viva_admin_user');
  };

  return (
    <AppContext.Provider
      value={{
        sites,
        currentSite,
        currentRole,
        residentUser,
        adminUser,
        securityUser,
        cargoList,
        guestList,
        orderList,
        suggestionList,
        announcements,
        hasSeenAd,
        showAdModal,
        showDriveModal,
        isMobilePreview,
        selectSite,
        addNewSite,
        setRole,
        logoutRole,
        returnToMainMenu,
        markAdAsSeen,
        triggerAdForTesting,
        closeAdModal,
        setShowDriveModal,
        toggleDriveConnection,
        setIsMobilePreview,
        addResidentGuest,
        addSecurityGuest,
        markGuestEntry,
        markGuestAsSeen,
        latestGuestAlert,
        clearGuestAlert,
        addGuest,
        updateGuestStatus,
        requestPasswordResetSms,
        verifyAndResetPassword,
        permissionsState,
        requestPushPermission,
        markBackgroundGuideSeen,
        addOrder,
        updateOrderStatus,
        addCargo,
        addBatchCargo,
        respondCargoDelivery,
        physicallyReceiveCargo,
        deliverCargoToResident,
        deleteCargo,
        updateCargoStatus,
        latestResidentResponse,
        clearLatestResidentResponse,
        addSuggestion,
        replyToSuggestion,
        activeGuard,
        hasGuardsForSite,
        getGuardsForSite,
        saveGuardsForSite,
        loginSecurityGuard,
        resetGuardsForSite,
        resetDemoData,
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
