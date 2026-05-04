create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  claims jsonb;
  user_brewery_id uuid;
  user_id uuid;
begin
  claims := coalesce(event->'claims', '{}'::jsonb);
  user_id := nullif(event->>'user_id', '')::uuid;

  -- Tier 1: fast path — read from app_metadata.brewery_id
  user_brewery_id := nullif(claims->'app_metadata'->>'brewery_id', '')::uuid;

  -- Tier 2: authoritative fallback — read from public.users
  if user_brewery_id is null and user_id is not null then
    select u.brewery_id into user_brewery_id
    from public.users u
    where u.id = user_id;
  end if;

  -- Inject as top-level claim if resolved
  if user_brewery_id is not null then
    claims := jsonb_set(claims, '{brewery_id}', to_jsonb(user_brewery_id::text), true);
  end if;

  return jsonb_set(event, '{claims}', claims, true);
end;
$$;

grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;

comment on function public.custom_access_token_hook(jsonb) is
  'Supabase Auth Custom Access Token Hook. Must be enabled in Dashboard > Authentication > Hooks > Custom Access Token.';
