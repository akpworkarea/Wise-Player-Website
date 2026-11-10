import { checkoutPayment, fetchPublicPlans } from '../auth/apiservice';

/** Mirrors the gateway's own exclude markers so we can undo them on renewals. */
const EXPIRY_MARKERS = ['EXPIRED', 'EXPIRE', 'LAPSED', 'PAUSED', 'CANCELLED', 'CANCELED', 'OVERDUE'];

const tokens = (value) =>
  String(value ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '')
    .trim();

const stripMarkers = (value) => {
  let out = String(value ?? '').toUpperCase();
  EXPIRY_MARKERS.forEach((marker) => {
    out = out.split(marker).join('_');
  });
  return tokens(out.replace(/_/g, ''));
};

/**
 * PayPal's return trip has to land on a route that actually exists — the old
 * successUrl pointed at /invoice, which was never registered, so the buyer was
 * dumped through the catch-all back onto the marketing page with a modal on top.
 */
export const buildCheckoutUrls = () => {
  const origin = window.location.origin;
  return {
    successUrl: `${origin}/payment-status?paymentStatus=success`,
    cancelUrl: `${origin}/upload-list?paymentStatus=cancel`,
  };
};

/**
 * Figures out which plan to charge a lapsed device for.
 *
 * An expired device may carry a decorated plan name ("EXPIRED_MONTHLY",
 * "MONTHLY_CANCELLED"), so we strip the marker before matching. Returns null
 * when we genuinely cannot tell — the caller then sends the user to the pricing
 * table instead of silently charging them for the wrong plan.
 */
export const resolveRenewPlanName = (devicePlan, plans = []) => {
  const catalog = (Array.isArray(plans) ? plans : [])
    .filter((plan) => plan && plan.name)
    .map((plan) => ({ name: plan.name, key: tokens(plan.name) }));

  const rawKey = tokens(devicePlan);
  if (!rawKey) return catalog[0]?.name ?? null;

  const candidates = [rawKey, stripMarkers(devicePlan)].filter(Boolean);

  for (const candidate of candidates) {
    const exact = catalog.find((plan) => plan.key === candidate);
    if (exact) return exact.name;
  }

  for (const candidate of candidates) {
    const partial = catalog.find(
      (plan) => plan.key.includes(candidate) || candidate.includes(plan.key),
    );
    if (partial) return partial.name;
  }

  // An unrecognised name is still a real name — the backend is the authority on
  // which plan names it accepts, so pass it through rather than blocking payment.
  return candidates[0] || null;
};

let plansCache = null;

/** Public plan list, fetched at most once per page load. */
export const getPublicPlans = async () => {
  if (plansCache) return plansCache;
  const data = await fetchPublicPlans();
  plansCache = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  return plansCache;
};

/**
 * The single PayPal handoff. Creates the checkout session and hard-navigates
 * the browser to the gateway URL.
 *
 * @returns {Promise<{ok: boolean, error?: string, needsPlanChoice?: boolean}>}
 */
export const startCheckout = async ({ deviceId, planName, plans } = {}) => {
  if (!deviceId) return { ok: false, error: 'missing_device' };

  let plan = planName;
  if (!plan) {
    plan = resolveRenewPlanName('', plans ?? (await getPublicPlans()));
  }

  if (!plan) {
    // Cannot determine what to charge — let the buyer pick from the pricing table.
    return { ok: false, error: 'needs_plan_choice' };
  }

  const { successUrl, cancelUrl } = buildCheckoutUrls();
  const res = await checkoutPayment({ deviceId, planName: plan, successUrl, cancelUrl });

  if (!res.success) return { ok: false, error: res.message || 'checkout_failed' };

  const checkoutUrl = res.data?.checkoutUrl || res.data?.data?.checkoutUrl || res.data?.redirectUrl;
  if (!checkoutUrl) return { ok: false, error: 'missing_checkout_url' };

  window.location.href = checkoutUrl;
  return { ok: true };
};
