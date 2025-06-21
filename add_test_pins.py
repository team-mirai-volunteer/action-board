#!/usr/bin/env python3
"""
Python script to add test pins data to the poster map database.
This script adds new pins to test that newly added pins display correctly on the poster map.
"""

import os
import sys
from supabase import create_client, Client

def main():
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("Error: Missing Supabase environment variables")
        print("Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set")
        sys.exit(1)
    
    supabase: Client = create_client(supabase_url, supabase_key)
    
    try:
        city_result = supabase.table('cities').select('id').eq('prefecture', '東京都').eq('city', '中央区').execute()
        if not city_result.data:
            print("Error: Could not find city ID for 東京都 中央区")
            sys.exit(1)
        city_id = city_result.data[0]['id']
        print(f"Found city ID: {city_id}")
    except Exception as e:
        print(f"Error getting city ID: {e}")
        sys.exit(1)
    
    test_pins = [
        {
            'number': '011',
            'address': '東京都中央区銀座4-6-16',
            'place_name': '銀座四丁目交差点掲示板',
            'lat': 35.6717,
            'long': 139.7640,
            'status': 0,  # 未
            'note': 'Python script で追加されたテストピン - 銀座四丁目交差点',
            'city_id': city_id
        },
        {
            'number': '012',
            'address': '東京都中央区築地5-2-1',
            'place_name': '築地本願寺前掲示板',
            'lat': 35.6735,
            'long': 139.7707,
            'status': 4,  # 要確認
            'note': 'Python script で追加されたテストピン - 築地本願寺前',
            'city_id': city_id
        },
        {
            'number': '013',
            'address': '東京都中央区日本橋1-4-1',
            'place_name': '日本橋三越前掲示板',
            'lat': 35.6851,
            'long': 139.7727,
            'status': 1,  # 完了
            'note': 'Python script で追加されたテストピン - 日本橋三越前',
            'city_id': city_id
        }
    ]
    
    try:
        result = supabase.table('pins').insert(test_pins).execute()
        print(f"Successfully added {len(result.data)} test pins:")
        for pin in result.data:
            print(f"  - Pin #{pin['number']}: {pin['place_name']} (Status: {pin['status']})")
        
        print("\nTest pins added successfully!")
        print("You can now test these pins on the poster map at: http://localhost:3000/map/poster/東京都")
        
    except Exception as e:
        print(f"Error inserting test pins: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
