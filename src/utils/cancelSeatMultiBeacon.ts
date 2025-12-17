export function cancelSeatMultiBeacon(showtimeId: number, seatIds: number[]) {
  if (!seatIds?.length) return;

  const url = "http://localhost:8080/api/public/seat-reservations/cancel-multiple"; 

  const payload = JSON.stringify({ showtimeId, seatIds });

  const blob = new Blob([payload], { type: "text/plain;charset=UTF-8" });

  navigator.sendBeacon(url, blob);
}
