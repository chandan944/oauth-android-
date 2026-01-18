import { format, parseISO, differenceInDays } from "date-fns";

/* ---------------------------------- */
/* 🔥 Relative time (just now, 5m ago) */
/* 👉 For timestamps / ISO with time  */
/* ---------------------------------- */
export const formatDate = (timestamp) => {
  if (!timestamp) return "";

  let date;

  // 🧠 If only date is sent (2026-01-18), treat as UTC midnight
  if (typeof timestamp === "string" && /^\d{4}-\d{2}-\d{2}$/.test(timestamp)) {
    date = new Date(timestamp + "T00:00:00Z");
  } else {
    date =
      typeof timestamp === "string"
        ? new Date(timestamp.endsWith("Z") ? timestamp : timestamp + "Z")
        : new Date(timestamp);
  }

  const now = new Date();
  let diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) diffMs = 0;

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now ⏱️";
  if (diffMins < 60) return `${diffMins}m ago ⌛`;
  if (diffHours < 24) return `${diffHours}h ago ⏰`;
  if (diffDays < 7) return `${diffDays}d ago 📆`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

/* ---------------------------------- */
/* 📅 Diary / Entry date display      */
/* 👉 For "2026-01-18" only            */
/* ---------------------------------- */
export const formatEntryDate = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr + "T00:00:00Z");

  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

/* ---------------------------------- */
/* 📅 Full date display (general)     */
/* ---------------------------------- */
export const formatDateForDisplay = (date) => {
  if (!date) return "";

  const parsed =
    typeof date === "string"
      ? parseISO(date.endsWith("Z") ? date : date + "Z")
      : date;

  return parsed.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
};

/* ---------------------------------- */
/* ⏰ Time formatter                   */
/* ---------------------------------- */
export const formatTime = (dateString) => {
  try {
    const date =
      typeof dateString === "string"
        ? parseISO(dateString.endsWith("Z") ? dateString : dateString + "Z")
        : dateString;

    return format(date, "hh:mm a");
  } catch {
    return "Invalid time ❌";
  }
};

/* ---------------------------------- */
/* 📆 Days left calculator            */
/* ---------------------------------- */
export const daysLeft = (targetDate) => {
  try {
    const target =
      typeof targetDate === "string"
        ? parseISO(
            /^\d{4}-\d{2}-\d{2}$/.test(targetDate)
              ? targetDate + "T00:00:00Z"
              : targetDate.endsWith("Z")
              ? targetDate
              : targetDate + "Z"
          )
        : targetDate;

    const today = new Date();
    return differenceInDays(target, today);
  } catch {
    return 0;
  }
};

/* ---------------------------------- */
/* 📊 Progress                        */
/* ---------------------------------- */
export const calculateProgress = (current, total) => {
  if (!total || total === 0) return 0;
  return Math.min(Math.round((current / total) * 100), 100);
};

/* ---------------------------------- */
/* ✂️ Text truncator                  */
/* ---------------------------------- */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};
