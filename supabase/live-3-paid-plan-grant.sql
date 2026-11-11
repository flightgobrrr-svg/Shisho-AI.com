-- ============================================================================
-- PAID PLAN GRANT: grant_paid_plan (lib/payments.ts confirmPayment).
--
-- confirmPayment used to mark the payment paid and then, as a second call,
-- write the plan. A failure between the two left a paid row with no plan,
-- and every retry saw "already paid" and stopped. Two payments confirming
-- together could also both read the same expiry and lose a month.
--
-- This does both writes in one transaction, with the payment and profile rows
-- locked, so a callback and a webhook arriving together queue: the first
-- grants, the second finds the row paid and returns the expiry unchanged.
--
-- Another month of the same plan adds on from the current expiry; a
-- different plan starts today (lib/payments.ts refuses to sell a cheaper plan
-- over an active dearer one). A plan set by hand to never lapse stays so.
-- Returns the plan's expiry. service_role only.
-- ============================================================================
create or replace function public.grant_paid_plan(p_payment uuid, p_payment_ref text)
returns timestamptz
language plpgsql
security definer set search_path = public
as $$
declare
  v_pay payments%rowtype;
  v_plan text;
  v_expires timestamptz;
begin
  select * into v_pay from payments where id = p_payment for update;
  if not found then
    raise exception 'payment % not found', p_payment;
  end if;

  select plan, plan_expires_at into v_plan, v_expires
  from profiles where id = v_pay.user_id for update;
  if not found then
    raise exception 'profile % not found', v_pay.user_id;
  end if;

  if v_pay.status = 'paid' then
    return v_expires;
  end if;

  if v_plan = v_pay.plan and v_expires is null then
    null; -- set by hand to never lapse: nothing to add
  elsif v_plan = v_pay.plan and v_expires > now() then
    v_expires := v_expires + interval '30 days';
  else
    v_expires := now() + interval '30 days';
  end if;

  update profiles
  set plan = v_pay.plan, plan_expires_at = v_expires, updated_at = now()
  where id = v_pay.user_id;

  update payments
  set status = 'paid', payment_id = p_payment_ref, paid_at = now()
  where id = p_payment;

  return v_expires;
end;
$$;

revoke execute on function public.grant_paid_plan(uuid, text) from anon, authenticated, public;
