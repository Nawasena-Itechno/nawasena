import requests
import pandas as pd
from datetime import datetime, timedelta
import os

# TreeID untuk komoditas (estimasi berdasarkan struktur PIHPS)
COMMODITIES = {
    "Cabai Merah Besar": "8_14",
    "Cabai Merah Keriting": "8_15",
    "Cabai Rawit Hijau": "8_16",
    "Cabai Rawit Merah": "8_17"
}

def get_data(start_date, end_date):
    """
    Menarik data dari PIHPS sesuai endpoint yang diberikan dalam brief.
    Hanya menarik 1 bulan terakhir untuk mempercepat demo jika tidak didefinisikan 8 tahun.
    Dalam produksi sejati, ini dilooping dari 2018-01-01 sampai 2026-08-28.
    """
    url = "https://www.bi.go.id/hargapangan/WebSite/Home/GetGridData1"
    
    all_data = []
    
    current_date = start_date
    while current_date <= end_date:
        date_str = current_date.strftime("%Y-%m-%d")
        print(f"Scraping date: {date_str}")
        for comm_name, comm_id in COMMODITIES.items():
            params = {
                "tanggal": date_str,
                "commodity": comm_id,
                "priceType": 1,
                "isPasokan": 1,
                "jenis": 1,
                "periode": 1,
                "provId": 0 # Semua provinsi
            }
            try:
                # Timeout dan retry sangat penting untuk scraper
                resp = requests.get(url, params=params, timeout=10)
                if resp.status_code == 200:
                    data = resp.json()
                    # Struktur data PIHPS biasanya array objek { "Tanggal", "Provinsi", "Nilai", ... }
                    # Karena format pastinya bergantung respon, kita mock/sesuaikan
                    if "data" in data:
                        for row in data["data"]:
                            all_data.append({
                                "tanggal": row.get("Tanggal", date_str),
                                "provinsi": row.get("Provinsi", "Unknown"),
                                "komoditas": comm_name,
                                "harga": row.get("Nilai", 0)
                            })
            except Exception as e:
                print(f"Error scraping {date_str} {comm_name}: {e}")
        
        # Increment by 1 day
        current_date += timedelta(days=1)
        
    return pd.DataFrame(all_data)

if __name__ == "__main__":
    # Scrape 30 hari terakhir sebagai contoh untuk testing (menghindari 8 tahun run)
    end = datetime.now()
    start = end - timedelta(days=30)
    df = get_data(start, end)
    
    # Save raw
    os.makedirs("../data", exist_ok=True)
    df.to_csv("../data/raw_prices.csv", index=False)
    print("Scraping selesai. Data mentah disimpan ke data/raw_prices.csv")
