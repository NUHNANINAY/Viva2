/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  User as FirebaseUser,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Initialize Firestore with configured databaseId
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export interface VivaUserProfile {
  uid: string;
  email?: string;
  siteId: string;
  role: 'resident' | 'security' | 'admin' | 'staff' | 'guest';
  block?: string;
  apartment?: string;
  staffId?: string;
  name?: string;
  isActive: boolean;
  updatedAt: string;
}

// 0. Email/Password Authentication Helpers
export async function registerWithEmailPassword(
  email: string,
  password: string,
  profile: Omit<VivaUserProfile, 'uid' | 'updatedAt' | 'email'>
): Promise<{ user: FirebaseUser; profile: VivaUserProfile }> {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const user = cred.user;
  const userRef = doc(db, 'users', user.uid);
  const profileData: VivaUserProfile = {
    uid: user.uid,
    email: user.email || email.trim(),
    siteId: profile.siteId,
    role: profile.role,
    block: profile.block || '',
    apartment: profile.apartment || '',
    staffId: profile.staffId || '',
    name: profile.name || '',
    isActive: profile.isActive !== false,
    updatedAt: new Date().toISOString(),
  };
  await setDoc(userRef, profileData, { merge: true });
  return { user, profile: profileData };
}

export async function loginWithEmailPassword(
  email: string,
  password: string
): Promise<{ user: FirebaseUser; profile: VivaUserProfile | null }> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  const user = cred.user;
  let profile: VivaUserProfile | null = null;
  try {
    const userSnap = await getDoc(doc(db, 'users', user.uid));
    if (userSnap.exists()) {
      profile = userSnap.data() as VivaUserProfile;
    }
  } catch (err) {
    console.warn('Profile fetch notice:', err);
  }
  return { user, profile };
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function resetPasswordForEmail(email: string): Promise<{ success: boolean; message: string }> {
  try {
    await sendPasswordResetEmail(auth, email.trim());
    return {
      success: true,
      message: `${email} adresine şifre sıfırlama bağlantısı gönderildi. Lütfen gelen kutunuzu kontrol ediniz.`,
    };
  } catch (err: any) {
    if (err.code === 'auth/user-not-found') {
      return { success: false, message: 'Bu e-posta adresine ait kayıtlı kullanıcı bulunamadı.' };
    }
    return { success: false, message: err.message || 'Şifre sıfırlama talebi iletilemedi.' };
  }
}

export async function changeCurrentUserPassword(newPass: string): Promise<{ success: boolean; message: string }> {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, message: 'Aktif oturum bulunamadı. Lütfen önce giriş yapınız.' };
  }
  try {
    await updatePassword(user, newPass);
    return { success: true, message: 'Parolanız başarıyla güncellendi.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Parola güncellenemedi.' };
  }
}

// Check if Email/Password provider is active in Firebase Console
export async function checkEmailPasswordStatus(): Promise<{ enabled: boolean; error?: string }> {
  try {
    // Attempting a lookup with dummy credentials checks if the endpoint rejects with operation-not-allowed
    await signInWithEmailAndPassword(auth, '__auth_probe__@viva.local', 'ProbePass123!');
    return { enabled: true };
  } catch (err: any) {
    if (err.code === 'auth/operation-not-allowed') {
      return {
        enabled: false,
        error: 'Firebase Console üzerinde E-posta/Şifre (Email/Password) sağlayıcısı henüz etkinleştirilmedi.',
      };
    }
    // Any other error (like user-not-found, invalid-credential) means the provider IS ENABLED!
    return { enabled: true };
  }
}

// Ensure Firebase Auth session (returns current authenticated user)
export async function ensureFirebaseAuth(): Promise<FirebaseUser | null> {
  return auth.currentUser;
}

// Sync user session claims to /users/{uid} for Firestore Security Rules
export async function syncUserProfile(profile: {
  siteId: string;
  role: 'resident' | 'security' | 'admin' | 'staff' | 'guest';
  block?: string;
  apartment?: string;
  staffId?: string;
  name?: string;
  isActive?: boolean;
}): Promise<VivaUserProfile | null> {
  try {
    const user = await ensureFirebaseAuth();
    if (!user) return null;
    const userRef = doc(db, 'users', user.uid);
    const profileData: VivaUserProfile = {
      uid: user.uid,
      siteId: profile.siteId,
      role: profile.role,
      block: profile.block || '',
      apartment: profile.apartment || '',
      staffId: profile.staffId || '',
      name: profile.name || '',
      isActive: profile.isActive !== false,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(userRef, profileData, { merge: true });
    return profileData;
  } catch (err) {
    console.warn('Sync user profile notice:', err);
    return null;
  }
}

export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
} as const;

export type OperationType = typeof OperationType[keyof typeof OperationType];

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notification:', JSON.stringify(errInfo));
  return errInfo;
}

