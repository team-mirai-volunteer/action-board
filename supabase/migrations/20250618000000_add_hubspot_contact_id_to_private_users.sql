-- private_usersテーブルにhubspot_contact_idカラムを追加
ALTER TABLE private_users 
ADD COLUMN hubspot_contact_id VARCHAR(50);

COMMENT ON COLUMN private_users.hubspot_contact_id IS 'HubSpotのコンタクトID。HubSpot連携時に設定される。NULL可能';