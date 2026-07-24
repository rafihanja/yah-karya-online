"""
SerpAPI Banten Business Data Collector (70 Queries Sweep)
---------------------------------------------------------
Script pengumpul 70 pencarian data usaha Google Maps di Kota Serang,
Kabupaten Serang, dan Kabupaten Tangerang menggunakan SerpAPI.

Menyimpan hasil ke SQLite (prospek_banten_70.db), JSON (prospek_banten_70.json),
dan CSV Excel (prospek_banten_70.csv).
"""

import os
import sys
import json
import sqlite3
import csv
import re
import urllib.parse
import urllib.request
from typing import List, Dict, Any, Optional

# --- MEMBACA .ENV MANUAL (TANPA DEPENDENCY EKSTERNAL) ---
def load_dotenv(env_path: str = ".env"):
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ[key.strip()] = val.strip()

load_dotenv()

# --- MATRIKS 70 PENCARIAN BANTEN ---
KATEGORI_TARGET = [
    "Klinik Kecantikan & Apotek",
    "Bengkel Mobil & Motor",
    "Restoran & Katering",
    "Jasa Service AC & Elektronik",
    "Toko Ritel & Material Bangunan",
    "Salon & Barbershop",
    "Lembaga Kursus & Bimbingan Belajar"
]

WILAYAH_TARGET = [
    {"nama": "Kota Serang Pusat", "query": "Kota Serang"},
    {"nama": "Kota Serang Cipocok & Taktakan", "query": "Cipocok Jaya Kota Serang"},
    {"nama": "Kab. Serang Cikande", "query": "Cikande Kabupaten Serang"},
    {"nama": "Kab. Serang Kramatwatu", "query": "Kramatwatu Kabupaten Serang"},
    {"nama": "Kab. Serang Ciruas & Kragilan", "query": "Ciruas Kabupaten Serang"},
    {"nama": "Kab. Serang Anyar & Cinangka", "query": "Anyar Kabupaten Serang"},
    {"nama": "Kab. Tangerang Cikupa", "query": "Cikupa Kabupaten Tangerang"},
    {"nama": "Kab. Tangerang Balaraja", "query": "Balaraja Kabupaten Tangerang"},
    {"nama": "Kab. Tangerang Pasar Kemis & Rajeg", "query": "Pasar Kemis Kabupaten Tangerang"},
    {"nama": "Kab. Tangerang Tigaraksa & Kelapa Dua", "query": "Tigaraksa Kabupaten Tangerang"}
]

