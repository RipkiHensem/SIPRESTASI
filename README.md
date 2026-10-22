# SIPRESTASI — workspace terintegrasi

Tiga layanan dijalankan bersama melalui `npm run dev`:

| Komponen | Folder aktif | Alamat lokal |
| --- | --- | --- |
| Frontend React | `siprestasi-frontend` | http://127.0.0.1:5173 |
| Backend CodeIgniter | `siprestasi-backend-main/siprestasi-backend-main` | http://127.0.0.1:8080 |
| AI FastAPI | `siprestasi-ai-main` | http://127.0.0.1:8000 |

Folder `app/app` merupakan salinan sumber tambahan, bukan server yang dijalankan.
Controller, library OTP, dan migrasi yang sebelumnya hilang telah disalin ke backend aktif.
Lakukan perubahan berikutnya di folder aktif di atas.

## Dependensi

`requirements.txt` diperlukan untuk **Python/AI saja** dan mengacu ke daftar dalam
`siprestasi-ai-main/requirements.txt`. React menggunakan `package.json`/`package-lock.json`;
PHP menggunakan `composer.json`/`composer.lock`.

Siapkan Node.js yang kompatibel dengan Vite di package-lock, PHP 8.2+ dengan ekstensi
intl, mbstring, curl, mysqli, fileinfo, dan Composer. Untuk AI gunakan Python 3.11/3.12
agar kompatibel dengan dependensi lama yang dikunci proyek. Instal Tesseract OCR
secara terpisah; paket pip pytesseract hanya penghubung ke program tersebut.
Siapkan database sesuai konfigurasi backend, SMTP untuk OTP, dan Gemini API key
untuk pemeriksaan sertifikat.

## Instalasi (PowerShell, dari folder workspace)

