import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Server Firestore connection
const fbApp = initializeApp(firebaseConfig, 'viva-server-app');
const db = getFirestore(fbApp, firebaseConfig.firestoreDatabaseId);

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// In-Memory Rate Limiting for PIN attempts (IP + StaffId)
interface LockoutState {
  attempts: number;
  lockoutUntil: number;
}
const pinLockouts = new Map<string, LockoutState>();

// Helper: PBKDF2 / Salted Hash
function verifySaltedPin(pin: string, storedHash: string, salt: string = 'viva_salt_2026'): boolean {
  try {
    // 1. Direct match with standard SHA-256 (for backward compatibility with existing 1234 hash)
    const directSha256 = crypto.createHash('sha256').update(pin).digest('hex');
    if (storedHash === directSha256) return true;

    // 2. Salted PBKDF2 verification
    const pbkdf2Hash = crypto.pbkdf2Sync(pin, salt, 10000, 32, 'sha256').toString('hex');
    if (storedHash === pbkdf2Hash) return true;

    return false;
  } catch {
    return false;
  }
}

// ----------------------------------------------------
// 1. API: Server Health
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    databaseId: firebaseConfig.firestoreDatabaseId,
    timestamp: new Date().toISOString(),
  });
});

// ----------------------------------------------------
// 2. API: Server-Authoritative PIN Verification & Lockout
// ----------------------------------------------------
app.post('/api/verify-pin', async (req, res) => {
  const { siteId, staffId, enteredPin } = req.body;

  if (!siteId || !staffId || !enteredPin) {
    return res.status(400).json({ success: false, error: 'Eksik parametreler.' });
  }

  const clientKey = `${req.ip}_${staffId}`;
  const now = Date.now();
  const lockout = pinLockouts.get(clientKey);

  if (lockout && lockout.lockoutUntil > now) {
    const remainingSec = Math.ceil((lockout.lockoutUntil - now) / 1000);
    return res.status(429).json({
      success: false,
      isLocked: true,
      remainingSec,
      error: `Çok fazla hatalı deneme! Lütfen ${remainingSec} saniye bekleyin.`,
    });
  }

  try {
    // Check staff in Firestore
    const staffDocRef = doc(db, 'sites', siteId, 'guards', staffId);
    let snap = await getDoc(staffDocRef);

    if (!snap.exists()) {
      // Check central staff
      const centralRef = doc(db, 'sites', siteId, 'staff', staffId);
      snap = await getDoc(centralRef);
    }

    if (!snap.exists()) {
      return res.status(404).json({ success: false, error: 'Personel kaydı bulunamadı.' });
    }

    const staffData = snap.data();
    if (staffData.isActive === false) {
      return res.status(403).json({ success: false, error: 'Personel hesabı pasife alınmıştır.' });
    }

    const storedHash = staffData.pinHash;
    const isValid = verifySaltedPin(enteredPin, storedHash);

    if (isValid) {
      // Clear lockout on success
      pinLockouts.delete(clientKey);
      return res.json({
        success: true,
        staff: {
          id: snap.id,
          name: staffData.name,
          category: staffData.category || 'guvenlik',
        },
      });
    } else {
      // Record failed attempt
      const currentAttempts = (lockout?.attempts || 0) + 1;
      let lockoutDuration = 0;

      if (currentAttempts >= 5) {
        lockoutDuration = 300 * 1000; // 5 minutes
      } else if (currentAttempts >= 3) {
        lockoutDuration = 30 * 1000; // 30 seconds
      }

      pinLockouts.set(clientKey, {
        attempts: currentAttempts,
        lockoutUntil: lockoutDuration > 0 ? now + lockoutDuration : 0,
      });

      return res.status(401).json({
        success: false,
        attempts: currentAttempts,
        remainingAttempts: Math.max(0, 5 - currentAttempts),
        isLocked: lockoutDuration > 0,
        lockoutSec: Math.ceil(lockoutDuration / 1000),
        error: 'Hatalı PIN kodu!',
      });
    }
  } catch (err: any) {
    console.error('PIN verify error:', err);
    return res.status(500).json({ success: false, error: 'Doğrulama servisinde hata oluştu.' });
  }
});

