export const PAYMENT_REDIRECT_FLAG = "gc_payment_redirecting";
const FLAG_TS = PAYMENT_REDIRECT_FLAG + "_ts";
const TTL_MS = 75_000; // Thời gian tính từ lúc redirect sang cổng thanh toán đến khi quay về

export function markPaymentRedirecting() {
  sessionStorage.setItem(PAYMENT_REDIRECT_FLAG, "1");
  sessionStorage.setItem(FLAG_TS, String(Date.now()));
}

export function clearPaymentRedirecting() {
  sessionStorage.removeItem(PAYMENT_REDIRECT_FLAG);
  sessionStorage.removeItem(FLAG_TS);
}

export function isPaymentRedirectingNow() {
  const flag = sessionStorage.getItem(PAYMENT_REDIRECT_FLAG) === "1";
  if (!flag) return false;

  const ts = Number(sessionStorage.getItem(FLAG_TS) || 0);
  const stillValid = Date.now() - ts < TTL_MS;

  // hết hạn thì tự clear để không bị kẹt
  if (!stillValid) clearPaymentRedirecting();

  return stillValid;
}
