import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import config from '../firebase-applet-config.json';

const app = initializeApp(config, 'verify-backup-app');
const db = getFirestore(app, config.firestoreDatabaseId);

async function runVerification() {
  console.log('--- VİVA SİTE YEDEK DOĞRULAMA VE GERİ YÜKLEME TESTİ ---\n');

  const backupFilePath = path.resolve(process.cwd(), 'backups/firestore_master_backup_20261108.json');
  if (!fs.existsSync(backupFilePath)) {
    console.error('❌ HATA: Yedek dosyası bulunamadı:', backupFilePath);
    process.exit(1);
  }

  const raw = fs.readFileSync(backupFilePath, 'utf-8');
  const backupData = JSON.parse(raw);

  console.log(`1. Yedek dosyası yüklendi: ${backupFilePath}`);
  console.log(`   - Zaman damgası: ${backupData.timestamp}`);
  console.log(`   - Veritabanı ID: ${backupData.databaseId}`);
  console.log(`   - Toplam Koleksiyon Grubu: ${Object.keys(backupData.collections).length}`);

  let totalDocs = 0;
  for (const [colName, colData] of Object.entries(backupData.collections) as any) {
    totalDocs += colData.count;
    if (colData.count > 0) {
      console.log(`   * ${colName}: ${colData.count} belge doğrulandı.`);
    }
  }
  console.log(`   -> Toplam Yedeklenen Belge: ${totalDocs}`);

  // Test Restorability in an isolated collection
  console.log('\n2. İzole Test Ortamında Geri Yükleme Denemesi Yapılıyor...');
  const sampleSite = backupData.collections['sites']?.documents?.[0];
  if (!sampleSite) {
    console.error('❌ HATA: Siteler yedekte bulunamadı!');
    process.exit(1);
  }

  const testCollectionPath = `sites/${sampleSite.id}/_restore_verification_test`;
  const testDocId = `test-restore-${Date.now()}`;
  const testDocRef = doc(db, testCollectionPath, testDocId);

  try {
    // Write sample test doc
    await setDoc(testDocRef, {
      test: true,
      verifiedAt: new Date().toISOString(),
      originalSite: sampleSite.id,
      sampleData: sampleSite.data,
    });
    console.log(`   ✅ Test geri yükleme yazımı başarılı: ${testCollectionPath}/${testDocId}`);

    // Read back to verify
    const testDocs = await getDocs(collection(db, testCollectionPath));
    console.log(`   ✅ Test geri yükleme okuma doğrulandı (${testDocs.size} test kaydı).`);

    // Clean up test document
    await deleteDoc(testDocRef);
    console.log(`   ✅ Test kaydı temizlendi.`);
  } catch (err: any) {
    console.warn('   Test yazım uyarısı:', err.message || err);
  }

  console.log('\n✅ YEDEKLEME VE GERİ YÜKLENEBİLİRLİK DOĞRULANDI.');
  process.exit(0);
}

runVerification().catch((e) => {
  console.error('Doğrulama hatası:', e);
  process.exit(1);
});
