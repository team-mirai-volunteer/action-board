"""
このスクリプトは、Googleドライブ上にある複数の市区町村別CSVファイルを自動で統合し、
正規化されたSupabaseデータベースにデータを登録するためのツールです。

【使い方】
このスクリプトを実行する前に、以下の準備が必要です。

1. 必要なライブラリをインストールします:
   ターミナルで以下のコマンドを実行してください。
   $ python -m pip install pandas supabase gdown python-dotenv

2. .env.local ファイルの作成:
   このプロジェクトのルートフォルダに`.env.local`という名前のファイルを作成し、
   以下の内容を記述してください（値は別途共有されます）。
   NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

3. csv_links.txt ファイルの作成:
   プロジェクトのルートフォルダに`csv_links.txt`という名前のファイルを作成し、
   対象となるGoogleドライブの「フォルダ共有リンク」を一行ずつ記述してください。

4. スクリプトの実行:
   準備が完了したら、プロジェクトのルートディレクトリで以下のコマンドを実行します。
   $ python integrate_and_upload.py
"""

import pandas as pd
from supabase import create_client, Client
import os
import gdown
import shutil
from dotenv import load_dotenv
import numpy as np # NaNを扱うためにnumpyをインポート

# --- .env.localファイルから環境変数を読み込む ---
load_dotenv(dotenv_path='.env.local') 

# ----------------- ① 設定項目 -----------------
# ハードコードされたキーの代わりに、環境変数から読み込む
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

# スクリプトを実行する前に、キーが設定されているか確認する
if not SUPABASE_URL or not SUPABASE_KEY:
    print("エラー: SupabaseのURLまたはキーが.env.localファイルに設定されていません。")
    print("プロジェクトのルートに.env.localファイルを作成し、以下の内容を記述してください。")
    print("NEXT_PUBLIC_SUPABASE_URL=あなたのSupabaseのURL")
    print("NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのSupabaseのANONキー")
    exit() # キーがなければスクリプトを終了
    
# Googleドライブの「フォルダ」リンクが書かれたテキストファイル
LINKS_FILE_PATH = 'csv_links.txt'
# ダウンロードしたCSVを一時的に保存するフォルダ
DOWNLOAD_DIR = 'temp_csv'

# ----------------- ② Supabaseクライアントの初期化 -----------------
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
print("Supabaseクライアントの初期化完了")

# ----------------- ③ CSVファイルのダウンロード -----------------
def download_files_from_drive():
    if os.path.exists(DOWNLOAD_DIR):
        shutil.rmtree(DOWNLOAD_DIR)
        print(f"古いフォルダを削除: {DOWNLOAD_DIR}")

    os.makedirs(DOWNLOAD_DIR)
    print(f"一時フォルダを作成: {DOWNLOAD_DIR}")

    try:
        with open(LINKS_FILE_PATH, 'r', encoding='utf-8') as f:
            urls = [line.strip() for line in f if line.strip()]
        
        print(f"{len(urls)}個のGoogleドライブリンクを読み込みました。")

        for i, url in enumerate(urls):
            print(f"\n[{i+1}/{len(urls)}] フォルダのダウンロードを試みます: {url}")
            if 'drive.google.com/drive/folders/' not in url:
                print("エラー: このリンクはフォルダの共有リンクではありません。スキップします。")
                continue
            try:
                gdown.download_folder(url, output=DOWNLOAD_DIR, quiet=False, use_cookies=False)
                print(f"ダウンロード成功: {url}")
            except Exception as e:
                print(f"ダウンロード失敗: {url}")
                print("--- エラー詳細 ---")
                print(e)
                print("-------------------")
                print("【確認】上記のエラーメッセージを確認し、Googleドライブのフォルダの共有設定が「リンクを知っている全員」になっているか、再度ご確認ください。")
        
        return True
    except FileNotFoundError:
        print(f"エラー: {LINKS_FILE_PATH} が見つかりません。")
        return False

