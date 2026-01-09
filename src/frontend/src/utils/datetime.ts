export function extractDateAndTime(value?: string) {
  if (!value) {
    return { date: "", time: "" };
  }

  const match = value.match(/(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2})/);
  if (match) {
    return { date: match[1], time: match[2] };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { date: "", time: "" };
  }

  const parts = trimmed.split(/[T ]+/);
  return {
    date: parts[0] || "",
    time: parts[1] ? parts[1].slice(0, 5) : "",
  };
}

export function formatDateTimeDisplay(value?: string) {
  const { date, time } = extractDateAndTime(value);
  if (date && time) return `${date} ${time}`;
  if (date) return date;
  return value || "";
}
