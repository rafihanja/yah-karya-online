"""
Enrich Banten Business Dataset with Real Google Maps Photo URLs via SerpAPI
-------------------------------------------------------------------------
Script ini mengambil URL foto asli Google Maps untuk setiap usaha di prospek_banten_70.json,
lalu memperbarui kolom `foto_url` dan `galeri_foto_json`.
"""

import os
import json
import csv
import sqlite3
import urllib.request
import urllib.parse
import time

def load_dotenv(env_path: str = "data_usaha_banten/.env"):
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ[key.strip()] = val.strip()

load_dotenv()
api_key = os.getenv("SERPAPI_KEY")

if not api_key:
    print("Error: SERPAPI_KEY tidak ditemukan di .env!")
    exit(1)

json_path = "data_usaha_banten/prospek_banten_70.json"
csv_path = "data_usaha_banten/prospek_banten_70.csv"
db_path = "data_usaha_banten/prospek_banten_70.db"

with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

print(f"Total data usaha di dataset: {len(data)}")

updated_count = 0

for idx, item in enumerate(data):
    # Jika foto_url sudah ada dan valid, lewati
    if item.get("foto_url") and len(item["foto_url"].strip()) > 10 and item.get("galeri_foto_json") and item["galeri_foto_json"] != "[]":
        continue

    place_id = item.get("id") or item.get("place_id")
    nama = item.get("nama_usaha")

    if not place_id and not nama:
        continue

    print(f"[{idx+1}/{len(data)}] Fetching foto asli Google Maps untuk: {nama} ({place_id})...")

    try:
        if place_id:
            url = f"https://serpapi.com/search.json?engine=google_maps&google_domain=google.com&hl=en&place_id={place_id}&api_key={api_key}"
        else:
            query_enc = urllib.parse.quote(nama)
            url = f"https://serpapi.com/search.json?engine=google_maps&q={query_enc}&api_key={api_key}"

        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            res = json.loads(resp.read().decode("utf-8"))

        res_place = res.get("place_results", res.get("local_results", [{}]))
        if isinstance(res_place, list) and len(res_place) > 0:
            res_place = res_place[0]

        thumbnail = res_place.get("thumbnail") or res_place.get("serpapi_thumbnail")
        photos_link = res_place.get("photos_link")
        data_id = res_place.get("data_id")

        photos_list = []
        if thumbnail:
            photos_list.append(thumbnail)

        # Jika ada data_id, coba ambil foto galeri dari engine google_maps_photos
        if data_id:
            try:
                data_id_enc = urllib.parse.quote(data_id)
                photos_url = f"https://serpapi.com/search.json?data_id={data_id_enc}&engine=google_maps_photos&hl=en&api_key={api_key}"
                p_req = urllib.request.Request(photos_url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(p_req, timeout=10) as p_resp:
                    p_res = json.loads(p_resp.read().decode("utf-8"))
                    fetched_photos = [p.get("image") for p in p_res.get("photos", []) if p.get("image")]
                    if fetched_photos:
                        photos_list.extend(fetched_photos)
            except Exception as pe:
                pass

        if photos_list:
            item["foto_url"] = photos_list[0]
            item["galeri_foto_json"] = json.dumps(photos_list[:10], ensure_ascii=False)
            updated_count += 1
            print(f"  ✓ BERHASIL! Ditemukan {len(photos_list)} foto asli. foto_url: {photos_list[0][:60]}...")
        else:
            print(f"  - Tidak ada foto ditemukan.")

        # Simpan bertahap setiap 10 update
        if updated_count % 10 == 0:
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

        time.sleep(0.2) # Throttle halus

    except Exception as e:
        print(f"  ! Gagal fetch: {e}")
        time.sleep(0.5)

# Simpan final ke JSON
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"\nSelesai! {updated_count} data usaha telah diperbarui dengan foto_url asli Google Maps.")

# Simpan ke CSV
if data:
    fieldnames = list(data[0].keys())
    with open(csv_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)
    print(f"Saved updated CSV to {csv_path}")

# Simpan ke SQLite DB
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    for item in data:
        cursor.execute(
            "UPDATE usaha SET foto_url = ?, galeri_foto_json = ? WHERE id = ?",
            (item.get("foto_url"), item.get("galeri_foto_json"), item.get("id"))
        )
    conn.commit()
    conn.close()
    print(f"Saved updated SQLite DB to {db_path}")
