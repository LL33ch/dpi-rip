import * as simpleIcons from 'simple-icons';
import type { SimpleIcon } from 'simple-icons';

interface BrandIconProps {
  brand: string;
  size?: number;
  color?: string;
  className?: string;
}

export function BrandIcon({ brand, size = 24, color, className }: BrandIconProps) {
  const icon = (simpleIcons as Record<string, SimpleIcon>)[brand];

  if (!icon || typeof icon !== 'object' || !icon.path) {
    console.warn(`Icon "${brand}" not found in simple-icons`);
    return null;
  }

  return (
    <svg
      role='img'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      fill={color || `#${icon.hex}`}
      className={className}
    >
      <title>{icon.title}</title>
      <path d={icon.path} />
    </svg>
  );
}
