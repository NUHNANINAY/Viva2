/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ClaimInviteResponse {
  success: boolean;
  block?: string;
  apartment?: string;
  residentId?: string;
  error?: string;
}

export interface VerifyPinResponse {
  success: boolean;
  staff?: {
    id: string;
    name: string;
    category: string;
  };
  isLocked?: boolean;
  lockoutSec?: number;
  remainingAttempts?: number;
  error?: string;
}

// 1. Claim One-Time Apartment Invite Code (Atomic Server Operation)
export async function claimInviteCode(params: {
  siteId: string;
  code: string;
  authUid: string;
  authEmail: string;
  fullName: string;
  phone?: string;
}): Promise<ClaimInviteResponse> {
  try {
    const res = await fetch('/api/claim-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Davet kodu doğrulanamadı.' };
    }
    return data;
  } catch (err: any) {
    return { success: false, error: err.message || 'Sunucu bağlantı hatası.' };
  }
}

// 2. Server-Authoritative Rate-Limited PIN Verification
export async function verifyServerPin(params: {
  siteId: string;
  staffId: string;
  enteredPin: string;
}): Promise<VerifyPinResponse> {
  try {
    const res = await fetch('/api/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message || 'Sunucu bağlantı hatası.' };
  }
}

// 3. One-Time Superadmin Bootstrap
export async function bootstrapAdmin(params: {
  authUid: string;
  email: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/bootstrap-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message || 'Sunucu bağlantı hatası.' };
  }
}
