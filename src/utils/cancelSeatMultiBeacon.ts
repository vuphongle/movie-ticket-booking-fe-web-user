function cancelSeatMultiBeacon(showtimeId: number, seatIds: number[]) {
  if (!seatIds?.length) return;

  const url = `${import.meta.env.VITE_DOMAIN}${import.meta.env.VITE_API_BASE_URL}/seat-reservations/cancel-multiple`;

  const payload = JSON.stringify({ showtimeId, seatIds });
  const blob = new Blob([payload], { type: "application/json" });

  navigator.sendBeacon(url, blob);
}

export { cancelSeatMultiBeacon };
