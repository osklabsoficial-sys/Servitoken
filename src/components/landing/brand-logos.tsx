"use client";

export function BscLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 128 128" className={className} aria-label="BNB Smart Chain">
      <path d="M64 0C28.7 0 0 28.7 0 64s28.7 64 64 64 64-28.7 64-64S99.3 0 64 0z" fill="#F3BA2F" />
      <path
        d="M73.8 57.3l13.5-13.5 9 9-13.5 13.5-9-9zm-9-9l-13.5 13.5-9-9L55.8 39.3l9 9zm0 18l-9 9-9-9 9-9 9 9zm27 0l-9 9 9 9 9-9-9-9zm-45-9l-9-9-9 9 9 9 9-9zm63 0l-9 9-9-9 9-9 9 9zm-36 18l-9 9-9-9 9-9 9 9z"
        fill="#FFF"
      />
    </svg>
  );
}

export function PancakeSwapLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-label="PancakeSwap">
      <circle cx="100" cy="100" r="100" fill="#D1884F" />
      <ellipse cx="100" cy="135" rx="50" ry="20" fill="#A0522D" />
      <ellipse cx="100" cy="128" rx="45" ry="8" fill="#D2B48C" />
      <circle cx="85" cy="115" r="5" fill="#3E2723" />
      <circle cx="115" cy="118" r="4" fill="#3E2723" />
      <circle cx="100" cy="110" r="4.5" fill="#3E2723" />
      <path
        d="M80 100 Q90 80 100 95 Q110 80 120 100"
        stroke="#5D4037"
        strokeWidth="3"
        fill="none"
      />
      <ellipse cx="75" cy="98" rx="12" ry="6" fill="#F5DEB3" transform="rotate(-20 75 98)" />
      <ellipse cx="125" cy="96" rx="12" ry="6" fill="#F5DEB3" transform="rotate(20 125 96)" />
    </svg>
  );
}

export function GooglePayLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-label="Google Pay">
      {/* G logo */}
      <path d="M18.4 15.3c0-.7-.1-1.3-.2-1.9h-9v3.5h5.2c-.2 1.1-.9 2.1-1.9 2.7v2.3h3.1c1.8-1.7 2.8-4.1 2.8-6.6z" fill="#4285F4" />
      <path d="M9.3 23.5c2.5 0 4.6-.8 6.1-2.2l-3.1-2.3c-.8.6-2 0.9-3 0.9-2.3 0-4.3-1.6-5-3.7H1.1v2.4c1.5 3 4.6 4.9 8.2 4.9z" fill="#34A853" />
      <path d="M4.2 16.2c-.4-1.1-.4-2.3 0-3.4v-2.4H1.1c-1.2 2.4-1.2 5.2 0 7.6l3.1-1.8z" fill="#FBBC05" />
      <path d="M9.3 10.4c1.3 0 2.5.5 3.4 1.3l2.7-2.7C13.9 7.6 11.7 6.5 9.3 6.5c-3.6 0-6.7 1.9-8.2 4.9l3.1 2.4c.7-2.1 2.7-3.4 5-3.4z" fill="#EA4335" />
      {/* Pay text */}
      <text x="28" y="21.5" fontFamily="Google Sans, Roboto, sans-serif" fontSize="10" fontWeight="500" fill="#5F6368">Pay</text>
    </svg>
  );
}

export function ApplePayLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-label="Apple Pay">
      {/* Apple logo */}
      <path
        d="M10.5 22.3c-.6.8-1.5 1.4-2.4 1.3-.1-.9.3-1.8.9-2.4.6-.7 1.6-1.5 2.4-1.4.1 1-.3 1.8-.9 2.5zm1.8 1.4c-.4-.1-2.2-.7-2.3-2.6 0 0 2.3-.2 2.5 2.5l-.2.1zm6.1-6c-.9 0-1.6.5-2.1.5s-1.1-.5-1.8-.5c-.9 0-1.8.5-2.3 1.4-1 1.7-.3 4.3.7 5.7.5.7 1 1.4 1.8 1.4s.9-.4 1.8-.4 1.1.4 1.8.4.1 0 1.2-.7c.4-.3.7-.6.9-1-2.4-.9-2-4.2.3-5 .7-.5 1.6-.6 2.3-.3-.2-1.5-1.3-2.7-2.6-2.7z"
        fill="#000"
      />
      <text x="22" y="21.5" fontFamily="SF Pro, -apple-system, sans-serif" fontSize="10" fontWeight="400" fill="#000">Pay</text>
    </svg>
  );
}

export function WalletConnectLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-label="WalletConnect">
      <path
        d="M10.25 16.84c4.68-4.56 12.26-4.56 16.94 0l.98.96.98-.96c4.68-4.56 12.26-4.56 16.94 0 4.68 4.56 4.68 11.96 0 16.52l-.98.96-16.94 16.52-16.94-16.52-.98-.96c-4.68-4.56-4.68-11.96 0-16.52z"
        transform="scale(0.5) translate(20, 15)"
        fill="#3B99FC"
      />
    </svg>
  );
}

export function UsdtLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 128 128" className={className} aria-label="USDT">
      <circle cx="64" cy="64" r="64" fill="#26A17B" />
      <path
        d="M72.9 70.2V55.6h15.4c1.4 0 2.6-.1 2.6-1.6s-1.1-1.6-2.6-1.6H72.9V44.5c0-4.3-.9-5.7-5.7-5.7h-4.1v25.9c-9.5.7-17.1 3.4-17.1 7.3 0 3.8 7.6 6.5 17.1 7.3v16.7h4.1c4.8 0 5.7-1.4 5.7-5.7v-11c11.8-.7 20.8-4 20.8-8.2 0-4.3-9-7.6-20.8-8.6z"
        fill="#FFF"
        opacity="0.8"
      />
      <text x="64" y="80" textAnchor="middle" fontFamily="Arial" fontSize="28" fontWeight="bold" fill="#FFF">$</text>
    </svg>
  );
}
