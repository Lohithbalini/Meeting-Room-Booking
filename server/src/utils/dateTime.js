const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

let nowProvider = () => new Date();

function setNowProvider(fn) {
  nowProvider = fn;
}

function resetNowProvider() {
  nowProvider = () => new Date();
}

function now() {
  return nowProvider();
}

function isValidTime(value) {
  return typeof value === "string" && TIME_RE.test(value);
}

function isValidDateString(value) {
  if (typeof value !== "string" || !DATE_RE.test(value)) {
    return false;
  }
  const [year, month, day] = value.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  return (
    utc.getUTCFullYear() === year &&
    utc.getUTCMonth() === month - 1 &&
    utc.getUTCDate() === day
  );
}

function timeToMinutes(value) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function istDateTimeToUtc(dateStr, timeStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hours, minutes) - IST_OFFSET_MS);
}

function todayIst(reference = now()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(reference);
}

function isBookingInPast(dateStr, startTime, reference = now()) {
  return istDateTimeToUtc(dateStr, startTime).getTime() < reference.getTime();
}

function compareTimes(startTime, endTime) {
  return timeToMinutes(endTime) - timeToMinutes(startTime);
}

function timesOverlap(newStart, newEnd, existingStart, existingEnd) {
  return newStart < existingEnd && newEnd > existingStart;
}

module.exports = {
  isValidTime,
  isValidDateString,
  timeToMinutes,
  istDateTimeToUtc,
  todayIst,
  isBookingInPast,
  compareTimes,
  timesOverlap,
  now,
  setNowProvider,
  resetNowProvider,
};
