import Link from 'next/link';

interface HeavenCTAButtonProps {
  href: string;
  className?: string;
}

export function HeavenCTAButton({ href, className = '' }: HeavenCTAButtonProps) {
  return (
    <Link 
      href={href}
      className={`heaven-cta-btn ${className}`}
    >
      <span className="cta-icon flex items-center justify-center">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <defs>
            <linearGradient id="cream-heart" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#FFF2D6" />
              <stop offset="100%" stopColor="#FFDEB5" />
            </linearGradient>
          </defs>
          <path fill="url(#cream-heart)" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </span>
      Añadir mi angelito al cielo
    </Link>
  );
}