// ----------------------------------------------------
// 3. API: Atomic Invite Code Claim (Self-Registration)
// ----------------------------------------------------
app.post('/api/claim-invite', async (req, res) => {
  const { siteId, code, authUid, authEmail, fullName, phone } = req.body;

  if (!siteId || !code || !authUid || !fullName) {
    return res.status(400).json({ success: false, error: 'Eksik parametreler.' });
  }

  const cleanCode = String(code).trim().toUpperCase();

  try {
    const inviteDocRef = doc(db, 'sites', siteId, 'inviteCodes', cleanCode);
    const userProfileRef = doc(db, 'users', authUid);

    const result = await runTransaction(db, async (transaction) => {
      const inviteSnap = await transaction.get(inviteDocRef);

      if (!inviteSnap.exists()) {
        throw new Error('Geçersiz davet kodu.');
      }

      const inviteData = inviteSnap.data();

      if (inviteData.used) {
        throw new Error('Bu davet kodu daha önce kullanılmıştır.');
      }

      const now = Timestamp.now();
      if (inviteData.expiresAt && inviteData.expiresAt.toMillis() < now.toMillis()) {
        throw new Error('Davet kodunun kullanım süresi dolmuştur.');
      }

      // Check if resident record already exists for this unit to prevent duplicates
      const residentsCol = collection(db, 'sites', siteId, 'residents');
      const q = query(
        residentsCol,
        where('block', '==', inviteData.block),
        where('apartment', '==', inviteData.apartment)
      );
      const existingResidents = await getDocs(q);

      let residentDocId = `res-${Date.now()}`;
      if (!existingResidents.empty) {
        // Use existing resident doc ID, update with new auth details
        residentDocId = existingResidents.docs[0].id;
      }

      const residentRef = doc(db, 'sites', siteId, 'residents', residentDocId);

      // 1. Mark invite code as used
      transaction.update(inviteDocRef, {
        used: true,
        usedByUid: authUid,
        usedByEmail: authEmail || '',
        usedAt: serverTimestamp(),
      });

      // 2. Update/create resident record in site directory
      transaction.set(
        residentRef,
        {
          id: residentDocId,
          siteId,
          block: inviteData.block,
          apartment: inviteData.apartment,
          fullName: fullName.trim(),
          phone: phone ? phone.trim() : '',
          authUid,
          authEmail: authEmail || '',
          isRegistered: true,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // 3. Lock user profile to this site & unit
      transaction.set(
        userProfileRef,
        {
          uid: authUid,
          email: authEmail || '',
          siteId,
          role: 'resident',
          block: inviteData.block,
          apartment: inviteData.apartment,
          fullName: fullName.trim(),
          phone: phone ? phone.trim() : '',
          isActive: true,
          registeredAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      return {
        block: inviteData.block,
        apartment: inviteData.apartment,
        residentId: residentDocId,
      };
    });

    return res.json({ success: true, ...result });
  } catch (err: any) {
    console.warn('Claim invite error:', err.message);
    return res.status(400).json({ success: false, error: err.message || 'Davet kodu işlenemedi.' });
  }
});

// ----------------------------------------------------
// 4. API: One-Time Verified Initial Admin Bootstrap
// ----------------------------------------------------
app.post('/api/bootstrap-admin', async (req, res) => {
  const { authUid, email } = req.body;

  if (!authUid || !email) {
    return res.status(400).json({ success: false, error: 'Eksik kimlik bilgileri.' });
  }

  // Strictly check verified super admin email
  if (email.trim().toLowerCase() !== 'nuhnaninay@gmail.com') {
    return res.status(403).json({
      success: false,
      error: 'Yetkisiz erişim! Bu işlem yalnızca doğrulanmış sistem yöneticisine açıktır.',
    });
  }

  try {
    const bootstrapRef = doc(db, 'system', 'admin_bootstrap_state');
    const bootstrapSnap = await getDoc(bootstrapRef);

    if (bootstrapSnap.exists() && bootstrapSnap.data().isCompleted) {
      if (bootstrapSnap.data().completedByUid === authUid) {
        return res.json({
          success: true,
          message: 'nuhnaninay@gmail.com yönetici yetkisi sistemde zaten kayıtlı ve aktiftir.',
        });
      }
      return res.status(400).json({
        success: false,
        error: 'İlk yönetici kurulumu daha önce tamamlanmıştır ve kalıcı olarak kapatılmıştır.',
      });
    }

    // Assign to both sites
    const sites = ['site-mw656a9j', 'site-viva-1'];
    for (const sId of sites) {
      await setDoc(
        doc(db, 'sites', sId, 'admins', authUid),
        {
          uid: authUid,
          email: 'nuhnaninay@gmail.com',
          role: 'admin',
          isSuperAdmin: true,
          assignedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }

    // Set user profile
    await setDoc(
      doc(db, 'users', authUid),
      {
        uid: authUid,
        email: 'nuhnaninay@gmail.com',
        siteId: 'site-mw656a9j',
        role: 'admin',
        isActive: true,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Permanently close bootstrap
    await setDoc(bootstrapRef, {
      isCompleted: true,
      completedByUid: authUid,
      completedAt: new Date().toISOString(),
    });

    return res.json({
      success: true,
      message: 'nuhnaninay@gmail.com hesabı her iki siteye de yönetici olarak başarıyla bağlandı.',
    });
  } catch (err: any) {
    console.error('Bootstrap admin error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Sunucu hatası.' });
  }
});

// ----------------------------------------------------
// 5. API: Invoice OCR via Gemini 2.5 Flash
// ----------------------------------------------------
app.post('/api/ocr-invoice', async (req, res) => {
  const { imageBase64, mimeType = 'image/jpeg', textHint } = req.body;

  if (!imageBase64 && !textHint) {
    return res.status(400).json({ success: false, error: 'Fatura görseli veya metin ipucu gereklidir.' });
  }

  try {
    const ai = new GoogleGenAI();
    const systemPrompt = `Sen uzman bir muhasebe ve site yönetimi fatura OCR denetçisisin.
Sana iletilen fatura görselini veya faturayla ilgili metni incele.
Aşağıdaki alanları tespit et ve SADECE saf bir JSON nesnesi döndür (kesinlikle \`\`\`json veya markdown etiketi ekleme, doğrudan { ile başlayıp } ile bitir):
{
  "vendorName": "Faturayı kesen firma / kurum adı",
  "taxId": "Vergi Kimlik No veya TCKN (varsa)",
  "invoiceNumber": "Fatura seri ve sıra numarası",
  "date": "YYYY-MM-DD formatında fatura tarihi",
  "dueDate": "YYYY-MM-DD formatında son ödeme tarihi",
  "amount": 0.00,
  "vatAmount": 0.00,
  "totalAmount": 0.00,
  "category": "elektrik" | "su" | "dogalgaz" | "asansor" | "guvenlik" | "temizlik" | "bakim_onarım" | "peyzaj" | "havuz" | "yonetim" | "diger",
  "description": "Fatura konusu veya harcama kalemi açıklaması"
}`;

    let contents: any[] = [];
    if (imageBase64) {
      const cleanData = imageBase64.replace(/^data:[^;]+;base64,/, '');
      contents = [
        {
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: cleanData,
          },
        },
        systemPrompt,
      ];
    } else {
      contents = [`${systemPrompt}\n\nFatura Metni / Bilgisi:\n${textHint}`];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
    });

    const raw = response.text || '';
    const cleanJson = raw.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
    let parsed: any = {};
    try {
      parsed = JSON.parse(cleanJson);
    } catch {
      parsed = {
        vendorName: 'Ayrıştırılamadı (Manuel Giriş Yapınız)',
        totalAmount: 0,
        category: 'diger',
        description: raw.slice(0, 150),
      };
    }

    return res.json({
      success: true,
      data: parsed,
    });
  } catch (err: any) {
    console.error('Invoice OCR error:', err);
    return res.status(500).json({
      success: false,
      error: `Gemini OCR servisi hatası: ${err.message || 'Servis yanıt vermedi'}`,
    });
  }
});

// ----------------------------------------------------
// 6. Mount Vite middleware (DEV) or Serve Static (PROD)
// ----------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[DEV] Vite dev server middleware mounted.');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('[PROD] Serving production build from /dist.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 VİVA SİTE Sunucusu port ${PORT} üzerinde hazır (${isProd ? 'PRODUCTION' : 'DEVELOPMENT'})`);
  });
}

startServer().catch((e) => {
  console.error('Sunucu başlatma hatası:', e);
});
