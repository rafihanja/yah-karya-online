import logging
import argparse
import os
import ctypes
import urllib.request
import webbrowser
import cv2
import mediapipe as mp

# Konfigurasi logging terstruktur
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Simpan proses latar musik agar bisa dihentikan nanti
bg_music_process = None

def download_default_music(file_path: str) -> None:
    url = "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3"
    logger.info(f"Mengunduh musik latar default dari {url}...")
    try:
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req) as response, open(file_path, 'wb') as out_file:
            out_file.write(response.read())
        logger.info(f"✅ Musik berhasil diunduh ke {file_path}")
    except Exception as e:
        logger.warning(f"Gagal mengunduh musik latar: {e}")

def download_music_from_youtube(url: str, output_path: str) -> None:
    logger.info(f"Mengunduh lagu 'Foto Kita Blur' dari YouTube ({url}). Mohon tunggu sebentar...")
    try:
        import yt_dlp
        ydl_opts = {
            'format': 'bestaudio[ext=m4a]/bestaudio',
            'outtmpl': output_path,
            'quiet': True,
            'no_warnings': True
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        logger.info(f"✅ Berhasil mengunduh lagu ke {output_path}!")
    except Exception as e:
        logger.error(f"Gagal mengunduh lagu dari YouTube: {e}")

def play_audio(file_path: str) -> None:
    global bg_music_process
    
    # Jika default file_path adalah "Foto Kita Blur - Sal Priadi.mp3" tapi tidak ada,
    # kita coba cari atau unduh versi "Foto Kita Blur - Sal Priadi.m4a"
    if file_path == "Foto Kita Blur - Sal Priadi.mp3":
        if not os.path.exists(file_path):
            file_path = "Foto Kita Blur - Sal Priadi.m4a"

    if not os.path.exists(file_path):
        if file_path == "Foto Kita Blur - Sal Priadi.m4a":
            youtube_url = "https://www.youtube.com/watch?v=ytMxh-_6EcI"
            download_music_from_youtube(youtube_url, file_path)
        elif file_path == "background.mp3":
            download_default_music(file_path)

    if not os.path.exists(file_path):
        logger.warning("Musik latar tidak siap digunakan.")
        return

    logger.info(f"Memutar musik latar secara asinkron (PowerShell): {file_path}...")
    try:
        abs_path = os.path.abspath(file_path)
        # Script PowerShell untuk memutar media secara loop (menggunakan STA mode)
        ps_script = f"""
        Add-Type -AssemblyName PresentationCore
        $player = New-Object System.Windows.Media.MediaPlayer
        $player.Open('{abs_path}')
        # Tunggu media selesai di-load (maksimal 5 detik)
        $timeout = 0
        while ($player.NaturalDuration.HasTimeSpan -eq $false -and $timeout -lt 50) {{
            Start-Sleep -Milliseconds 100
            $timeout++
        }}
        if ($player.NaturalDuration.HasTimeSpan -eq $true) {{
            $player.Play()
            while ($true) {{
                Start-Sleep -Seconds 1
                if ($player.Position -ge $player.NaturalDuration.TimeSpan) {{
                    $player.Position = [TimeSpan]::Zero
                    $player.Play()
                }}
            }}
        }}
        """
        import subprocess
        # Jalankan di background (STA mode) tanpa memunculkan jendela konsol baru
        bg_music_process = subprocess.Popen(
            ["powershell", "-STA", "-Command", ps_script],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0
        )
    except Exception as e:
        logger.warning(f"Gagal memutar audio via PowerShell: {e}")

def stop_audio() -> None:
    global bg_music_process
    if bg_music_process is not None:
        logger.info("Menghentikan musik latar...")
        try:
            bg_music_process.terminate()
            bg_music_process.wait(timeout=2)
        except Exception:
            try:
                bg_music_process.kill()
            except Exception:
                pass
        bg_music_process = None

def is_peace_sign(landmarks) -> bool:
    """
    Memeriksa apakah landmark tangan menunjukkan pose tanda V / Peace.
    Menggunakan perhitungan jarak dari pergelangan tangan (wrist) agar akurat 
    dan tahan terhadap rotasi/kemiringan tangan (rotation-invariant).
    """
    import math
    def get_distance(p1, p2) -> float:
        return math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2)

    wrist = landmarks[0]
    
    # Jarak dari wrist ke ujung jari vs ke sendi PIP
    dist_index_tip = get_distance(landmarks[8], wrist)
    dist_index_pip = get_distance(landmarks[6], wrist)
    
    dist_middle_tip = get_distance(landmarks[12], wrist)
    dist_middle_pip = get_distance(landmarks[10], wrist)
    
    dist_ring_tip = get_distance(landmarks[16], wrist)
    dist_ring_pip = get_distance(landmarks[14], wrist)
    
    dist_pinky_tip = get_distance(landmarks[20], wrist)
    dist_pinky_pip = get_distance(landmarks[18], wrist)
    
    # Jari tegak jika ujung jari lebih jauh dari pergelangan tangan dibanding sendi tengahnya
    index_up = dist_index_tip > dist_index_pip
    middle_up = dist_middle_tip > dist_middle_pip
    ring_down = dist_ring_tip < dist_ring_pip
    pinky_down = dist_pinky_tip < dist_pinky_pip
    
    return index_up and middle_up and ring_down and pinky_down

