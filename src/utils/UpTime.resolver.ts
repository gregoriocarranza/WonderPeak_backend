export const formatUptime = (uptimeInSeconds: number): string => {
  const days = Math.floor(uptimeInSeconds / (3600 * 24));
  const hours = Math.floor((uptimeInSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeInSeconds % 60);

  const pad = (num: number) => String(num).padStart(2, '0');

  return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};
