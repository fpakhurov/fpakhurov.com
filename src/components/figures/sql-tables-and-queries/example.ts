export const lines = [
  { orderId: 101, lineNo: 1, product: 'tea', quantity: 2, unitPriceCents: 350 },
  { orderId: 101, lineNo: 2, product: 'coffee', quantity: 1, unitPriceCents: 600 },
  { orderId: 102, lineNo: 1, product: 'tea', quantity: 1, unitPriceCents: 350 },
  { orderId: 103, lineNo: 1, product: 'coffee', quantity: 2, unitPriceCents: 600 },
  { orderId: 103, lineNo: 2, product: 'tea', quantity: 1, unitPriceCents: 350 },
  { orderId: 104, lineNo: 1, product: 'cocoa', quantity: 3, unitPriceCents: 400 },
];

export const keyOf = (line: typeof lines[number]) => `${line.orderId}/${line.lineNo}`;
export const selected = lines.filter((line) => line.quantity >= 2);

if (lines.length !== 6 || new Set(lines.map(keyOf)).size !== 6) throw new Error('Six distinct order-line identities');
if (selected.map(keyOf).join(',') !== '101/1,103/1,104/1') throw new Error('Quantity filter selects three lines');
if (selected.map((line) => line.quantity * line.unitPriceCents).join(',') !== '700,1200,1200') throw new Error('Line totals');
if (lines.filter((line) => line.product === 'tea').length !== 3) throw new Error('Three tea lines');
