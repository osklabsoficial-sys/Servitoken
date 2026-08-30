"use client";

/* ────────────────────────────────────────────────────────────
   Wallet SVG Icon Components
   Each: viewBox="0 0 40 40", brand-accurate, small-size friendly
   ──────────────────────────────────────────────────────────── */

interface IconProps {
  className?: string;
}

/* ─── 1. MetaMask — Fox face silhouette, orange #F6851B ─── */
export function MetaMaskIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="20" cy="20" r="20" fill="#F6851B" />
      {/* Left ear outer */}
      <path d="M12 10L15 16L10.5 14.5L12 10Z" fill="#E2761B" />
      {/* Right ear outer */}
      <path d="M28 10L25 16L29.5 14.5L28 10Z" fill="#E2761B" />
      {/* Left ear inner */}
      <path d="M13.5 10.5L15.2 14.5L12.5 13.5L13.5 10.5Z" fill="#8B4B13" />
      {/* Right ear inner */}
      <path d="M26.5 10.5L24.8 14.5L27.5 13.5L26.5 10.5Z" fill="#8B4B13" />
      {/* Face left side - lighter cheek */}
      <path
        d="M10 19L13.5 17.5L12 15L9 19.5L10 19Z"
        fill="#E8B88A"
      />
      {/* Face right side - lighter cheek */}
      <path
        d="M30 19L26.5 17.5L28 15L31 19.5L30 19Z"
        fill="#E8B88A"
      />
      {/* Forehead left */}
      <path d="M12 15L15 16L13.5 19L12 15Z" fill="#E4761B" />
      {/* Forehead right */}
      <path d="M28 15L25 16L26.5 19L28 15Z" fill="#E4761B" />
      {/* Eye area left (dark) */}
      <path d="M13.5 19L15 22.5L11.5 21.5L13.5 19Z" fill="#233447" />
      {/* Eye area right (dark) */}
      <path d="M26.5 19L25 22.5L28.5 21.5L26.5 19Z" fill="#233447" />
      {/* Nose bridge left */}
      <path d="M15 22.5L14 27L11.5 21.5L15 22.5Z" fill="#CD6116" />
      {/* Nose bridge right */}
      <path d="M25 22.5L26 27L28.5 21.5L25 22.5Z" fill="#CD6116" />
      {/* Center nose bridge */}
      <path d="M15 22.5L20 26L25 22.5L20 22L15 22.5Z" fill="#E4751F" />
      {/* Bottom chin / dark nose area */}
      <path d="M14 27L20 29L26 27L20 26L14 27Z" fill="#233447" />
      {/* Bottom muzzle left */}
      <path d="M14 27L16.5 29L20 29L14 27Z" fill="#D7C1B3" />
      {/* Bottom muzzle right */}
      <path d="M26 27L23.5 29L20 29L26 27Z" fill="#D7C1B3" />
    </svg>
  );
}

/* ─── 2. Trust Wallet — Blue shield with keyhole ─── */
export function TrustWalletIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="trustGrad" x1="4" y1="4" x2="36" y2="36">
          <stop offset="0%" stopColor="#3375BB" />
          <stop offset="100%" stopColor="#1A5FA5" />
        </linearGradient>
      </defs>
      <path
        d="M20 4L34 11V23C34 30.5 27.5 35.5 20 38C12.5 35.5 6 30.5 6 23V11L20 4Z"
        fill="url(#trustGrad)"
      />
      <circle cx="20" cy="17" r="5" fill="white" />
      <path d="M17.2 20.5L16.5 29H23.5L22.8 20.5" fill="white" />
    </svg>
  );
}

/* ─── 3. OKX Wallet — Black rounded square, white overlapping rects ─── */
export function OKXWalletIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="2" width="36" height="36" rx="8" fill="#000000" />
      <rect
        x="8"
        y="11"
        width="12"
        height="12"
        rx="3"
        stroke="white"
        strokeWidth="2"
        fill="none"
      />
      <rect
        x="20"
        y="17"
        width="12"
        height="12"
        rx="3"
        stroke="white"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

