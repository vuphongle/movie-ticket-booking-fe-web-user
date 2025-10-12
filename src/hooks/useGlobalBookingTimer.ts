// import { useEffect, useRef } from 'react';
// import { useCancelSeatMutation } from '@app/services/reservation.api';

// export const useGlobalBookingTimer = () => {
//   const [cancelSeat] = useCancelSeatMutation();
//   const timerRef = useRef<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     const savedExpireAt = sessionStorage.getItem('expireAt');
//     const heldData = sessionStorage.getItem('heldSeat');
//     console.log('Held seat data:', heldData);
//     if (!savedExpireAt || !heldData) return;

//     const expireAt = Number(savedExpireAt);
//     const { showtimeId, seats } = JSON.parse(heldData);

//     const update = () => {
//       const diff = expireAt - Date.now();
//       if (diff <= 0) {
//         clearInterval(timerRef.current!);

//         seats.forEach((s: any) => {
//           cancelSeat({ seatId: s.seatId, showtimeId })
//             .unwrap()
//             .then(() => console.log('Ghế', s.seatId, 'đã được hủy.'))
//             .catch((err) => console.error('Lỗi hủy ghế:', err));
//         });

//         sessionStorage.removeItem('expireAt');
//         sessionStorage.removeItem('heldSeat');
//       }
//     };

//     update();
//     timerRef.current = setInterval(update, 1000);

//     return () => {
//       if (timerRef.current) clearInterval(timerRef.current);
//     };
//   }, []);
// };