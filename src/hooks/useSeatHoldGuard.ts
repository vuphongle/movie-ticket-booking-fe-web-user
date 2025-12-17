import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { cancelSeatMultiBeacon } from "@/utils/cancelSeatMultiBeacon";
import { isPaymentRedirectingNow } from "@/utils/paymentRedirectFlag";


export const PAYMENT_REDIRECT_FLAG = "gc_payment_redirecting";
const RELOAD_FLAG = "gc_reloading";

export function useSeatHoldGuard(params: {
  bookingData: any;
  clearTimer?: () => void;
  isProceedingRef?: React.MutableRefObject<boolean>;
}) {
  const { bookingData, clearTimer, isProceedingRef } = params;
  const location = useLocation();

  useEffect(() => {
    if (!bookingData?.seats?.length) return;

    const showtimeId = bookingData.showtimeId;
    const seatIds = bookingData.seats.map((s: any) => s.id);

    const allowedPrefixes = ["/booking/additional", "/booking/confirm", "/payment"];
    const isAllowed = (path: string) => allowedPrefixes.some(p => path.startsWith(p));

    sessionStorage.removeItem(RELOAD_FLAG);

    const shouldSkipCancel = () => {
      const isPaymentRedirecting = isPaymentRedirectingNow();
      const isReloading = sessionStorage.getItem(RELOAD_FLAG) === "1";
      if (isReloading) return true; 
      if (isPaymentRedirecting) return true;  
      if (isProceedingRef?.current) return true; 
      // chỉ giữ ghế trong flow
      if (!isAllowed(location.pathname)) return true;
      return false;
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sessionStorage.setItem(RELOAD_FLAG, "1");
      }
    };

    const onPageHide = () => {
      if (shouldSkipCancel()) return;
      cancelSeatMultiBeacon(showtimeId, seatIds);
      clearTimer?.();
    };

    const onBeforeUnload = () => {
      if (shouldSkipCancel()) return;
      cancelSeatMultiBeacon(showtimeId, seatIds);
      clearTimer?.();
    };

    document.addEventListener("visibilitychange", onVisibilityChange, true);
    window.addEventListener("pagehide", onPageHide, true);
    window.addEventListener("beforeunload", onBeforeUnload, true);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange, true);
      window.removeEventListener("pagehide", onPageHide, true);
      window.removeEventListener("beforeunload", onBeforeUnload, true);
    };
  }, [bookingData, location.pathname, clearTimer, isProceedingRef]);
}
