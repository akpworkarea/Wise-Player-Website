/**
 * Single source of truth for "can this device watch, and if not, does it owe us money?".
 *
 * This replaces the three near-identical (and mutually divergent) copies of the
 * decision logic that used to live in Home.jsx, UploadList.jsx and Activation.jsx.
 * Every gate must now call `resolveDeviceAccess()` so they can never disagree again.
 */

export const DEVICE_ACCESS = {
  /** Plan is live — the device may reach its playlists. */
  ACTIVE: 'ACTIVE',
  /** Device is INACTIVE *because a paid plan lapsed* — it MUST go to PayPal. */
  EXPIRED: 'INACTIVE_EXPIRED',
  /** Registered but never paid — needs a free activation key, not a card. */
  NEEDS_ACTIVATION: 'INACTIVE_NEW',
  /** Backend says the device is ACTIVE but refuses to serve it. */
  BLOCKED: 'BLOCKED',
  /** No such device on the backend. */
  NOT_FOUND: 'NOT_FOUND',
};

const ACTIVE_STATUSES = ['ACTIVE', 'ENABLED', 'APPROVED', 'RUNNING', 'LIVE', 'OK'];

// Plan names that mean "a plan ended" rather than "a plan is named".
const EXPIRY_MARKERS = ['EXPIRED', 'EXPIRE', 'LAPSED', 'PAUSED', 'CANCELLED', 'CANCELED', 'OVERDUE'];

// Plan names that never lapse, so a stale date on them must NOT force a re-charge.
const PERPETUAL_MARKERS = ['LIFETIME', 'LIFETIMES', 'UNLIMITED', 'FOREVER', 'PERPETUAL', 'PERPETUAL_ACCESS'];

const toTokens = (value) =>
  String(value ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim();

/** Normalises whatever the API sends into one of the DEVICE_ACCESS buckets' statuses. */
export const normalizeStatus = (status) => toTokens(status).split(' ')[0] || '';

/**
 * Parses an expiry value into a Date, or null.
 * `new Date('garbage')` never throws — it yields Invalid Date — so an explicit
 * validity check is the only way to tell "no expiry" from "unparseable expiry".
 */
export const parseExpiry = (expiry) => {
  if (expiry === null || expiry === undefined || expiry === '') return null;

  if (expiry instanceof Date) return Number.isNaN(expiry.getTime()) ? null : expiry;

  const raw = String(expiry).trim();
  if (!raw || raw.toLowerCase() === 'null' || raw.toLowerCase() === 'undefined' || raw === '-') return null;

  // Backend sometimes sends epoch millis as a number-in-a-string.
  if (/^\d{10,13}$/.test(raw)) {
    const ms = Number(raw);
    const fromEpoch = new Date(raw.length === 10 ? ms * 1000 : ms);
    return Number.isNaN(fromEpoch.getTime()) ? null : fromEpoch;
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/** True when we can prove the plan's clock has run out. */
export const isExpiryInPast = (expiry) => {
  const date = parseExpiry(expiry);
  return date !== null && date.getTime() < Date.now();
};

/**
 * Mirrors Flutter's _isPlanExpired computation.
 * Returns true when a device is INACTIVE because its plan lapsed.
 *
 * Fixes over the old version:
 *  - the `wasOnPlan` name whitelist is gone. A device on any plan whose expiry
 *    date has passed is expired, so we stop silently routing real paying
 *    customers into the "never activated, get a free key" branch.
 *  - LIFETIME / UNLIMITED are immune to a stale date, so lifetime buyers are
 *    never re-charged.
 *  - status is normalised, so "inactive" / " INACTIVE " no longer falls through.
 *  - the dead try/catch is gone; parseExpiry does the real validation.
 */
export const checkPlanExpired = (plan = '', expiry = '', status = '') => {
  const tokens = toTokens(plan);
  const statusToken = normalizeStatus(status);

  // An explicitly live device is never "expired" — the API is the authority on
  // whether it is still serving content, whatever a stale date column says.
  if (ACTIVE_STATUSES.includes(statusToken)) return false;

  // A status that is itself an expiry marker settles it outright.
  if (EXPIRY_MARKERS.some((marker) => statusToken.includes(marker))) return true;

  if (EXPIRY_MARKERS.some((marker) => tokens.includes(marker))) return true;

  const parsed = parseExpiry(expiry);
  if (parsed === null) return false;

  // LIFETIME / UNLIMITED never lapse, so a leftover date must not re-charge them.
  if (PERPETUAL_MARKERS.some((marker) => tokens.includes(marker))) return false;

  return parsed.getTime() < Date.now();
};

/** Substring match — only valid for markers, e.g. "MONTHLY" ⊂ "EXPIRED_MONTHLY". */
const hasMarker = (haystack, markers) => markers.some((marker) => haystack.includes(marker));

/**
 * The one function every gate calls. Turns a raw /api/device/validate payload
 * into an actionable verdict.
 *
 * @param {object} data raw validateDevice response body
 * @returns {{
 *   code: string, status: string, allowed: boolean, plan: string,
 *   expiry: string, expired: boolean, mustPay: boolean
 * }}
 */
export const resolveDeviceAccess = (data) => {
  if (!data || typeof data !== 'object') {
    return {
      code: DEVICE_ACCESS.NOT_FOUND,
      status: '',
      // No payload means we know nothing — don't lock the user out on a guess.
      allowed: true,
      plan: '',
      expiry: '',
      expired: false,
      mustPay: false,
    };
  }

  const status = normalizeStatus(data.status);
  // Treat a missing flag as permissive. Defaulting to `false` used to make a
  // backend that simply omits `allowed` look like a blocked device.
  const allowed = data.allowed !== false;

  const plan = data.subscriptionType ?? data.plan ?? data.planName ?? '';
  const expiry = data.expiresAt ?? data.expiredAt ?? data.expiry ?? data.expiryDate ?? '';

  // An explicit server-side expiry flag beats every date heuristic.
  const flaggedExpired =
    data.isExpired === true ||
    data.expired === true ||
    data.planExpired === true ||
    hasMarker(normalizeStatus(data.deviceStatus), EXPIRY_MARKERS);

  // Exact match only. A substring test here would read "INACTIVE" as
  // "ACTIVE" and treat every inactive device as a paying customer.
  const active = ACTIVE_STATUSES.includes(status);

  if (active) {
    return {
      code: allowed ? DEVICE_ACCESS.ACTIVE : DEVICE_ACCESS.BLOCKED,
      status,
      allowed,
      plan,
      expiry,
      expired: false,
      mustPay: false,
    };
  }

  const expired = flaggedExpired || checkPlanExpired(plan, expiry, status);

  return {
    code: expired ? DEVICE_ACCESS.EXPIRED : DEVICE_ACCESS.NEEDS_ACTIVATION,
    status,
    allowed,
    plan,
    expiry,
    expired,
    // THE rule the whole flow hangs on: a lapsed plan always owes money.
    mustPay: expired,
  };
};
