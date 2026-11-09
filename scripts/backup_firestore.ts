import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import config from '../firebase-applet-config.json';

const app = initializeApp(config, 'backup-client-app');
const db = getFirestore(app, config.firestoreDatabaseId);

interface SerializedDoc {
  path: string;
  id: string;
  data: Record<string, any>;
}

interface BackupFile {
  timestamp: string;
  databaseId: string;
  projectId: string;
  collections: {
    [colName: string]: {
      count: number;
      documents: SerializedDoc[];
    };
  };
}

// Convert Firestore types to preserve Timestamps, DocumentRefs, and primitives
function serializeData(val: any): any {
  if (val === null || val === undefined) return val;
  if (val instanceof Timestamp || (val && typeof val.toDate === 'function')) {
    return {
      _type: 'timestamp',
      seconds: val.seconds,
      nanoseconds: val.nanoseconds,
      iso: val.toDate ? val.toDate().toISOString() : new Date().toISOString(),
    };
  }
  if (Array.isArray(val)) {
    return val.map(serializeData);
  }
  if (typeof val === 'object') {
    const res: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      res[k] = serializeData(v);
    }
    return res;
  }
  return val;
}

async function runBackup() {
  console.log('--- VİVA SİTE RECURSIVE YEDEKLEME BAŞLIYOR ---');
  console.log(`Veritabanı: ${config.firestoreDatabaseId}`);
  console.log(`Proje: ${config.projectId}\n`);

  const backupData: BackupFile = {
    timestamp: new Date().toISOString(),
    databaseId: config.firestoreDatabaseId,
    projectId: config.projectId,
    collections: {},
  };

  const subColNames = [
    'residents',
    'guards',
    'admins',
    'dues',
    'timeRecords',
    'payrollRecords',
    'orders',
    'cargos',
    'guests',
    'facilityEntries',
    'suggestions',
    'inviteCodes',
  ];

  // 1. Fetch all root sites
  console.log('1. Kök siteler (/sites) taranıyor...');
  const sitesSnap = await getDocs(collection(db, 'sites'));
  const siteDocs: SerializedDoc[] = [];

  for (const sDoc of sitesSnap.docs) {
    siteDocs.push({
      path: `sites/${sDoc.id}`,
      id: sDoc.id,
      data: serializeData(sDoc.data()),
    });
  }

  backupData.collections['sites'] = {
    count: siteDocs.length,
    documents: siteDocs,
  };
  console.log(`   -> ${siteDocs.length} site bulundu: ${siteDocs.map((s) => s.id).join(', ')}`);

  // 2. Fetch all subcollections recursively for each site
  for (const sDoc of sitesSnap.docs) {
    const siteId = sDoc.id;
    console.log(`\n2. Site: ${siteId} alt koleksiyonları taranıyor...`);

    for (const colName of subColNames) {
      try {
        const colRef = collection(db, 'sites', siteId, colName);
        const snap = await getDocs(colRef);
        const docs: SerializedDoc[] = [];

        for (const itemDoc of snap.docs) {
          docs.push({
            path: `sites/${siteId}/${colName}/${itemDoc.id}`,
            id: itemDoc.id,
            data: serializeData(itemDoc.data()),
          });
        }

        const fullKey = `sites/${siteId}/${colName}`;
        backupData.collections[fullKey] = {
          count: docs.length,
          documents: docs,
        };
        console.log(`   - ${fullKey}: ${docs.length} kayıt`);
      } catch (err: any) {
        console.warn(`   ! ${colName} taranırken uyarı:`, err.message || err);
      }
    }
  }

  // 3. Fetch top-level /users collection (if exists)
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    const userDocs: SerializedDoc[] = [];
    for (const uDoc of usersSnap.docs) {
      userDocs.push({
        path: `users/${uDoc.id}`,
        id: uDoc.id,
        data: serializeData(uDoc.data()),
      });
    }
    backupData.collections['users'] = {
      count: userDocs.length,
      documents: userDocs,
    };
    console.log(`\n3. /users koleksiyonu: ${userDocs.length} kayıt`);
  } catch (err: any) {
    console.warn('   ! /users taranırken uyarı:', err.message || err);
  }

  // 4. Save to backups folder
  const backupsDir = path.resolve(process.cwd(), 'backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const backupFilePath = path.join(backupsDir, 'firestore_master_backup_20261108.json');
  fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf-8');

  console.log(`\n✅ YEDEKLEME BAŞARIYLA TAMAMLANDI!`);
  console.log(`Dosya yolu: ${backupFilePath}`);
  console.log(`Toplam koleksiyon bölümü: ${Object.keys(backupData.collections).length}`);
  let totalDocs = 0;
  for (const c of Object.values(backupData.collections)) {
    totalDocs += c.count;
  }
  console.log(`Toplam kurtarılan canlı belge sayısı: ${totalDocs}`);
  process.exit(0);
}

runBackup().catch((e) => {
  console.error('Yedekleme hatası:', e);
  process.exit(1);
});