class SerpAPIBantenCollector:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("SERPAPI_KEY")
        self.output_dir = "."
        self.db_path = os.path.join(self.output_dir, "prospek_banten_70.db")
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS prospek_usaha (
                id TEXT PRIMARY KEY,
                nama_usaha TEXT NOT NULL,
                kategori TEXT,
                wilayah TEXT NOT NULL,
                alamat TEXT,
                telepon TEXT,
                whatsapp_url TEXT,
                rating REAL,
                total_review INTEGER,
                has_website BOOLEAN,
                website_url TEXT,
                website_status TEXT,
                foto_url TEXT,
                google_maps_url TEXT,
                prospek_score TEXT,
                catatan TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        conn.close()

    def clean_phone_for_wa(self, phone: str) -> str:
        digits = re.sub(r'\D', '', phone or "")
        if digits.startswith("0"):
            return "62" + digits[1:]
        if digits.startswith("62"):
            return digits
        return ""

    def evaluate_website_status(self, website_url: str) -> str:
        if not website_url or website_url.strip() == "":
            return "TIDAK_ADA"
        url_lower = website_url.lower()
        if "blogspot" in url_lower or "wordpress.com" in url_lower or "wixsite" in url_lower or "site123" in url_lower or not url_lower.startswith("https"):
            return "JELEK"
        return "OK"

    def evaluate_prospek_score(self, has_website: bool, website_status: str, rating: float, total_review: int) -> str:
        if website_status == "TIDAK_ADA":
            if total_review >= 15 and rating >= 4.0:
                return "TINGGI (Sangat Potensial — Ramai tapi belum ada web)"
            return "SEDANG (Potensial — Belum ada web)"
        elif website_status == "JELEK":
            return "TINGGI (Web Lama / Domain Gratisan — Perlu Redesign)"
        return "RENDAH (Sudah Punya Web)"

    def fetch_serpapi_google_maps(self, query: str, region_name: str) -> List[Dict[str, Any]]:
        if not self.api_key:
            print("[!] SERPAPI_KEY tidak ditemukan!")
            return []

        search_q = f"{query} di {region_name}"
        params = {
            "engine": "google_maps",
            "q": search_q,
            "api_key": self.api_key,
            "type": "search"
        }
        encoded_params = urllib.parse.urlencode(params)
        url = f"https://serpapi.com/search.json?{encoded_params}"

        results = []
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                
                local_results = data.get("local_results", [])
                for place in local_results:
                    place_id = place.get("place_id") or place.get("data_id") or f"serp_{hash(place.get('title'))}"
                    nama = place.get("title", "Usaha Banten")
                    alamat = place.get("address", "")
                    phone = place.get("phone", "")
                    web = place.get("website", "")
                    rating = place.get("rating", 0.0)
                    reviews = place.get("reviews", 0)
                    foto_url = place.get("thumbnail") or place.get("original_image") or place.get("photos_link") or ""
                    gmaps_link = place.get("link") or (f"https://www.google.com/maps/place/?q=place_id:{place_id}" if place_id and str(place_id).startswith("ChIJ") else "")

                    has_web = bool(web)
                    web_status = self.evaluate_website_status(web)
                    score = self.evaluate_prospek_score(has_web, web_status, rating, reviews)

                    wa_clean = self.clean_phone_for_wa(phone)
                    wa_link = f"https://wa.me/{wa_clean}" if wa_clean else ""

                    item = {
                        "id": str(place_id),
                        "nama_usaha": nama,
                        "kategori": query,
                        "wilayah": region_name,
                        "alamat": alamat,
                        "telepon": phone,
                        "whatsapp_url": wa_link,
                        "rating": float(rating or 0.0),
                        "total_review": int(reviews or 0),
                        "has_website": has_web,
                        "website_url": web,
                        "website_status": web_status,
                        "foto_url": foto_url,
                        "google_maps_url": gmaps_link,
                        "prospek_score": score,
                        "catatan": f"SerpAPI Live: {search_q}"
                    }
                    results.append(item)
        except Exception as e:
            print(f"[ERROR] Gagal fetch query '{search_q}': {e}")

        return results

    def save_prospek(self, prospek_list: List[Dict[str, Any]]):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        for item in prospek_list:
            cursor.execute("""
                INSERT OR REPLACE INTO prospek_usaha (
                    id, nama_usaha, kategori, wilayah, alamat, telepon, whatsapp_url,
                    rating, total_review, has_website, website_url, website_status,
                    foto_url, google_maps_url, prospek_score, catatan
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                item["id"], item["nama_usaha"], item["kategori"], item["wilayah"],
                item["alamat"], item["telepon"], item["whatsapp_url"], item["rating"],
                item["total_review"], item["has_website"], item["website_url"],
                item["website_status"], item.get("foto_url", ""), item["google_maps_url"],
                item["prospek_score"], item["catatan"]
            ))
        conn.commit()
        conn.close()

    def export_all(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM prospek_usaha ORDER BY total_review DESC, rating DESC")
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()

        json_path = os.path.join(self.output_dir, "prospek_banten_70.json")
        csv_path = os.path.join(self.output_dir, "prospek_banten_70.csv")

        # Save JSON
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(rows, f, ensure_ascii=False, indent=2)

        # Save CSV
        if rows:
            headers = list(rows[0].keys())
            with open(csv_path, "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=headers)
                writer.writeheader()
                writer.writerows(rows)

        print(f"[OK] Ekspor selesai! Total {len(rows)} prospek unik disimpan di {json_path} & {csv_path}")
        return rows


if __name__ == "__main__":
    if sys.platform == "win32":
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    print("======================================================")
    print(" 🚀 SERPAPI BANTEN DATA SWEEPER (70 QUERIES MATRIX) ")
    print("======================================================")

    collector = SerpAPIBantenCollector()
    if not collector.api_key:
        print("[!] FATAL: SERPAPI_KEY tidak ditemukan di .env atau environment!")
        sys.exit(1)

    print(f"[+] SERPAPI_KEY terdeteksi ({collector.api_key[:8]}...). Memulai 70 pencarian massal...")
    
    total_query_count = 0
    all_extracted = []

    for cat in KATEGORI_TARGET:
        for reg in WILAYAH_TARGET:
            total_query_count += 1
            print(f"[{total_query_count}/70] Fetching: {cat} — {reg['nama']}...")
            res = collector.fetch_serpapi_google_maps(cat, reg["query"])
            print(f"    -> Ditemukan: {len(res)} usaha lokasi")
            all_extracted.extend(res)
            collector.save_prospek(res)

    print("\n------------------------------------------------------")
    print(f"[*] SELESAI! Total {total_query_count} Query SerpAPI Eksekusi.")
    print("------------------------------------------------------")
    final_data = collector.export_all()
    print("======================================================")
