-- Update party_memberships.user_id to reference auth.users(id)
ALTER TABLE public.party_memberships
  DROP CONSTRAINT IF EXISTS party_memberships_user_id_fkey;

ALTER TABLE public.party_memberships
  ADD CONSTRAINT party_memberships_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;
