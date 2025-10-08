import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

interface UseBookingTimerOptions {
  autoCancel?: boolean; // Có tự hủy ghế khi hết thời gian không
  onExpire?: () => void; // Callback khi hết thời gian
}

/**
 * Hook quản lý đồng bộ thời gian giữ ghế
 */
export const useBookingTimer = (options?: UseBookingTimerOptions) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [expireAt, setExpireAt] = useState<number | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Đọc expireAt từ state hoặc sessionStorage
  useEffect(() => {
    const stateExpireAt = location.state?.expireAt;
    const saved = sessionStorage.getItem('expireAt');

    if (stateExpireAt) {
      setExpireAt(stateExpireAt);
      sessionStorage.setItem('expireAt', stateExpireAt.toString());
    } else if (saved) {
      setExpireAt(Number(saved));
    }
  }, [location.state]);

  // Đếm ngược theo expireAt
  useEffect(() => {
    if (!expireAt) return;

    const update = () => {
      const diff = Math.max(0, Math.floor((expireAt - Date.now()) / 1000));
      setTimer(diff);

      if (diff <= 0) {
        clearInterval(timerRef.current!);
        if (options?.autoCancel) {
          options.onExpire?.();
          sessionStorage.removeItem('expireAt');

          Swal.fire({
            title: 'Hết thời gian giữ ghế!',
            text: 'Quá trình đặt vé đã bị hủy. Vui lòng thao tác lại.',
            icon: 'warning',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
          }).then(() => {
            navigate('/');
          });
        }
      }
    };

    update();
    timerRef.current = setInterval(update, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [expireAt]);

  // Hàm khởi tạo expireAt lần đầu
  const startTimer = (durationInSec: number) => {
    const newExpireAt = Date.now() + durationInSec * 1000;
    setExpireAt(newExpireAt);
    sessionStorage.setItem('expireAt', newExpireAt.toString());
    return newExpireAt;
  };

  // Hàm reset hoặc hủy timer (khi đặt xong)
  const clearTimer = () => {
    sessionStorage.removeItem('expireAt');
    setExpireAt(null);
    setTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Hủy đặt ghế khi tắt tab
  //   useEffect(() => {
  //     const handlePageHide = (event: PageTransitionEvent) => {
  //       const navEntry = performance.getEntriesByType('navigation')[0] as
  //         | PerformanceNavigationTiming
  //         | undefined;

  //       // Nếu lý do rời trang là "reload" thì bỏ qua
  //       if (navEntry?.type === 'reload') {
  //         return;
  //       }

  //       const expireAt = sessionStorage.getItem('expireAt');
  //       if (!expireAt) return;

  //       if (options?.autoCancel && options?.onExpire) {
  //         try {
  //           options.onExpire();

  //           const bookingData = JSON.parse(
  //             sessionStorage.getItem('bookingPageState') || '{}'
  //           );

  //           if (bookingData?.seats?.length) {
  //             const payload = {
  //               showtimeId: bookingData.showtimeId,
  //               seats: bookingData.seats.map((s: any) => s.id),
  //             };

  //             const blob = new Blob([JSON.stringify(payload)], {
  //               type: 'application/json',
  //             });

  //             navigator.sendBeacon(
  //               `${import.meta.env.VITE_API_URL}/reservation/cancelSeats`,
  //               blob
  //             );
  //           }
  //         } catch (err) {
  //           console.error('Beacon send failed:', err);
  //         }
  //       }

  //       sessionStorage.removeItem('expireAt');
  //     };

  //     window.addEventListener('pagehide', handlePageHide);
  //     return () => window.removeEventListener('pagehide', handlePageHide);
  //   }, [options]);

  return { timer, expireAt, startTimer, clearTimer };
};