// Test live server connection on startup
export async function testConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    const snap = await getDocs(collection(db, 'sites'));
    return { connected: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn('Firestore connection check notice:', msg);
    return { connected: false, error: msg };
  }
}

// 1. Real-time listener for ALL sites across devices (Phone A & Phone B sync)
export function subscribeToAllSites(callback: (sites: any[]) => void) {
  const path = 'sites';
  return onSnapshot(
    collection(db, 'sites'),
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(list);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

// 2. Real-time listener for single active site details
export function subscribeToSite(siteId: string, callback: (data: any) => void) {
  const path = `sites/${siteId}`;
  return onSnapshot(
    doc(db, 'sites', siteId),
    (snap) => {
      if (snap.exists()) {
        callback(snap.data());
      }
    },
    (err) => handleFirestoreError(err, OperationType.GET, path)
  );
}

// 3. Subcollection Listeners
export function subscribeToResidents(siteId: string, callback: (residents: any[]) => void) {
  const path = `sites/${siteId}/residents`;
  return onSnapshot(
    collection(db, 'sites', siteId, 'residents'),
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(list);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

export function subscribeToGuards(siteId: string, callback: (guards: any[]) => void) {
  const path = `sites/${siteId}/guards`;
  return onSnapshot(
    collection(db, 'sites', siteId, 'guards'),
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(list);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

export function subscribeToAdmins(siteId: string, callback: (admins: any[]) => void) {
  const path = `sites/${siteId}/admins`;
  return onSnapshot(
    collection(db, 'sites', siteId, 'admins'),
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(list);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

export function subscribeToGuests(siteId: string, callback: (guests: any[]) => void) {
  const path = `sites/${siteId}/guests`;
  return onSnapshot(
    collection(db, 'sites', siteId, 'guests'),
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(list);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

export function subscribeToOrders(siteId: string, callback: (orders: any[]) => void) {
  const path = `sites/${siteId}/orders`;
  return onSnapshot(
    collection(db, 'sites', siteId, 'orders'),
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(list);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

export function subscribeToCargos(siteId: string, callback: (cargos: any[]) => void) {
  const path = `sites/${siteId}/cargos`;
  return onSnapshot(
    collection(db, 'sites', siteId, 'cargos'),
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(list);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

export function subscribeToSuggestions(siteId: string, callback: (items: any[]) => void) {
  const path = `sites/${siteId}/suggestions`;
  return onSnapshot(
    collection(db, 'sites', siteId, 'suggestions'),
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(list);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

export function subscribeToFacilityEntries(siteId: string, callback: (entries: any[]) => void) {
  const path = `sites/${siteId}/facilityEntries`;
  return onSnapshot(
    collection(db, 'sites', siteId, 'facilityEntries'),
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(list);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

export function subscribeToStaff(siteId: string, callback: (staff: any[]) => void) {
  const path = `sites/${siteId}/staff`;
  return onSnapshot(
    collection(db, 'sites', siteId, 'staff'),
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(list);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

export function subscribeToTimeRecords(siteId: string, callback: (records: any[]) => void) {
  const path = `sites/${siteId}/timeRecords`;
  return onSnapshot(
    collection(db, 'sites', siteId, 'timeRecords'),
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(list);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

export function subscribeToDues(
  siteId: string,
  callback: (dues: any[]) => void,
  filter?: { block?: string; apartment?: string }
) {
  const path = `sites/${siteId}/dues`;
  const duesCol = collection(db, 'sites', siteId, 'dues');
  const duesQuery =
    filter?.block && filter?.apartment
      ? query(duesCol, where('block', '==', filter.block), where('apartment', '==', filter.apartment))
      : duesCol;

  return onSnapshot(
    duesQuery,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(list);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

export function subscribeToPayrollRecords(siteId: string, callback: (payroll: any[]) => void) {
  const path = `sites/${siteId}/payrollRecords`;
  return onSnapshot(
    collection(db, 'sites', siteId, 'payrollRecords'),
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(list);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

// 4. Cloud Write & Sync helpers
export async function syncSiteDoc(siteId: string, data: any) {
  const path = `sites/${siteId}`;
  try {
    await setDoc(doc(db, 'sites', siteId), data, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteSiteDoc(siteId: string) {
  const path = `sites/${siteId}`;
  try {
    await deleteDoc(doc(db, 'sites', siteId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function syncResidentDoc(siteId: string, residentId: string, data: any) {
  const path = `sites/${siteId}/residents/${residentId}`;
  try {
    await setDoc(doc(db, 'sites', siteId, 'residents', residentId), data, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function removeResidentDoc(siteId: string, residentId: string) {
  const path = `sites/${siteId}/residents/${residentId}`;
  try {
    await deleteDoc(doc(db, 'sites', siteId, 'residents', residentId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function syncGuardDoc(siteId: string, guardId: string, data: any) {
  const path = `sites/${siteId}/guards/${guardId}`;
  try {
    await setDoc(doc(db, 'sites', siteId, 'guards', guardId), data, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncAdminDoc(siteId: string, adminId: string, data: any) {
  const path = `sites/${siteId}/admins/${adminId}`;
  try {
    await setDoc(doc(db, 'sites', siteId, 'admins', adminId), data, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncGuestDoc(siteId: string, guestId: string, data: any) {
  const path = `sites/${siteId}/guests/${guestId}`;
  try {
    await setDoc(doc(db, 'sites', siteId, 'guests', guestId), data, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncOrderDoc(siteId: string, orderId: string, data: any) {
  const path = `sites/${siteId}/orders/${orderId}`;
  try {
    await setDoc(doc(db, 'sites', siteId, 'orders', orderId), data, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncCargoDoc(siteId: string, cargoId: string, data: any) {
  const path = `sites/${siteId}/cargos/${cargoId}`;
  try {
    await setDoc(doc(db, 'sites', siteId, 'cargos', cargoId), data, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncSuggestionDoc(siteId: string, suggestionId: string, data: any) {
  const path = `sites/${siteId}/suggestions/${suggestionId}`;
  try {
    await setDoc(doc(db, 'sites', siteId, 'suggestions', suggestionId), data, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncFacilityDoc(siteId: string, facilityId: string, data: any) {
  const path = `sites/${siteId}/facilityEntries/${facilityId}`;
  try {
    await setDoc(doc(db, 'sites', siteId, 'facilityEntries', facilityId), data, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function removeFacilityDoc(siteId: string, facilityId: string) {
  const path = `sites/${siteId}/facilityEntries/${facilityId}`;
  try {
    await deleteDoc(doc(db, 'sites', siteId, 'facilityEntries', facilityId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function syncStaffDoc(siteId: string, staffId: string, data: any) {
  const path = `sites/${siteId}/staff/${staffId}`;
  try {
    await setDoc(doc(db, 'sites', siteId, 'staff', staffId), data, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function removeStaffDoc(siteId: string, staffId: string) {
  const path = `sites/${siteId}/staff/${staffId}`;
  try {
    await deleteDoc(doc(db, 'sites', siteId, 'staff', staffId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function syncTimeRecordDoc(siteId: string, recordId: string, data: any) {
  const path = `sites/${siteId}/timeRecords/${recordId}`;
  try {
    await setDoc(doc(db, 'sites', siteId, 'timeRecords', recordId), data, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function removeTimeRecordDoc(siteId: string, recordId: string) {
  const path = `sites/${siteId}/timeRecords/${recordId}`;
  try {
    await deleteDoc(doc(db, 'sites', siteId, 'timeRecords', recordId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function syncDueDoc(siteId: string, dueId: string, data: any) {
  const path = `sites/${siteId}/dues/${dueId}`;
  try {
    await setDoc(doc(db, 'sites', siteId, 'dues', dueId), data, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function removeDueDoc(siteId: string, dueId: string) {
  const path = `sites/${siteId}/dues/${dueId}`;
  try {
    await deleteDoc(doc(db, 'sites', siteId, 'dues', dueId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function syncPayrollRecordDoc(siteId: string, recordId: string, data: any) {
  const path = `sites/${siteId}/payrollRecords/${recordId}`;
  try {
    await setDoc(doc(db, 'sites', siteId, 'payrollRecords', recordId), data, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// 5. Automatic Migration from localStorage to Firestore Cloud
export async function migrateLocalSitesToFirestore(localSites: any[], allResidents: any[], allGuards: any[], allAdmins: any[]) {
  if (!Array.isArray(localSites) || localSites.length === 0) return;

  for (const site of localSites) {
    if (!site || !site.id) continue;
    try {
      // Check if site already exists in Firestore
      const siteDocRef = doc(db, 'sites', site.id);
      const existingSnap = await getDoc(siteDocRef);

      if (!existingSnap.exists()) {
        // Upload site doc to Firestore
        await setDoc(siteDocRef, {
          ...site,
          migratedAt: new Date().toISOString(),
        });

        // Upload associated residents
        const siteRes = allResidents.filter((r) => r.siteId === site.id);
        for (const res of siteRes) {
          await setDoc(doc(db, 'sites', site.id, 'residents', res.id), res, { merge: true });
        }

        // Upload associated guards
        const siteGuards = allGuards.filter((g) => g.siteId === site.id);
        for (const guard of siteGuards) {
          await setDoc(doc(db, 'sites', site.id, 'guards', guard.id), guard, { merge: true });
        }

        // Upload associated admins
        const siteAdmins = allAdmins.filter((a) => a.siteId === site.id);
        for (const admin of siteAdmins) {
          await setDoc(doc(db, 'sites', site.id, 'admins', admin.id), admin, { merge: true });
        }
      }
    } catch (e) {
      console.warn(`Migration notice for site ${site.id}:`, e);
    }
  }
}
