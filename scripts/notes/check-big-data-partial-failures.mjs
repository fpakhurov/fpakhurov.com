import assert from 'node:assert/strict';
import {
  attemptMs,
  correctCents,
  duplicatedCents,
  earlyResultMs,
  lateReplyMs,
  lateResultMs,
  missingCents,
  readyCents,
  receivedCents,
  reportDeadlineMs,
  retryReplyMs,
  retryStartMs,
} from '../../src/components/figures/big-data-partial-failures/example.ts';

const sum = (values) => Array.from(values).reduce((total, value) => total + value, 0);

const replyTimes = [Infinity, Infinity, lateReplyMs];
assert.ok(replyTimes.every((time) => time > attemptMs));
assert.ok(earlyResultMs < attemptMs);
assert.ok(attemptMs < lateResultMs && lateResultMs < lateReplyMs);

const retryWaitMs = Math.min(attemptMs, reportDeadlineMs - retryStartMs);
assert.equal(retryStartMs, 125);
assert.equal(retryWaitMs, 95);
assert.equal(retryReplyMs - retryStartMs, 35);
assert.ok(retryReplyMs - retryStartMs <= retryWaitMs && retryReplyMs < lateReplyMs);

const replyB = { part: 4, cents: missingCents };
const replyA = { part: 4, cents: missingCents };
const accepted = new Map(receivedCents.map((cents, index) => [index + 1, cents]));
assert.equal(sum(accepted.values()), readyCents);
assert.equal(readyCents, 2500);

for (const { part, cents } of [replyB, replyA]) {
  if (!accepted.has(part)) accepted.set(part, cents);
  assert.equal(accepted.size, 4);
  assert.equal(sum(accepted.values()), correctCents);
}
assert.equal(correctCents, 3200);
assert.equal(sum([...receivedCents, replyB.cents, replyA.cents]), duplicatedCents);
assert.equal(duplicatedCents, 3900);
assert.equal(3 ** 2, 9);

console.log('Big Data partial failures: timeout histories, retry budget and subtotal handling passed.');
