import os
import json
from headroom import compress, count_tokens_text, OpenAIProvider
from headroom.transforms.code_compressor import compress_code

# 1. Persiapkan data uji JSON raksasa (50 log diulang-ulang agar sangat besar)
single_log = {
    "timestamp": "2026-07-21T08:00:00Z",
    "level": "INFO",
    "service": "auth-service",
    "message": "User login success from remote IP address and session validation passed",
    "ip": "192.168.1.15",
    "session": "session_abc123xyz_random_session_key_that_is_very_long"
}
raw_logs = [single_log for _ in range(50)]
raw_logs_str = json.dumps(raw_logs)

# 2. Persiapkan data uji Kode Python raksasa (Fungsi dengan body 100+ baris)
raw_code = """import os
import sys
import math

def heavy_numerical_pipeline(x, y, z):
    \"\"\"Melakukan perhitungan numerik bertahap yang sangat panjang.\"\"\"
    # Langkah 1 - 10
    v1 = x * 2 + y - z
    v2 = v1 / 3.0 + math.sin(x)
    v3 = v2 ** 2 - math.cos(y)
    v4 = v3 + z * 10
    v5 = v4 - 50
    v6 = v5 * 1.5
    v7 = v6 + math.tan(z)
    v8 = v7 / 2.0
    v9 = v8 - x
    v10 = v9 + y * 2
    
    # Langkah 11 - 20
    v11 = v10 * 2 + y - z
    v12 = v11 / 3.0 + math.sin(x)
    v13 = v12 ** 2 - math.cos(y)
    v14 = v13 + z * 10
    v15 = v14 - 50
    v16 = v15 * 1.5
    v17 = v16 + math.tan(z)
    v18 = v17 / 2.0
    v19 = v18 - x
    v20 = v19 + y * 2
    
    # Langkah 21 - 30
    v21 = v20 * 2 + y - z
    v22 = v21 / 3.0 + math.sin(x)
    v23 = v22 ** 2 - math.cos(y)
    v24 = v23 + z * 10
    v25 = v24 - 50
    v26 = v25 * 1.5
    v27 = v26 + math.tan(z)
    v28 = v27 / 2.0
    v29 = v28 - x
    v30 = v29 + y * 2
    
    # Langkah 31 - 40
    v31 = v30 * 2 + y - z
    v32 = v31 / 3.0 + math.sin(x)
    v33 = v32 ** 2 - math.cos(y)
    v34 = v33 + z * 10
    v35 = v34 - 50
    v36 = v35 * 1.5
    v37 = v36 + math.tan(z)
    v38 = v37 / 2.0
    v39 = v38 - x
    v40 = v39 + y * 2

    # Langkah 41 - 50
    v41 = v40 * 2 + y - z
    v42 = v41 / 3.0 + math.sin(x)
    v43 = v42 ** 2 - math.cos(y)
    v44 = v43 + z * 10
    v45 = v44 - 50
    v46 = v45 * 1.5
    v47 = v46 + math.tan(z)
    v48 = v47 / 2.0
    v49 = v48 - x
    v50 = v49 + y * 2
    
    return v50

if __name__ == "__main__":
    result = heavy_numerical_pipeline(10, 20, 30)
    print(f"Hasil Akhir: {result}")
"""

print("==================================================")
print("             HEADROOM DEMONSTRATION               ")
print("==================================================\n")

# Inisialisasi token counter untuk model gpt-4o
provider = OpenAIProvider()
counter = provider.get_token_counter("gpt-4o")

token_logs_awal = count_tokens_text(raw_logs_str, counter)
token_code_awal = count_tokens_text(raw_code, counter)

# A. Demo 1: Kompresi JSON Logs via Pipeline Utama (SmartCrusher)
messages_logs = [{"role": "user", "content": raw_logs_str}]
result_logs = compress(messages_logs, model="gpt-4o", target_ratio=0.1, compress_user_messages=True, min_tokens_to_compress=10, protect_recent=0, protect_analysis_context=False)
compressed_logs_str = result_logs.messages[0]["content"]
token_logs_akhir = count_tokens_text(compressed_logs_str, counter)

print("--- DEMO 1: KOMPRESI DATA LOGS (JSON RAKSASA) ---")
print(f"Transforms Applied: {result_logs.transforms_applied}")
print(f"Token Asli: {token_logs_awal}")
print(f"Token Setelah Kompresi: {token_logs_akhir}")
savings_logs = (1 - (token_logs_akhir / token_logs_awal)) * 100
print(f"Menghemat Token Sebesar: {savings_logs:.2f}%")
print(f"Panjang Karakter Logs Setelah Kompresi: {len(compressed_logs_str)} karakter")

print("\n--------------------------------------------------\n")

# B. Demo 2: Kompresi Kode Program AST-Based (CodeAwareCompressor)
# Kita minta kompresi agresif dengan target_rate=0.1
compressed_code_str = compress_code(raw_code, language="python", target_rate=0.1)
token_code_akhir = count_tokens_text(compressed_code_str, counter)

print("--- DEMO 2: KOMPRESI KODE PROGRAM (AST-BASED RAKSASA) ---")
print(f"Transforms Applied: ['code_aware_compressor']")
print(f"Token Asli: {token_code_awal}")
print(f"Token Setelah Kompresi: {token_code_akhir}")
savings_code = (1 - (token_code_akhir / token_code_awal)) * 100
print(f"Menghemat Token Sebesar: {savings_code:.2f}%")
print("\n[KODE SETELAH DIKOMPRES HEADROOM]")
print(compressed_code_str)
print("==================================================")