Untuk memasang dependensi proyek sekaligus di Windows, siapkan Node.js 20.19+ atau
22.12+, PHP 8.2+ beserta Composer, dan Python 3.11/3.12 terlebih dahulu. XAMPP
dapat menyediakan PHP dan MySQL. Setelah itu jalankan:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1
```

Skrip memakai lockfile npm dan Composer agar versi paket konsisten. `requirements.txt`
adalah daftar paket Python untuk layanan AI; file itu tidak dapat memasang Node.js,
PHP, Composer, MySQL, atau program Tesseract. Runtime tersebut tetap perlu tersedia
di komputer. Skrip menyiapkan folder runtime `writable` CodeIgniter dan menguji
izin tulisnya. Skrip membuat `.env` hanya jika kedua file konfigurasi belum ada dan
tidak menimpa `.env` yang sudah dibuat.

Untuk pemasangan manual, ikuti langkah berikut.

```powershell
npm.cmd ci --prefix siprestasi-frontend
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Push-Location siprestasi-backend-main/siprestasi-backend-main
composer install
Pop-Location
.\scripts\configure.ps1
```

`configure.ps1` membuat kedua `.env` dengan internal key acak yang sama. File yang
sudah ada tidak ditimpa. Jika `.env` sudah tersedia, cocokkan dengan `.env.example`
dan samakan `aiService.internalKey` di backend dengan `INTERNAL_KEY` di AI.
Jangan memasukkan key internal atau Gemini ke frontend.

Lengkapi `.env` backend dengan database dan SMTP Anda; lengkapi `.env` AI dengan
`GEMINI_API_KEY` dan lokasi `TESSERACT_CMD`. Gunakan host `127.0.0.1` secara konsisten.

Setelah membuat database kosong sesuai nama pada `.env`:

Untuk membuat akun awal, isi `seed.superadminEmail`, `seed.superadminPassword`,
`seed.adminEmail`, dan `seed.adminPassword` di `.env` backend. Gunakan kata sandi
minimal 12 karakter untuk kedua akun.

```powershell
Push-Location siprestasi-backend-main/siprestasi-backend-main
C:\xampp\php\php.exe spark migrate
C:\xampp\php\php.exe spark db:seed SuperAdminSeeder
Pop-Location
npm.cmd run dev
```

Sesuaikan lokasi PHP bila tidak menggunakan XAMPP. Launcher otomatis mendeteksi
`C:\xampp\php\php.exe`; lokasi lain dapat diberikan melalui `$env:PHP_BIN`.
Python default adalah `.venv`; dapat diganti dengan `$env:PYTHON_BIN` berupa path lengkap.
Ctrl+C menghentikan seluruh proses yang dibuat launcher.

## Integrasi dan cakupan antarmuka

Browser memanggil `/api/...`; Vite meneruskannya ke backend tanpa awalan `/api`.
Cookie sesi ikut dikirim sehingga login tetap tersimpan ketika halaman dimuat ulang.
Layanan AI hanya dihubungi oleh backend dengan internal key.

Frontend menggunakan tampilan marun asli dari `origin/feat/student-frontend`.
CSS, logo, dan aset asli dipertahankan. Logika halaman telah disambungkan ke backend:

- Login memakai sesi server; halaman mahasiswa membutuhkan login.
- OTP dikirim dan diperiksa oleh backend; kode contoh `123456` tidak berlaku.
- Registrasi dan pemeriksaan KRS JPG/PNG maksimal 2 MB memakai layanan AI backend.
  Password sementara hanya berada di memori selama proses registrasi, bukan sessionStorage.
  Jika halaman KRS dimuat ulang, ulangi langkah registrasi.
- Profil mahasiswa, IPK/SKPI, draft, kategori dokumen, status verifikasi, skor,
  dan status penilai dibaca dari database. Refresh halaman tidak membuat hasil simulasi.
- Draft dan rincian form disimpan melalui `portal/form`; unggahan serta pengiriman
  pengajuan memakai endpoint `pengajuan`. Pilihan kategori sesuai kategori backend.
- Dokumen yang sudah tersimpan dapat diunduh oleh pemiliknya. Dokumen draft dapat
  dihapus; revisi pengajuan terkirim hanya untuk kategori berstatus revisi.
- Tiga email rekan penilai disimpan melalui backend hanya untuk finalis.

Migrasi tambahan `AddSubmissionFormData` menambahkan penyimpanan rincian form tanpa
menghapus data lama. Jalankan `php spark migrate` setelah mengambil perubahan ini.
Data IPK/SKPI dan periode pendaftaran aktif harus disiapkan pengelola sebelum membuat draft.

Backend saat ini belum mempunyai publikasi hasil final untuk umum; landing page
menampilkan tiga kartu posisi peringkat untuk setiap angkatan dengan keterangan
"Belum diumumkan" dan tidak mengarang nama/skor pemenang.
Backend membuat record kuesioner setelah penilai lengkap, tetapi belum mengirim
email undangan penilaian. UI tidak menganggap penyimpanan email sebagai bukti email terkirim.
Halaman admin, pemulihan password, dan formulir pengisian kuesioner penilai belum
tersedia dalam frontend mahasiswa asli ini.

`npm run dev` adalah integrasi lokal. Untuk produksi, hasil `npm run build` harus
disajikan oleh web server yang meneruskan `/api/*` ke backend dengan awalan dihapus,
serta menyediakan fallback ke `index.html` untuk halaman frontend.
`vite preview` tidak menggunakan proxy development ini.

## Pemeriksaan

```powershell
npm.cmd test
npm.cmd run check
npm.cmd run build
```

Enam tes JavaScript memeriksa kontrak API, cookie sesi, validasi, pemetaan data nyata,
status penilai, dan pencegahan submit jika unggahan gagal. Respons HTTP pada unit test
ditirukan; aplikasi yang dijalankan selalu menggunakan backend sebenarnya.

Uji integrasi database lokal (XAMPP/MySQL harus aktif):

```powershell
C:\xampp\php\php.exe tests/portal-integration.php
```

Tes ini menambahkan fixture di dalam transaksi InnoDB lalu membatalkannya otomatis.
Tidak mengirim email, tidak memanggil AI, dan tidak mengubah akun pengguna yang sudah ada.
Tes memeriksa profil milik sendiri, data akademik, draft, submit, skor, penguncian
metadata setelah submit, serta larangan memilih penilai bagi non-finalis.

Verifikasi lokal 22 Oktober 2026: migrasi tambahan berhasil; build, ESLint, enam tes
JavaScript dan tes integrasi database lolos. HTTP proxy publik memberi 200; halaman
API privat memberi 401 tanpa login. Browser menampilkan pesan backend untuk login salah.
Seluruh 22 file CSS/aset yang diperiksa identik dengan versi frontend asli.

Konfigurasi SMTP telah diimpor dari file pengguna; pengiriman email belum diuji.
Gemini API key belum diisi, dan program Tesseract belum ditemukan pada path yang
dikonfigurasi. Pemeriksaan KRS/sertifikat belum diuji sampai berhasil.
Jangan memakai kode OTP tiruan untuk melewati proses tersebut.

Migrasi awal `users.id` disamakan menjadi BIGINT dengan foreign key tabel pengajuan
untuk instalasi baru, dan foreign key reviewer dilepas sebelum kolomnya dihapus.
Perubahan migrasi awal ini tidak mengubah skema database yang sudah pernah dimigrasi.
