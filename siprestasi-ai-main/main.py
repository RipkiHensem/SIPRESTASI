import os
from fastapi import FastAPI, UploadFile, File, Header, HTTPException, Form
from dotenv import load_dotenv
from PIL import Image
import pytesseract
import io
import google.generativeai as genai
import json
import re
from pathlib import Path
 
load_dotenv(Path(__file__).with_name(".env"))

if os.getenv("TESSERACT_CMD"):
    pytesseract.pytesseract.tesseract_cmd = os.environ["TESSERACT_CMD"]
INTERNAL_KEY = os.getenv("INTERNAL_KEY")
if not INTERNAL_KEY:
    raise RuntimeError("Isi INTERNAL_KEY di .env layanan AI sebelum menjalankan server.")
 
app = FastAPI(title="SIPRESTASI AI Service")
 
# Kata kunci yang WAJIB ada di hasil OCR supaya dokumen dianggap valid.
KEYWORD_JUDUL_DOKUMEN = "kartu rencana studi"
KEYWORD_PRODI_SI = "sistem informasi"


def extract_krs_data(ocr_text: str, nim: str) -> dict[str, str]:
    """Ambil informasi yang benar-benar tersedia tanpa menebak nomor semester."""
    angkatan = f"20{nim[:2]}" if re.fullmatch(r"\d{10,}", nim) else "-"
    periode_match = re.search(
        r"\b(ganjil|genap)\s*(20\d{2})\s*/\s*(20\d{2})\b",
        ocr_text,
        flags=re.IGNORECASE,
    )

    if not periode_match:
        return {
            "angkatan": angkatan,
            "semester": "-",
            "periode_akademik": "-",
        }

    semester = periode_match.group(1).capitalize()
    periode_akademik = f"{semester} {periode_match.group(2)}/{periode_match.group(3)}"
    return {
        "angkatan": angkatan,
        "semester": semester,
        "periode_akademik": periode_akademik,
    }

@app.get("/")
def health_check():
    return {"status": "ok", "service": "SIPRESTASI AI Service (OCR mode)"}

@app.post("/verify-krs")
async def verify_krs(
    file: UploadFile = File(...),
    nama: str = Form(...),
    nim: str = Form(...),
    x_internal_key: str = Header(default=None),
):
    if x_internal_key != INTERNAL_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized: internal key tidak valid")
 
    allowed_types = ["image/jpeg", "image/png"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=422,
            detail=f"Tipe file {file.content_type} tidak didukung. Gunakan JPG atau PNG.",
        )
 
    file_bytes = await file.read()
 
    try:
        image = Image.open(io.BytesIO(file_bytes))
        hasil_ocr = pytesseract.image_to_string(image)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gagal membaca gambar: {str(e)}")
 
    teks_lower = hasil_ocr.lower()
    nama_lower = nama.strip().lower()
    nim_bersih = nim.strip()

    ada_judul_krs = KEYWORD_JUDUL_DOKUMEN in teks_lower
    ada_prodi_si = KEYWORD_PRODI_SI in teks_lower
    ada_nama_cocok = nama_lower in teks_lower
    ada_nim_cocok = nim_bersih in hasil_ocr  

    is_valid = ada_judul_krs and ada_prodi_si and ada_nama_cocok and ada_nim_cocok
 
    return {
        "success": True,
        "is_valid": is_valid,
        "detail_pengecekan": {
            "terdeteksi_sebagai_krs": ada_judul_krs,
            "terdeteksi_prodi_si": ada_prodi_si,
            "nama_cocok": ada_nama_cocok,
            "nim_cocok": ada_nim_cocok,
        },
        "krs_data": extract_krs_data(hasil_ocr, nim_bersih),
        "raw_text_preview": hasil_ocr[:500],
    }

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

