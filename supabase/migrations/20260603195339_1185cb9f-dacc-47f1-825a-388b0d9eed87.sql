
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;
-- no policies = no one via API can read it; trigger uses SECURITY DEFINER

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
