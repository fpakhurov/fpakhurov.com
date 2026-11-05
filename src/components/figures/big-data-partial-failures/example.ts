export const attemptMs = 100;
export const earlyResultMs = 60;
export const lateResultMs = 140;
export const lateReplyMs = 170;
export const reportDeadlineMs = 220;
export const retryDelayMs = 25;
export const retryStartMs = attemptMs + retryDelayMs;
export const retryReplyMs = 160;

export const receivedCents = [1100, 800, 600];
export const missingCents = 700;
export const readyCents = receivedCents.reduce((sum, cents) => sum + cents, 0);
export const correctCents = readyCents + missingCents;
export const duplicatedCents = correctCents + missingCents;