KATEGORI_LABEL = {
    # Prestasi
    "internasional_juara": "Juara dalam kompetisi/event tingkat internasional",
    "internasional_finalis": "Finalis dalam kompetisi/event tingkat internasional",
    "nasional_juara": "Juara dalam kompetisi/event tingkat nasional",
    "nasional_finalis": "Finalis dalam kompetisi/event tingkat nasional",
    "regional_juara": "Juara dalam kompetisi/event tingkat regional",
    "regional_finalis": "Finalis dalam kompetisi/event tingkat regional",
    "universitas_juara": "Juara dalam kompetisi/event tingkat universitas",
    "universitas_finalis": "Finalis dalam kompetisi/event tingkat universitas",
    # Organisasi
    "internasional_ketua": "Ketua/pemimpin organisasi atau kepanitiaan tingkat internasional",
    "internasional_wakil": "Wakil ketua organisasi atau kepanitiaan tingkat internasional",
    "internasional_anggota_aktif": "Anggota aktif organisasi/kepanitiaan tingkat internasional",
    "nasional_ketua": "Ketua/pemimpin organisasi atau kepanitiaan tingkat nasional",
    "nasional_wakil": "Wakil ketua organisasi atau kepanitiaan tingkat nasional",
    "nasional_anggota_aktif": "Anggota aktif organisasi/kepanitiaan tingkat nasional",
    "lokal_ketua": "Ketua/pemimpin organisasi atau kepanitiaan tingkat lokal/kampus",
    "lokal_wakil": "Wakil ketua organisasi atau kepanitiaan tingkat lokal/kampus",
    "lokal_anggota_aktif": "Anggota aktif organisasi/kepanitiaan tingkat lokal/kampus",
    # Bahasa
    "tinggi": "Kemampuan bahasa asing tingkat tinggi/mahir",
    "menengah_atas": "Kemampuan bahasa asing tingkat menengah atas",
    "menengah": "Kemampuan bahasa asing tingkat menengah",
    "dasar": "Kemampuan bahasa asing tingkat dasar",
}

@app.post("/verify-certificate")
async def verify_certificate(
    file: UploadFile = File(...),
    nama: str = Form(...),
    kategori: str = Form(...),
    tipe: str = Form(...),
    x_internal_key: str = Header(None)
):
    if x_internal_key != INTERNAL_KEY:
        raise HTTPException(status_code=403, detail="Unauthorized")

    image_bytes = await file.read()

    # Ambil label kategori di dalam fungsi setelah parameter 'kategori' diterima
    kategori_label = KATEGORI_LABEL.get(kategori, kategori)

    prompt = f"""
Kamu adalah validator dokumen untuk sistem pengajuan mahasiswa berprestasi.
Tipe dokumen: {tipe}
Kategori yang diklaim mahasiswa: {kategori} ({kategori_label})
Nama mahasiswa yang mengajukan: {nama}

Periksa gambar sertifikat/dokumen ini, lalu jawab HANYA dalam format JSON berikut,
tanpa teks lain:
{{
  "verdict": "sesuai" | "tidak_sesuai" | "ragu",
  "alasan": "penjelasan singkat"
}}

Aturan penilaian:
- sesuai: dokumen terlihat valid, isinya jelas sesuai dengan kategori yang diklaim, nama pada dokumen sesuai dengan nama mahasiswa (dengan toleransi variasi penulisan), dan informasi penerbit/instansi apabila tersedia terlihat relevan.
- tidak_sesuai: dokumen jelas tidak sesuai kategori, nama jelas berbeda dari nama mahasiswa, terdapat indikasi kuat dokumen direkayasa, atau terdapat informasi penerbit yang jelas bertentangan dengan isi dokumen.
- ragu: informasi tidak cukup jelas untuk menentukan kesesuaian, misalnya tulisan buram, nama terpotong, kategori ambigu, atau identitas/penerbit tidak dapat dipastikan. Dalam kondisi ini AI tidak menebak dan dokumen diarahkan untuk pemeriksaan admin.
"""

    try:
        model = genai.GenerativeModel("gemini-flash-latest")
        response = model.generate_content([
            prompt,
            {"mime_type": file.content_type, "data": image_bytes}
        ])
        text = response.text.strip()
        text = text.replace("```json", "").replace("```", "").strip()
        hasil = json.loads(text)
    except Exception as e:
        return {"verdict": "ragu", "alasan": f"AI service error: {str(e)}"}

    return hasil
