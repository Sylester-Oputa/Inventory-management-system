export function buildSequenceNumber(prefix: 'STK' | 'RCPT', dateKey: string, seq: number) {
  return `${prefix}-${dateKey}-${String(seq).padStart(4, '0')}`;
}
