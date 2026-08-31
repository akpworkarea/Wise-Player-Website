/**
 * Mirrors Flutter's _isPlanExpired computation.
 * Returns true when a device is INACTIVE because its plan lapsed
 * (named-expired plan, or a real plan type whose expiry date has passed).
 */
export const checkPlanExpired = (plan = '', expiry = '', status = '') => {
  if (status !== 'INACTIVE') return false;

  const upper = (plan || '').toUpperCase();

  const namedExpired =
    upper.includes('EXPIRED') ||
    upper.includes('PAUSED') ||
    upper.includes('CANCELLED');

  let hasPastExpiry = false;
  if (expiry && expiry !== 'null') {
    try {
      hasPastExpiry = new Date(expiry) < new Date();
    } catch (_) {
      hasPastExpiry = false;
    }
  }

  const wasOnPlan =
    upper.includes('TRIAL') ||
    upper.includes('ANNUAL') ||
    upper.includes('MONTHLY') ||
    upper.includes('LIFETIME');

  return namedExpired || (hasPastExpiry && wasOnPlan);
};