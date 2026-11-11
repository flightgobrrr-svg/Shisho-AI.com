-- ============================================================================
-- ATOMIC USAGE: consume_usage / refund_usage (lib/usageCounters.ts).
--
-- The free allowances were read-then-write: twelve requests fired at once
-- all read "0 used" and all got through (found under load, 23 Oct 2026). These
-- functions check and count in one step under a row lock, so parallel
-- requests queue instead of slipping past each other.
--
-- consume_usage returns the uses left after this one, or -1 when the limit is
-- already reached (nothing is counted then). refund_usage gives one back, for
-- a request that ended without a real answer (a demo reply or an error).
-- service_role only, like the table itself.
-- ============================================================================
create or replace function public.consume_usage(p_visitor uuid, p_kind text, p_limit integer, p_period_seconds integer)
returns integer
language plpgsql
security definer set search_path = public
as $$
declare
  v_count integer;
  v_start timestamptz;
begin
  insert into usage_counters (visitor_id, kind, count, period_start, updated_at)
  values (p_visitor, p_kind, 0, now(), now())
  on conflict (visitor_id, kind) do nothing;

  select count, period_start into v_count, v_start
  from usage_counters
  where visitor_id = p_visitor and kind = p_kind
  for update;

  if now() - v_start > make_interval(secs => p_period_seconds) then
    v_count := 0;
    v_start := now();
  end if;

  if v_count >= p_limit then
    update usage_counters set count = v_count, period_start = v_start, updated_at = now()
    where visitor_id = p_visitor and kind = p_kind;
    return -1;
  end if;

  update usage_counters set count = v_count + 1, period_start = v_start, updated_at = now()
  where visitor_id = p_visitor and kind = p_kind;
  return p_limit - v_count - 1;
end;
$$;

create or replace function public.refund_usage(p_visitor uuid, p_kind text)
returns void
language sql
security definer set search_path = public
as $$
  update usage_counters set count = greatest(count - 1, 0), updated_at = now()
  where visitor_id = p_visitor and kind = p_kind;
$$;

revoke execute on function public.consume_usage(uuid, text, integer, integer) from anon, authenticated, public;
revoke execute on function public.refund_usage(uuid, text) from anon, authenticated, public;

