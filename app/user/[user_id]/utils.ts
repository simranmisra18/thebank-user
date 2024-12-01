export function getTimeDifference(date1: string) {
  // Convert both dates to timestamps
  const diffInMs = Math.abs(+new Date(date1) - +new Date()); // Difference in milliseconds

  // Convert milliseconds to seconds, minutes, hours, and days
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  // Determine the appropriate unit for the difference
  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds === 1 ? "" : "s"}`;
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"}`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"}`;
  } else {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"}`;
  }
}