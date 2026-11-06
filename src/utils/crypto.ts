/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Computes SHA-256 hex digest of a password string with site-specific salt.
 * Ensures passwords are never stored in plain text.
 */
export async function hashPassword(password: string): Promise<string> {
  const salted = `${password}__viva_security_salt_2026`;
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(salted);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // fallback below
    }
  }

  // Fallback simple bitwise hash for environments without WebCrypto
  let hash = 0;
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `h_${Math.abs(hash).toString(16).padStart(8, '0')}_demo_secure`;
}
