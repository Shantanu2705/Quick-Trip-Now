export function getApplicablePrice(
  seasonalPrices?: { startDate: string; endDate: string; price: number }[],
  selectedDate?: Date
): number {
  if (!seasonalPrices || seasonalPrices.length === 0) {
    return 0;
  }

  // 1. Determine the target date for pricing (in IST string format: YYYY-MM-DD)
  let targetDateStr = "";
  if (selectedDate) {
    // If a specific date is selected via the calendar, use it directly (calendar returns local dates)
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDate.getDate()).padStart(2, '0');
    targetDateStr = `${yyyy}-${mm}-${dd}`;
  } else {
    // Determine "today" strictly in Indian Standard Time
    const formatter = new Intl.DateTimeFormat("en-CA", { // en-CA gives YYYY-MM-DD format natively
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
    targetDateStr = formatter.format(new Date());
  }

  // 2. Check if the target date falls within any active period using pure string comparison (YYYY-MM-DD)
  for (const season of seasonalPrices) {
    if (targetDateStr >= season.startDate && targetDateStr <= season.endDate) {
      return season.price;
    }
  }

  // 3. If no active period today, find the next upcoming period
  const upcomingSeasons = seasonalPrices
    .filter(s => s.startDate > targetDateStr)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  if (upcomingSeasons.length > 0) {
    return upcomingSeasons[0].price;
  }

  // 4. If no active and no upcoming, fallback to the lowest price available
  return Math.min(...seasonalPrices.map(s => s.price));
}
