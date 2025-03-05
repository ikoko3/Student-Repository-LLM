// dateUtils.js

/**
 * Get the remaining days in the current month
 * @returns {number} - The remaining days in the current month
 */
function getRemainingDaysInMonth() {
  const today = new Date();
  const currentMonth = today.getMonth(); // Get current month (0-11)
  const currentYear = today.getFullYear(); // Get current year

  // Find the last day of the current month
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0); // `0` will get the last day of the previous month

  // Calculate the difference in days
  const remainingDays = Math.ceil(
    (lastDayOfMonth - today) / (1000 * 60 * 60 * 24)
  );

  return remainingDays;
}

/**
 * Check if today is the first day of the current month
 * @returns {boolean} - True if today is the first day of the month, otherwise false
 */
function isFirstDayOfMonth() {
  const today = new Date();
  return today.getDate() === 1; // Checks if the day of the month is 1
}

function getFormattedDate(offsetDays = 0) {
  const now = new Date();

  // Adjust the date by the given offset (can be positive or negative)
  now.setDate(now.getDate() + offsetDays);

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

module.exports = {
  getRemainingDaysInMonth,
  isFirstDayOfMonth,
  getFormattedDate,
};
