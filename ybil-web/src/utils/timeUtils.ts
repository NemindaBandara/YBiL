export interface DepartureStatus {
  label: string;
  diffMinutes: number;
  isUrgent: boolean; // T-15m or less
  hasDeparted: boolean;
}

export function getDepartureStatus(scheduledLeavingTime: string): DepartureStatus {
  const [hours, minutes] = scheduledLeavingTime.split(':').map(Number);
  const now = new Date();

  const departureDate = new Date();
  departureDate.setHours(hours, minutes, 0, 0);

  const diffMs = departureDate.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < -10) {
    return {
      label: 'Departed',
      diffMinutes,
      isUrgent: false,
      hasDeparted: true,
    };
  }

  if (diffMinutes <= 0 && diffMinutes >= -10) {
    return {
      label: 'Leaving now',
      diffMinutes,
      isUrgent: true,
      hasDeparted: false,
    };
  }

  if (diffMinutes <= 15) {
    return {
      label: `in ${diffMinutes}m`,
      diffMinutes,
      isUrgent: true,
      hasDeparted: false,
    };
  }

  if (diffMinutes < 60) {
    return {
      label: `in ${diffMinutes}m`,
      diffMinutes,
      isUrgent: false,
      hasDeparted: false,
    };
  }

  const hoursLeft = Math.floor(diffMinutes / 60);
  const remainingMins = diffMinutes % 60;
  return {
    label: remainingMins > 0 ? `in ${hoursLeft}h ${remainingMins}m` : `in ${hoursLeft}h`,
    diffMinutes,
    isUrgent: false,
    hasDeparted: false,
  };
}