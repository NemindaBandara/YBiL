export interface DepartureStatus {
  label: string;
  diffMinutes: number;
  isUrgent: boolean;
  hasDeparted: boolean;
  shouldHide: boolean; // Hide completely after 15m past departure
}

export function getDepartureStatus(scheduledLeavingTime: string, now: Date = new Date()): DepartureStatus {
  if (!scheduledLeavingTime || !scheduledLeavingTime.includes(':')) {
    return { label: '--:--', diffMinutes: 0, isUrgent: false, hasDeparted: false, shouldHide: false };
  }

  const [hours, minutes] = scheduledLeavingTime.split(':').map(Number);
  const departureDate = new Date(now);
  departureDate.setHours(hours, minutes, 0, 0);

  const diffMs = departureDate.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  // Departed more than 15 minutes ago -> hide from active feed
  if (diffMinutes < -15) {
    return { label: 'Departed', diffMinutes, isUrgent: false, hasDeparted: true, shouldHide: true };
  }

  // Departed within the last 15 minutes
  if (diffMinutes < 0) {
    return { label: `Departed ${Math.abs(diffMinutes)}m ago`, diffMinutes, isUrgent: false, hasDeparted: true, shouldHide: false };
  }

  // Leaving right now (0 to 1 min window)
  if (diffMinutes === 0) {
    return { label: 'Leaving now', diffMinutes, isUrgent: true, hasDeparted: false, shouldHide: false };
  }

  // T-15m urgent countdown
  if (diffMinutes <= 15) {
    return { label: `in ${diffMinutes}m`, diffMinutes, isUrgent: true, hasDeparted: false, shouldHide: false };
  }

  // Within the hour
  if (diffMinutes < 60) {
    return { label: `in ${diffMinutes}m`, diffMinutes, isUrgent: false, hasDeparted: false, shouldHide: false };
  }

  const hoursLeft = Math.floor(diffMinutes / 60);
  const remainingMins = diffMinutes % 60;
  return {
    label: remainingMins > 0 ? `in ${hoursLeft}h ${remainingMins}m` : `in ${hoursLeft}h`,
    diffMinutes,
    isUrgent: false,
    hasDeparted: false,
    shouldHide: false,
  };
}