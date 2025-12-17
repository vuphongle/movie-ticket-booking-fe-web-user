import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { cancelSeatMultiBeacon } from "@/utils/cancelSeatMultiBeacon";
// import { PAYMENT_REDIRECT_FLAG } from "@/hooks/useSeatHoldGuard";
import { isPaymentRedirectingNow } from "@/utils/paymentRedirectFlag";

export default function BookingFlowGuard() {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    const allowedPrefixes = ["/booking/additional", "/booking/confirm", "/payment"];
    const isAllowed = (path: string) =>
      allowedPrefixes.some((p) => path.startsWith(p));

    const prevPath = prevPathRef.current;
    const nextPath = location.pathname;

    if (isAllowed(prevPath) && !isAllowed(nextPath)) {
      const isPaymentRedirecting = isPaymentRedirectingNow();
      if (!isPaymentRedirecting) {
        const raw = sessionStorage.getItem("bookingData");
        const bookingData = raw ? JSON.parse(raw) : null;

        if (bookingData?.seats?.length) {
          cancelSeatMultiBeacon(
            bookingData.showtimeId,
            bookingData.seats.map((s: any) => s.id)
          );
          sessionStorage.removeItem("expireAt");
        }
      }
    }

    prevPathRef.current = nextPath;
  }, [location.pathname]);

  return null;
}
