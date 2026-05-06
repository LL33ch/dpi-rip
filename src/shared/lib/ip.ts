export function ipToInt(ip: string): number {
  return ip.split('.').reduce((n, oct) => (n << 8) | +oct, 0) >>> 0;
}

export function inCidr(ip: string, cidr: string): boolean {
  const [net, bits] = cidr.split('/');
  const prefix = +bits;
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  return (ipToInt(ip) & mask) === (ipToInt(net) & mask);
}
