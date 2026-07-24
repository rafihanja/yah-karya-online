import os
import json
import csv
import sqlite3
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed

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

json_path = "data_usaha_banten/prospek_banten_70.json"
csv_path = "data_usaha_banten/prospek_banten_70.csv"
db_path = "data_usaha_banten/prospek_banten_70.db"

with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

print(f"Loaded {len(data)} business records from {json_path}")

def process_item(item):
    if item.get("foto_url") and len(str(item["foto_url"]).strip()) > 10:
        return False, item

    place_id = item.get("id")
    nama = item.get("nama_usaha")

    if not place_id and not nama:
        return False, item

    try:
        if place_id:
            url = f"https://serpapi.com/search.json?engine=google_maps&google_domain=google.com&hl=en&place_id={place_id}&api_key={api_key}"
        else:
            query_enc = urllib.parse.quote(nama)
            url = f"https://serpapi.com/search.json?engine=google_maps&q={query_enc}&api_key={api_key}"

        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            res = json.loads(resp.read().decode("utf-8"))

        res_place = res.get("place_results", res.get("local_results", [{}]))
        if isinstance(res_place, list) and len(res_place) > 0:
            res_place = res_place[0]

        thumbnail = res_place.get("thumbnail") or res_place.get("serpapi_thumbnail")
        data_id = res_place.get("data_id")

        photos_list = []
        if thumbnail:
            photos_list.append(thumbnail)

        if data_id:
            try:
                data_id_enc = urllib.parse.quote(data_id)
                photos_url = f"https://serpapi.com/search.json?data_id={data_id_enc}&engine=google_maps_photos&hl=en&api_key={api_key}"
                p_req = urllib.request.Request(photos_url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(p_req, timeout=6) as p_resp:
                    p_res = json.loads(p_resp.read().decode("utf-8"))
                    fetched_photos = [p.get("image") for p in p_res.get("photos", []) if p.get("image")]
                    if fetched_photos:
                        photos_list.extend(fetched_photos)
            except Exception:
                pass

        if photos_list:
            item["foto_url"] = photos_list[0]
            item["galeri_foto_json"] = json.dumps(photos_list[:10], ensure_ascii=False)
            return True, item
    except Exception as e:
        pass

    return False, item

targets = [item for item in data if not (item.get("foto_url") and len(str(item["foto_url"]).strip()) > 10)]
print(f"Found {len(targets)} records needing foto_url enrichment.")

# Process batch of 100 entries at a time
batch_size = 100
to_process = targets[:batch_size]

updated_count = 0
with ThreadPoolExecutor(max_workers=8) as executor:
    futures = {executor.submit(process_item, item): item for item in to_process}
    for future in as_completed(futures):
        is_updated, updated_item = future.result()
        if is_updated:
            updated_count += 1
            print(f"Enriched ({updated_count}): {updated_item.get('nama_usaha')} -> {updated_item.get('foto_url')[:60]}...")

# Save back to JSON
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# Save back to CSV handling all fieldnames safely
all_keys = set()
for item in data:
    all_keys.update(item.keys())
fieldnames = list(all_keys)

with open(csv_path, "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(data)

print(f"SUCCESS: Enriched {updated_count} business records with real Google Maps foto_url CDN links!")
