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
import numpy as np
from dotenv import load_dotenv

# --- .env.localファイルから環境変数を読み込む ---
#【修正点】スクリプトが実行されるルートディレクトリの.env.localを読み込む
load_dotenv(dotenv_path='.env.local') 

# ----------------- ① 設定項目 -----------------
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("エラー: .env.localからSupabaseの情報を読み込めませんでした。")
    exit()

#【修正点】スクリプトが実行されるルートディレクトリのファイルパスを指定
LINKS_FILE_PATH = 'csv_links.txt'
DOWNLOAD_DIR = 'temp_csv'

# ----------------- ② Supabaseクライアントの初期化 -----------------
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
print("Supabaseクライアントの初期化完了")

# ----------------- ③ CSVファイルのダウンロード -----------------
def download_files_from_drive():
    # ... (この関数は変更なし) ...
    # 仮の成功を返す
    print("CSVファイルのダウンロードが成功したと仮定します。")
    return True

# ----------------- ④ 市区町村マスターデータの作成とアップロード【改訂】 -----------------
def process_cities():
    print("\n--- 市区町村データの処理を開始 ---")
    # ... (CSVからcity_setを作成する部分は変更なし) ...
    city_set = {('東京都', '板橋区')} # 仮データ

    try:
        # 1. 既にDBにある市区町村を取得
        response = supabase.table('cities').select('prefecture, city').execute()
        if getattr(response, 'error', None): raise Exception(response.error)

        existing_cities = {(item['prefecture'], item['city']) for item in response.data}
        print(f"DBに既に存在する市区町村: {len(existing_cities)}件")

        # 2. DBにない、新しい市区町村だけを抽出
        new_cities_to_insert = [
            {'prefecture': pref, 'city': cty} 
            for pref, cty in city_set if (pref, cty) not in existing_cities
        ]

        if not new_cities_to_insert:
            print("新しく追加する市区町村はありませんでした。")
            return True

        # 3. 新しい市区町村だけをDBに挿入
        print(f"新しく{len(new_cities_to_insert)}件の市区町村をアップロードします...")
        response = supabase.table('cities').insert(new_cities_to_insert).execute()
        if getattr(response, 'error', None): raise Exception(response.error)

        print("市区町村マスターデータのSupabaseへのアップロードが成功しました。")
        return True
    except Exception as e:
        print(f"市区町村データのアップロード中にエラーが発生しました: {e}")
        return False

# ----------------- ⑤ ポスター掲示場データの作成とアップロード【改訂】 -----------------
def process_pins():
    print("\n--- ポスター掲示場データの処理を開始 ---")
    try:
        # 1. まず、既存のピンデータをすべて削除して、毎回クリーンな状態にする
        print("既存のピンデータを削除しています...")
        supabase.table('pins').delete().gt('id', 0).execute() # gtは 'greater than' の意味

        # 2. これから使う市区町村IDの対応表を取得
        response = supabase.table('cities').select('id, prefecture, city').execute()
        if getattr(response, 'error', None): raise Exception(response.error)
        city_map = {(c['prefecture'], c['city']): c['id'] for c in response.data}

        # ... (CSVを読み込んでall_pinsリストを作成する部分は変更なし) ...
        all_pins = [] # 仮データ

        # 3. データを分割してアップロード
        print(f"合計{len(all_pins)}件の掲示場データを準備しました。Supabaseにアップロードします...")
        chunk_size = 500
        for i in range(0, len(all_pins), chunk_size):
            chunk = all_pins[i:i + chunk_size]
            response = supabase.table('pins').insert(chunk).execute()
            if getattr(response, 'error', None): raise Exception(response.error)
            print(f"{i + len(chunk)} / {len(all_pins)} 件をアップロード完了...")

        print("掲示場データのSupabaseへのアップロードが成功しました！")
    except Exception as e:
        print(f"掲示場データのアップロード中にエラーが発生しました: {e}")

# ----------------- ⑥ スクリプトの実行 -----------------
if __name__ == "__main__":
    if download_files_from_drive():
        if process_cities():
            process_pins()