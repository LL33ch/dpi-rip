import Image from 'next/image';

function rootDomain(d: string): string {
  const parts = d.split('.');
  return parts.length > 2 ? parts.slice(-2).join('.') : d;
}

export function SiteLogo({ d }: { d: string }) {
  return (
    <Image
      src={`https://icons.duckduckgo.com/ip3/${rootDomain(d)}.ico`}
      width={20}
      height={20}
      alt={d}
      unoptimized
      style={{ borderRadius: 3 }}
    />
  );
}
