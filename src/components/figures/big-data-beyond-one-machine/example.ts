export const rows = 5_000_000_000;
export const bytesPerRow = 120;
export const bytesPerGB = 1_000_000_000;
export const inputGB = (rows * bytesPerRow) / bytesPerGB;
export const compactGB = inputGB / 4;
export const diskGBps = 1;
export const fasterDiskGBps = 2;
export const rowsPerSecond = 25_000_000;
export const deadline = 180;

export const cpuSeconds = rows / rowsPerSecond;
export const readSeconds = (sizeGB: number, rateGBps = diskGBps) => sizeGB / rateGBps;
export const workers = 4;
export const balancedGB = Array<number>(workers).fill(inputGB / workers);
const largePartitionGB = (inputGB * 2) / 5;
export const skewedGB = [
  largePartitionGB,
  ...Array<number>(workers - 1).fill((inputGB - largePartitionGB) / (workers - 1)),
];

export const linkGbitPerSecond = 10;
export const linkGBps = linkGbitPerSecond / 8;
export const transferSeconds = inputGB / linkGBps;
export const stores = 500;
export const subtotalBytes = 16;
export const partialsKB = (workers * stores * subtotalBytes) / 1_000;