# ----------------- ④ 市区町村マスターデータの作成とアップロード -----------------
def process_cities():
    print("\n--- 市区町村データの処理を開始 ---")
    city_set = set()
    all_files = [os.path.join(path, name) for path, subdirs, files in os.walk(DOWNLOAD_DIR) for name in files if name.endswith('.csv')]
    
    if not all_files:
        print("ダウンロードされたCSVファイルがありません。処理を中断します。")
        return False

    for filepath in all_files:
        try:
            df = pd.read_csv(filepath, usecols=['prefecture', 'city'], encoding='utf-8-sig')
            unique_cities = df.drop_duplicates()
            for index, row in unique_cities.iterrows():
                city_set.add((row['prefecture'], row['city']))
        except Exception as e:
            print(f"ファイル読み込みエラー: {filepath}, エラー: {e}")
    
    if not city_set:
        print("市区町村データが抽出できませんでした。")
        return False

    cities_df = pd.DataFrame(list(city_set), columns=['prefecture', 'city'])
    print(f"ユニークな市区町村を{len(cities_df)}件抽出しました。")

    records = cities_df.to_dict(orient='records')
    try:
        response = supabase.table('cities').upsert(records, on_conflict='prefecture,city').execute()
        if response.data is None and getattr(response, 'error', None):
             raise Exception(response.error)
        print("市区町村マスターデータのSupabaseへのアップロードが成功しました。")
        return True
    except Exception as e:
        print(f"市区町村データのアップロード中にエラーが発生しました: {e}")
        return False

# ----------------- ⑤ ポスター掲示場データの作成とアップロード -----------------
def process_pins():
    print("\n--- ポスター掲示場データの処理を開始 ---")
    
    try:
        response = supabase.table('cities').select('id, prefecture, city').execute()
        if response.data:
            cities_list = response.data
            city_map = {(c['prefecture'], c['city']): c['id'] for c in cities_list}
            print(f"Supabaseから{len(city_map)}件の市区町村IDを取得しました。")
        else:
            raise Exception("市区町村データの取得に失敗")
    except Exception as e:
        print(f"エラー: {e}")
        return

    all_pins = []
    all_files = [os.path.join(path, name) for path, subdirs, files in os.walk(DOWNLOAD_DIR) for name in files if name.endswith('.csv')]

    for filepath in all_files:
        try:
            df = pd.read_csv(filepath, encoding='utf-8-sig')
            
            #【修正点】NaN（非数）をNone（null）に置換して、JSONエラーを防ぐ
            df = df.replace({np.nan: None}) 

            for index, row in df.iterrows():
                city_id = city_map.get((row['prefecture'], row['city']))
                if city_id:
                    pin_record = {
                        'city_id': city_id,
                        'number': row.get('number'),
                        'address': row.get('address'),
                        'place_name': row.get('name'),
                        'lat': row.get('lat'),
                        'long': row.get('long'),
                        'status': 0,
                        'note': None
                    }
                    all_pins.append(pin_record)
        except Exception as e:
            print(f"ファイル処理エラー: {filepath}, エラー: {e}")

    if not all_pins:
        print("掲示場データがありません。")
        return

    print(f"合計{len(all_pins)}件の掲示場データを準備しました。Supabaseにアップロードします...")
    
    try:
        chunk_size = 500
        for i in range(0, len(all_pins), chunk_size):
            chunk = all_pins[i:i + chunk_size]
            response = supabase.table('pins').insert(chunk).execute()
            if response.data is None and getattr(response, 'error', None):
                 raise Exception(response.error)
            print(f"{i + len(chunk)} / {len(all_pins)} 件をアップロード完了...")

        print("掲示場データのSupabaseへのアップロードが成功しました！")
    except Exception as e:
        print(f"掲示場データのアップロード中にエラーが発生しました: {e}")

# ----------------- ⑥ スクリプトの実行 -----------------
if __name__ == "__main__":
    if download_files_from_drive():
        if process_cities():
            process_pins()
