const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
// ========================================================================
// ## BAGIAN KONFIGURASI ##
// ========================================================================

// Durasi total untuk satu siklus pembuatan wallet.
const MAX_DELAY_HOURS = 24;

// Rentang jumlah wallet yang akan dibuat dalam satu siklus.
const MIN_WALLET_COUNT_AUTO = 50;
const MAX_WALLET_COUNT_AUTO = 100;
async function generateAndSaveWallet() {
  console.log("🚀 Menghubungi server untuk membuat wallet...");
  // Pastikan Anda mengganti "IP_VPS" dengan alamat IP server Anda yang sebenarnya
  const url = "http://IP_VPS:8888/generate"; 
  const options = {
    method: "POST",
    headers: { "Accept": "*/*", "Referer": "http://IP_VPS:8888/" },
  };
  try {
    const response = await fetch(url, options);
    if (!response.ok || !response.body) throw new Error(`Server error: ${response.status}`);
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let walletData = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(6));
            if (data.status.startsWith("Wallet generation complete!")) {
                 console.log(`   -> Status: ${data.status}`);
            }
            if (data.wallet) walletData = data.wallet;
          } catch (e) {}
        }
      }
    }
    if (walletData) {
      console.log(`   ✅ Wallet berhasil dibuat! Alamat: ${walletData.address}`);
      await saveWalletToFile(walletData);
    } else {
      console.error("❌ Gagal mendapatkan data wallet dari server.");
    }
  } catch (error) {
    console.error("❌ Terjadi kesalahan:", error.message);
  }
}

async function saveWalletToFile(wallet) {
  const dir = 'wallets'; 
  const filename = `wallet_${wallet.address.slice(-6)}.txt`;
  const fullPath = path.join(dir, filename); 
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const content = `OCTRA WALLET
==================================================

SECURITY WARNING: KEEP THIS FILE SECURE AND NEVER SHARE YOUR PRIVATE KEY

Generated: ${timestamp}
Address Format: oct + Base58(SHA256(pubkey))

Mnemonic: ${wallet.mnemonic.join(' ')}
Private Key (B64): ${wallet.private_key_b64}
Public Key (B64): ${wallet.public_key_b64}
Address: ${wallet.address}

Technical Details:
Entropy: ${wallet.entropy_hex}
Signature Algorithm: Ed25519
Derivation: BIP39-compatible (PBKDF2-HMAC-SHA512, 2048 iterations)`;

  try {
    await fs.promises.mkdir(dir, { recursive: true }); 
    await fs.promises.writeFile(fullPath, content);
    console.log(`   📂 Wallet berhasil disimpan di: ${fullPath}`);
  } catch (error) {
    console.error(`❌ Gagal menyimpan file wallet: ${error.message}`);
  }
}

async function startInfiniteLoop() {
  console.log("\n======================================================");
  console.log("   ♾️   Memulai Mode Otomatis (Distribusi Merata)  ♾️");
  console.log("   Tekan CTRL + C di terminal untuk menghentikan.");
  console.log("======================================================");

  while (true) {
    await runSingleCycle();
    console.log("\nBersiap untuk memulai siklus distribusi baru...");
    await new Promise(res => setTimeout(res, 5000));
  }
}

function runSingleCycle() {
  return new Promise(async (resolve) => {
    // 1. Hitung jumlah & durasi
    const walletCount = Math.floor(Math.random() * (MAX_WALLET_COUNT_AUTO - MIN_WALLET_COUNT_AUTO + 1)) + MIN_WALLET_COUNT_AUTO;
    const totalDurationHours = MAX_DELAY_HOURS;
    const totalDurationMs = totalDurationHours * 60 * 60 * 1000;

    // 2. Hitung interval antar pembuatan wallet
    const intervalMs = Math.floor(totalDurationMs / walletCount);
    const intervalMinutes = (intervalMs / (60 * 1000)).toFixed(1);

    console.log("------------------------------------------------------");
    console.log(`   Memulai siklus distribusi baru...`);
    console.log(`   Total Wallet: ${walletCount}`);
    console.log(`   Durasi Siklus: ${totalDurationHours} jam`);
    console.log(`   Interval per Wallet: ~${intervalMinutes} menit`);
    console.log("------------------------------------------------------");
    for (let i = 0; i < walletCount; i++) {
        console.log(`\n--- Proses Wallet ke-${i + 1} dari ${walletCount} ---`);
        await generateAndSaveWallet();
        if (i < walletCount - 1) {
            console.log(`   ...menunggu ${intervalMinutes} menit untuk wallet berikutnya...`);
            await new Promise(res => setTimeout(res, intervalMs));
        }
    }

    console.log("\n\n✅ Siklus distribusi wallet saat ini telah selesai.");
    resolve(); 
  });
}

async function main() {
  const prompts = require('prompts'); 

  while (true) {
    console.log("\n=====================================");
    console.log("     Selamat Datang di Menu Utama");
    console.log("=====================================");

    const response = await prompts({
      type: 'select',
      name: 'mode',
      message: 'Pilih mode yang ingin Anda jalankan:',
      choices: [
        { title: 'Buat Wallet Manual (Sekarang Juga)', value: 'manual' },
        { title: 'Jalankan Mode Otomatis (Distribusi Merata)', value: 'auto' },
        { title: 'Keluar', value: 'exit' },
      ],
    });

    if (response.mode === 'manual') {
      const countResponse = await prompts({
        type: 'number',
        name: 'count',
        message: 'Berapa banyak wallet yang ingin Anda buat?',
        initial: 1,
        validate: value => value > 0 ? true : 'Jumlah harus lebih dari 0'
      });
      
      if (countResponse.count) {
          console.log(`\nAnda memilih untuk membuat ${countResponse.count} wallet secara manual.\n`);
          for (let i = 0; i < countResponse.count; i++) {
              console.log(`--- Proses Wallet Manual ke-${i + 1} dari ${countResponse.count} ---`);
              await generateAndSaveWallet();
              if (i < countResponse.count - 1) await new Promise(res => setTimeout(res, 1000)); 
          }
          console.log("\n✅ Pembuatan wallet manual selesai.");
          await prompts({
            type: 'text',
            name: 'continue',
            message: 'Tekan Enter untuk kembali ke menu utama...'
          });
      }
    } else if (response.mode === 'auto') {
      await startInfiniteLoop();
    } else {
      console.log("Terima kasih, sampai jumpa!");
      break; 
    }
  }
}

async function bootstrap() {
    console.log("🔧 Memeriksa dependensi...");
    const requiredPackage = 'prompts';
    try {
        require(requiredPackage); 
    } catch (err) {
        console.log(`   -> Dependensi '${requiredPackage}' tidak ditemukan. Memulai instalasi...`);
        try {
            if (!fs.existsSync('package.json')) {
                console.log("   -> Membuat package.json...");
                execSync('npm init -y', { stdio: ['ignore', 'inherit', 'inherit'] });
            }
            // Instal prompts
            console.log(`   -> Menginstal '${requiredPackage}'...`);
            execSync(`npm install ${requiredPackage} --save`, { stdio: 'inherit' });
            console.log(`   ✅ Dependensi '${requiredPackage}' berhasil diinstal.`);
        } catch (error) {
            console.error(`❌ Gagal menginstal '${requiredPackage}'. Pastikan Node.js dan npm terinstal dengan benar.`);
            console.error(`   Coba jalankan "npm install ${requiredPackage}" secara manual di terminal Anda.`);
            process.exit(1);
        }
    }
    await main();
}
bootstrap();