/* ─── 4. Bitget Wallet — Teal→Blue gradient, angular arrow mark ─── */
export function BitgetWalletIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="bitgetGrad" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#00D4AA" />
          <stop offset="100%" stopColor="#0091FF" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="8" fill="url(#bitgetGrad)" />
      {/* Bitget stylized chevron/arrow mark */}
      <path
        d="M11 12L20 28L29 12"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M15 18L20 26L25 18"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/* ─── 5. Binance Wallet — Yellow diamond with geometric B ─── */
export function BinanceWalletIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="2" width="36" height="36" rx="8" fill="#F0B90B" />
      {/* Geometric diamond shape */}
      <path d="M20 8L28 20L20 32L12 20L20 8Z" fill="white" />
      {/* B cutout - creates the Binance B illusion */}
      <path
        d="M17 14H22C23.5 14 24.5 15 24.5 16.5C24.5 18 23.5 19 22 19H17V14ZM17 19H22.5C24 19 25 20 25 21.5C25 23 24 24 22.5 24H17V19Z"
        fill="#F0B90B"
      />
    </svg>
  );
}

/* ─── 6. Coinbase Wallet — Blue circle with rotated white square ─── */
export function CoinbaseWalletIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="20" cy="20" r="20" fill="#0052FF" />
      <rect
        x="14.5"
        y="14.5"
        width="11"
        height="11"
        rx="1.5"
        transform="rotate(45 20 20)"
        fill="white"
      />
    </svg>
  );
}

/* ─── 7. Phantom — Purple circle with ghost silhouette ─── */
export function PhantomIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="20" cy="20" r="20" fill="#AB6BFF" />
      {/* Ghost body */}
      <path
        d="M14 14C14 11.8 15.8 10 18 10H22C24.2 10 26 11.8 26 14V27L23 24.5L20 27.5L17 24.5L14 27V14Z"
        fill="white"
      />
      {/* Left eye */}
      <circle cx="17.5" cy="16" r="1.8" fill="#AB6BFF" />
      {/* Right eye */}
      <circle cx="22.5" cy="16" r="1.8" fill="#AB6BFF" />
    </svg>
  );
}

/* ─── 8. Rabby — Purple gradient, rabbit silhouette ─── */
export function RabbyIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="rabbyGrad" x1="2" y1="2" x2="38" y2="38">
          <stop offset="0%" stopColor="#7C5CFC" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="8" fill="url(#rabbyGrad)" />
      {/* Left ear */}
      <path d="M14.5 5V16L17 14V7.5L14.5 5Z" fill="white" />
      {/* Right ear */}
      <path d="M25.5 5V16L23 14V7.5L25.5 5Z" fill="white" />
      {/* Head */}
      <ellipse cx="20" cy="23" rx="7.5" ry="7" fill="white" />
      {/* Left eye */}
      <circle cx="17" cy="22" r="1.5" fill="#7C5CFC" />
      {/* Right eye */}
      <circle cx="23" cy="22" r="1.5" fill="#7C5CFC" />
      {/* Nose */}
      <ellipse cx="20" cy="25" rx="1.2" ry="0.8" fill="#7C5CFC" />
      {/* Mouth lines */}
      <path
        d="M18.8 25.8L17 27.5M21.2 25.8L23 27.5"
        stroke="#7C5CFC"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── 9. Rainbow — Rainbow gradient circle, white horizontal line ─── */
export function RainbowIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="rainbowGrad" x1="0" y1="20" x2="40" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF0000" />
          <stop offset="16%" stopColor="#FF8800" />
          <stop offset="33%" stopColor="#FFDD00" />
          <stop offset="50%" stopColor="#00CC44" />
          <stop offset="66%" stopColor="#0088FF" />
          <stop offset="83%" stopColor="#4400FF" />
          <stop offset="100%" stopColor="#8800CC" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#rainbowGrad)" />
      <line
        x1="0"
        y1="20"
        x2="40"
        y2="20"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── 10. OneKey — Teal rounded square, white keyhole ─── */
export function OneKeyIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="2" width="36" height="36" rx="8" fill="#1FC7D4" />
      {/* Keyhole */}
      <circle cx="20" cy="16" r="5" fill="white" />
      <path d="M17 20L16.2 30H23.8L23 20" fill="white" />
    </svg>
  );
}

