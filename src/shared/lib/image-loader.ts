const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export default function imageLoader({ src }: { src: string }): string {
  if (src.startsWith('http')) return src;
  return `${BASE}${src}`;
}
