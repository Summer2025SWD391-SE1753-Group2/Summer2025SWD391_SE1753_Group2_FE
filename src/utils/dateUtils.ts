/**
 * Utility functions for date formatting and time calculations
 */

/**
 * Formats a date string into a Vietnamese relative time format
 * @param dateString - ISO date string from backend
 * @param referenceTime - Reference time for calculation (default: current time)
 * @returns Formatted relative time string in Vietnamese
 */
export const formatRelativeTime = (
  dateString: string,
  referenceTime: Date = new Date()
): string => {
  try {
    const date = new Date(dateString);

    // Validate date
    if (isNaN(date.getTime())) {
      return "Thời gian không hợp lệ";
    }

    const diffInSeconds = Math.floor(
      (referenceTime.getTime() - date.getTime()) / 1000
    );

    // Nếu thời gian trong tương lai (có thể do lệch clock)
    if (diffInSeconds < 0) {
      return "vừa xong";
    }

    // Nếu cách đây ít hơn 1 phút
    if (diffInSeconds < 60) {
      return "vừa xong";
    }

    // Nếu cách đây ít hơn 1 giờ
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} phút trước`;
    }

    // Nếu cách đây ít hơn 24 giờ
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} giờ trước`;
    }

    // Nếu cách đây ít hơn 7 ngày
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ngày trước`;
    }

    // Nếu cách đây ít hơn 30 ngày
    if (diffInSeconds < 2592000) {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks} tuần trước`;
    }

    // Nếu cách đây hơn 30 ngày, hiển thị ngày đầy đủ
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Thời gian không hợp lệ";
  }
};

/**
 * Formats a date string into full Vietnamese date format
 * @param dateString - ISO date string from backend
 * @returns Formatted full date string in Vietnamese
 */
export const formatFullDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "Thời gian không hợp lệ";
    }

    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting full date:", error);
    return "Thời gian không hợp lệ";
  }
};

/**
 * Checks if a date is older than specified minutes
 * @param dateString - ISO date string from backend
 * @param minutes - Number of minutes to check against
 * @returns True if date is older than specified minutes
 */
export const isOlderThan = (dateString: string, minutes: number): boolean => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    return diffInMinutes > minutes;
  } catch {
    return false;
  }
};

/**
 * Gets current timestamp in ISO format
 * @returns Current timestamp as ISO string
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};