/* ─── 11. MathWallet — Green rounded square, white M ─── */
export function MathWalletIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="2" width="36" height="36" rx="8" fill="#00C087" />
      {/* Clean geometric M */}
      <path
        d="M11 12L16 28L20 18L24 28L29 12"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/* ─── 12. Brave Wallet — Orange rounded square, lion face ─── */
export function BraveWalletIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="2" width="36" height="36" rx="8" fill="#FB542B" />
      {/* Lion mane — spiky circle */}
      <circle cx="20" cy="21" r="11" fill="none" stroke="white" strokeWidth="2.2" />
      {/* Mane spikes */}
      <circle cx="20" cy="9.5" r="2" fill="white" />
      <circle cx="11" cy="13" r="2" fill="white" />
      <circle cx="29" cy="13" r="2" fill="white" />
      <circle cx="9" cy="21" r="2" fill="white" />
      <circle cx="31" cy="21" r="2" fill="white" />
      <circle cx="12" cy="29" r="2" fill="white" />
      <circle cx="28" cy="29" r="2" fill="white" />
      {/* Inner face */}
      <circle cx="20" cy="21" r="6" fill="white" />
      {/* Eyes */}
      <circle cx="17.5" cy="19.5" r="1.3" fill="#FB542B" />
      <circle cx="22.5" cy="19.5" r="1.3" fill="#FB542B" />
      {/* Nose */}
      <path
        d="M19 22.5L20 23.5L21 22.5"
        stroke="#FB542B"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/* ─── 13. WalletConnect — Blue circle, stylized W chain link ─── */
export function WalletConnectIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="20" cy="20" r="20" fill="#3B99FC" />
      {/* W shape made of chain-link arcs */}
      <path
        d="M15.5 22C13.5 20 13.5 17 15.5 15L17 16.5C15.8 17.7 15.8 19.3 17 20.5L15.5 22Z"
        fill="white"
      />
      <path
        d="M24.5 22C26.5 20 26.5 17 24.5 15L23 16.5C24.2 17.7 24.2 19.3 23 20.5L24.5 22Z"
        fill="white"
      />
      <path
        d="M18 24.5C16 22.5 16 19.5 18 17.5L19.5 19C18.3 20.2 18.3 21.8 19.5 23L18 24.5Z"
        fill="white"
      />
      <path
        d="M22 24.5C24 22.5 24 19.5 22 17.5L20.5 19C21.7 20.2 21.7 21.8 20.5 23L22 24.5Z"
        fill="white"
      />
    </svg>
  );
}

/* ─── 14. Bybit Wallet — Orange rounded square, abstract mark ─── */
export function BybitWalletIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="2" width="36" height="36" rx="8" fill="#F5A623" />
      {/* Bybit stylized B with cutouts */}
      <path
        d="M12 11H22C25.5 11 27.5 13 27.5 16C27.5 18 26.5 19.5 25 20C26.5 20.5 27.5 22 27.5 24C27.5 27 25.5 29 22 29H12V11Z"
        fill="white"
      />
      <path
        d="M15 14.5H21C22.5 14.5 23.5 15.2 23.5 16.5C23.5 17.8 22.5 18.5 21 18.5H15V14.5Z"
        fill="#F5A623"
      />
      <path
        d="M15 21.5H21.5C23 21.5 24 22.2 24 23.5C24 24.8 23 25.5 21.5 25.5H15V21.5Z"
        fill="#F5A623"
      />
    </svg>
  );
}

/* ─── 15. SafePal — Orange/yellow gradient, shield with lock ─── */
export function SafePalIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="safepalGrad" x1="2" y1="2" x2="38" y2="38">
          <stop offset="0%" stopColor="#F7931A" />
          <stop offset="100%" stopColor="#FFC837" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="8" fill="url(#safepalGrad)" />
      {/* Shield shape */}
      <path
        d="M20 8L29 12.5V21C29 26 25 30 20 32C15 30 11 26 11 21V12.5L20 8Z"
        fill="white"
      />
      {/* Lock body */}
      <rect x="16.5" y="19" width="7" height="7" rx="1" fill="#F7931A" />
      {/* Lock shackle */}
      <path
        d="M17.5 19V16.5C17.5 15 18.5 14 20 14C21.5 14 22.5 15 22.5 16.5V19"
        stroke="#F7931A"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   WALLET_META — maps lowercase name → metadata
   ──────────────────────────────────────────────────────────── */

