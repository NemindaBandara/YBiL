export interface DepartureStatus {
  label: string;
  diffMinutes: number;
  isUrgent: boolean;
  isImminent: boolean; // within 5 minutes -> immediate boarding
  hasDeparted: boolean;
  shouldHide: boolean; // hide after 15 minutes past departure
  formattedTime: string;
}

/**
 * Formats a 24-hour time string (e.g., "16:30" or "09:05") into 12-hour format ("04:30 PM")
 */
export function format12HourTime(timeStr: string): string {
  if (!timeStr || !timeStr.includes(':')) {
    return timeStr || '--:--';
  }
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) {
    return timeStr;
  }
  const period = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * Calculates live departure status and countdown relative to current time:
 * - Departure > 60 min away: formatted departure time (e.g. "04:30 PM")
 * - Departure within 60 min: dynamic countdown (e.g. "in 18m" or "in 4m")
 * - Departure <= 5 min: isImminent=true (highlighted badge in amber/pulse)
 * - Departure < 0 min: hasDeparted=true ("Departed" with dimmed styling)
 */
export function getDepartureStatus(
  scheduledLeavingTime: string,
  now: Date = new Date()
): DepartureStatus {
  if (!scheduledLeavingTime || !scheduledLeavingTime.includes(':')) {
    return {
      label: '--:--',
      diffMinutes: 0,
      isUrgent: false,
      isImminent: false,
      hasDeparted: false,
      shouldHide: false,
      formattedTime: '--:--',
    };
  }

  const [hours, minutes] = scheduledLeavingTime.split(':').map(Number);
  const formattedTime = format12HourTime(scheduledLeavingTime);

  const departureDate = new Date(now);
  departureDate.setHours(hours, minutes, 0, 0);

  const diffMs = departureDate.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  // Departed more than 15 minutes ago -> hide from active feed
  if (diffMinutes < -15) {
    return {
      label: 'Departed',
      diffMinutes,
      isUrgent: false,
      isImminent: false,
      hasDeparted: true,
      shouldHide: true,
      formattedTime,
    };
  }

  // Departed within the last 15 minutes
  if (diffMinutes < 0) {
    return {
      label: 'Departed',
      diffMinutes,
      isUrgent: false,
      isImminent: false,
      hasDeparted: true,
      shouldHide: false,
      formattedTime,
    };
  }

  // Leaving right now / within 5 minutes (immediate boarding)
  if (diffMinutes <= 5) {
    return {
      label: diffMinutes === 0 ? 'Leaving now' : `in ${diffMinutes}m`,
      diffMinutes,
      isUrgent: true,
      isImminent: true,
      hasDeparted: false,
      shouldHide: false,
      formattedTime,
    };
  }

  // Within the hour (6 to 60 minutes countdown)
  if (diffMinutes <= 60) {
    return {
      label: `in ${diffMinutes}m`,
      diffMinutes,
      isUrgent: false,
      isImminent: false,
      hasDeparted: false,
      shouldHide: false,
      formattedTime,
    };
  }

  // > 60 minutes away -> display formatted departure time (e.g. 04:30 PM)
  return {
    label: formattedTime,
    diffMinutes,
    isUrgent: false,
    isImminent: false,
    hasDeparted: false,
    shouldHide: false,
    formattedTime,
  };
}