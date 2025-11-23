function cancelSeatMultiBeacon(showtimeId: number, seatIds: number[]) {
  if (!seatIds?.length) return;

  const url = `https://gocinema.io.vn/api/public/seat-reservations/cancel-multiple`;

  const payload = JSON.stringify({ showtimeId, seatIds });
  const blob = new Blob([payload], { type: 'application/json' });

  navigator.sendBeacon(url, blob);
}

export { cancelSeatMultiBeacon };