def main() -> None:
    # Setup argument parser untuk memilih indeks kamera dan musik latar
    parser = argparse.ArgumentParser(description="Live Webcam Finger Blur")
    parser.add_argument("--camera", type=int, default=0, help="Index kamera webcam (default: 0)")
    parser.add_argument("--music", type=str, default="Foto Kita Blur - Sal Priadi.mp3", help="Path ke file musik latar MP3")
    args = parser.parse_args()

    logger.info("Menginisialisasi modul pendeteksi tangan (MediaPipe Hands)...")
    mp_hands = mp.solutions.hands
    
    # Atur deteksi tangan dengan batas kepercayaan 0.7 agar lebih akurat
    hands = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=2,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )
    
    logger.info(f"Membuka kamera webcam (index {args.camera})...")
    
    # Mencoba beberapa API backend di Windows untuk keandalan maksimal
    backends = [
        ("CAP_DSHOW", cv2.CAP_DSHOW),
        ("Default", None),
        ("CAP_MSMF", cv2.CAP_MSMF)
    ]
    
    cap = None
    successful_backend = None
    
    for name, backend in backends:
        logger.info(f"Mencoba membuka kamera {args.camera} dengan backend {name}...")
        try:
            if backend is None:
                cap = cv2.VideoCapture(args.camera)
            else:
                cap = cv2.VideoCapture(args.camera, backend)
                
            if cap.isOpened():
                successful_backend = name
                logger.info(f"✅ Kamera {args.camera} berhasil dibuka menggunakan backend: {name}")
                break
        except Exception as e:
            logger.warning(f"Gagal membuka dengan backend {name}: {e}")
            
    if cap is None or not cap.isOpened():
        logger.error(f"❌ Kamera webcam index {args.camera} gagal dibuka oleh semua backend API.")
        logger.error("Silakan periksa panduan berikut jika kamera masih tidak bisa dibuka:")
        logger.error("1. Windows Camera Privacy Settings: Buka Settings -> Privacy & security -> Camera")
        logger.error("   Pastikan 'Camera access' dan 'Let desktop apps access your camera' sudah AKTIF (ON).")
        logger.error("2. Kunci Aplikasi Lain: Pastikan tidak ada aplikasi lain (Zoom, Teams, OBS, Chrome, Discord) yang sedang menggunakan kamera.")
        logger.error("3. Penutup Fisik: Pastikan privacy shutter (penutup kamera fisik) di laptop Anda sudah dibuka.")
        logger.error("4. Indeks Kamera: Coba gunakan indeks kamera lain dengan perintah: python finger_blur.py --camera 1 (atau --camera 2)")
        return
        
    try:
        logger.info("Webcam berhasil dibuka. Menunggu sensor kamera aktif...")
        
        # Warmup loop: coba ambil frame beberapa kali jika frame pertama kosong/gagal (sensor kamera sedang aktif)
        warmup_success = False
        for i in range(15):
            success, frame = cap.read()
            if success and frame is not None:
                warmup_success = True
                # Periksa apakah gambar webcam hitam pekat
                if frame.mean() < 8.0:
                    logger.warning("⚠️ WARNING: Gambar kamera terdeteksi hitam pekat!")
                    logger.warning("-> Jika laptop kamu memiliki penutup fisik kamera (privacy shutter), pastikan penutupnya sudah digeser/dibuka.")
                    logger.warning("-> Jika kamu memiliki beberapa input kamera (seperti OBS Virtual Camera, kamera eksternal, DroidCam, dll),")
                    logger.warning(f"   coba jalankan menggunakan index kamera lain, misalnya: python finger_blur.py --camera 1 (atau --camera 2)")
                break
            logger.info(f"Percobaan pemanasan sensor kamera ke-{i+1}...")
            cv2.waitKey(200) # Tunggu 200ms
            
        if not warmup_success:
            logger.error("Gagal melakukan inisialisasi sensor kamera (frame kosong terus-menerus).")
            return
            
        # Mulai memutar musik latar secara asinkron
        play_audio(args.music)
            
        logger.info("Webcam siap! Arahkan tangan ke kamera!")
        logger.info("Tekan tombol 'q' pada jendela video untuk keluar dari program.")
        
        consecutive_failures = 0
        frame_count = 0
        while True:
            success, frame = cap.read()
            if not success or frame is None:
                consecutive_failures += 1
                if consecutive_failures > 30: # 30 frame berturut-turut gagal = tutup program
                    logger.error("Terlalu banyak kegagalan frame berturut-turut. Menutup program...")
                    break
                cv2.waitKey(30)
                continue
            
            consecutive_failures = 0
            frame_count += 1
            if frame_count % 30 == 0:
                logger.info(f"Frame #{frame_count} | Shape: {frame.shape} | Brightness (mean): {frame.mean():.2f}")
                
            # Balik gambar secara horizontal (mirror view) agar lebih natural saat dipakai
            frame = cv2.flip(frame, 1)
            
            # MediaPipe memproses warna dalam format RGB, sedangkan OpenCV menggunakan BGR
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Jalankan deteksi tangan AI
            results = hands.process(rgb_frame)
            
            blur_active: bool = False
            
            # Jika terdeteksi adanya tangan di layar
            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    # Periksa apakah tangan tersebut membuat pose tanda peace/V
                    if is_peace_sign(hand_landmarks.landmark):
                        blur_active = True
                        break  # Satu tangan terdeteksi peace sudah cukup untuk mengaktifkan blur
            
            # Terapkan efek blur jika terdeteksi pose peace
            if blur_active:
                # GaussianBlur dengan kernel sedang (35, 35) agar efek blur pas dan tidak terlalu pekat
                frame = cv2.GaussianBlur(frame, (35, 35), 0)
                
            # Tampilkan hasil gambar live ke jendela Windows
            cv2.imshow("Live Webcam - Angkat 2 Jari (Peace) untuk Blur", frame)
            
            # Berhenti jika user menekan tombol 'q' di keyboard
            if cv2.waitKey(1) & 0xFF == ord('q'):
                logger.info("Tombol 'q' ditekan. Menutup program...")
                break
                
    except Exception as e:
        logger.exception(f"Terjadi kesalahan runtime: {e}")
        
    finally:
        # Hentikan musik latar jika sedang berputar
        stop_audio()
        # Bersihkan resource agar tidak terjadi kebocoran memori kamera
        logger.info("Membersihkan resource dan menutup jendela...")
        cap.release()
        cv2.destroyAllWindows()
        hands.close()
        logger.info("Program ditutup dengan aman.")

if __name__ == "__main__":
    main()