export const WALLET_META: Record<
  string,
  {
    name: string;
    icon: (props: { className?: string }) => JSX.Element;
    chromeUrl: string;
    color: string;
  }
> = {
  metamask: {
    name: "MetaMask",
    icon: MetaMaskIcon,
    chromeUrl:
      "https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn",
    color: "#F6851B",
  },
  "trust wallet": {
    name: "Trust Wallet",
    icon: TrustWalletIcon,
    chromeUrl:
      "https://chromewebstore.google.com/detail/trust-wallet/egjidjbpglichdkebodkjhgpjbjjmlja",
    color: "#3375BB",
  },
  "okx wallet": {
    name: "OKX Wallet",
    icon: OKXWalletIcon,
    chromeUrl:
      "https://chromewebstore.google.com/detail/okx-wallet/mcohilncbfahbmgdjkbpimkcboahcnil",
    color: "#000000",
  },
  "bitget wallet": {
    name: "Bitget Wallet",
    icon: BitgetWalletIcon,
    chromeUrl:
      "https://chromewebstore.google.com/detail/bitget-wallet/jidiclgjcaakpcolecfjcgpigepjcgnh",
    color: "#00D4AA",
  },
  "binance wallet": {
    name: "Binance Wallet",
    icon: BinanceWalletIcon,
    chromeUrl:
      "https://chromewebstore.google.com/detail/binance-wallet/fhbohimaelbohpjbbldcngcgpndfmgln",
    color: "#F0B90B",
  },
  "coinbase wallet": {
    name: "Coinbase Wallet",
    icon: CoinbaseWalletIcon,
    chromeUrl:
      "https://chromewebstore.google.com/detail/coinbase-wallet-extension/hnfanknocnoonbddcjjnifkmbkmgjfhb",
    color: "#0052FF",
  },
  phantom: {
    name: "Phantom",
    icon: PhantomIcon,
    chromeUrl:
      "https://chromewebstore.google.com/detail/phantom/bfnaelmomeimhlpmldjndhbobpaeljhf",
    color: "#AB6BFF",
  },
  rabby: {
    name: "Rabby",
    icon: RabbyIcon,
    chromeUrl:
      "https://chromewebstore.google.com/detail/rabby-wallet/acmacodkjbdgmoleebolmdjonilkdbch",
    color: "#7C5CFC",
  },
  rainbow: {
    name: "Rainbow",
    icon: RainbowIcon,
    chromeUrl:
      "https://chromewebstore.google.com/detail/rainbow/opglpfjajnmhkbbfohlbgcfpkkjhhodj",
    color: "linear-gradient(90deg, #FF0000, #FF8800, #FFDD00, #00CC44, #0088FF, #4400FF, #8800CC)",
  },
  onekey: {
    name: "OneKey",
    icon: OneKeyIcon,
    chromeUrl:
      "https://chromewebstore.google.com/detail/onekey/jbdaocneiihdjggehmicjoeedjlbbhga",
    color: "#1FC7D4",
  },
  mathwallet: {
    name: "MathWallet",
    icon: MathWalletIcon,
    chromeUrl:
      "https://chromewebstore.google.com/detail/mathwallet/afbcbjpbpfadlkmhmclhkeeokbmimncb",
    color: "#00C087",
  },
  "brave wallet": {
    name: "Brave Wallet",
    icon: BraveWalletIcon,
    chromeUrl: "https://brave.com/wallet/",
    color: "#FB542B",
  },
  walletconnect: {
    name: "WalletConnect",
    icon: WalletConnectIcon,
    chromeUrl: "https://walletconnect.com/",
    color: "#3B99FC",
  },
  bybit: {
    name: "Bybit Wallet",
    icon: BybitWalletIcon,
    chromeUrl:
      "https://chromewebstore.google.com/detail/bybit-wallet/nboeaefgbcflkndcgcllnagdbhkmlfid",
    color: "#F5A623",
  },
  safepal: {
    name: "SafePal",
    icon: SafePalIcon,
    chromeUrl:
      "https://chromewebstore.google.com/detail/safepal-extension-wallet/lgmpcpglpngdoalbgeoldeajfclnhafa",
    color: "#F7931A",
  },
};
