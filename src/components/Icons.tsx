type P = { className?: string; strokeWidth?: number }

// Iconos hairline dibujados a mano: trazos de 1.25 y terminaciones redondas.
const base = (className = 'h-5 w-5', sw = 1.25) => ({
  className,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: sw,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
})

export const IconCart = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <path d="M3 4h2l2.2 10.4A2 2 0 0 0 9.16 16h7.9a2 2 0 0 0 1.96-1.55L20.5 7H6" />
    <circle cx="10" cy="20" r="1.2" />
    <circle cx="17.5" cy="20" r="1.2" />
  </svg>
)

export const IconWallet = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6H17a2 2 0 0 1 2 2v1" />
    <rect x="3" y="8.5" width="18" height="11" rx="2.5" />
    <path d="M21 12.5h-3.5a2 2 0 0 0 0 4H21" />
  </svg>
)

export const IconUser = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </svg>
)

export const IconLife = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="3.5" />
    <path d="m6 6 3.5 3.5M18 6l-3.5 3.5M6 18l3.5-3.5M18 18l-3.5-3.5" />
  </svg>
)

export const IconStore = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <path d="M4 9h16v9.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z" />
    <path d="M3.2 9 5 4.5h14L20.8 9a2.4 2.4 0 0 1-4.4 1.4A2.4 2.4 0 0 1 12 10.4a2.4 2.4 0 0 1-4.4 0A2.4 2.4 0 0 1 3.2 9z" />
  </svg>
)

export const IconTag = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <path d="M3.5 11.2V4.8a1.3 1.3 0 0 1 1.3-1.3h6.4a1.3 1.3 0 0 1 .92.38l8 8a1.3 1.3 0 0 1 0 1.84l-6.4 6.4a1.3 1.3 0 0 1-1.84 0l-8-8a1.3 1.3 0 0 1-.38-.92z" />
    <circle cx="7.8" cy="7.8" r="1.1" />
  </svg>
)

export const IconArrow = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <path d="M5 12h13M13 6.5 18.5 12 13 17.5" />
  </svg>
)

export const IconPlus = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const IconMinus = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <path d="M5 12h14" />
  </svg>
)

export const IconTrash = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <path d="M4 7h16M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7M6.5 7l.8 12.1A1.5 1.5 0 0 0 8.8 20.5h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7" />
  </svg>
)

export const IconSearch = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </svg>
)

export const IconCheck = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
)

export const IconCopy = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2" />
    <path d="M15.5 5.5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2V13a2 2 0 0 0 2 2" />
  </svg>
)

export const IconWhatsApp = ({ className }: P) => (
  <svg className={className ?? 'h-5 w-5'} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84a9.75 9.75 0 0 0 1.34 4.94L2 22l5.36-1.4a9.9 9.9 0 0 0 4.68 1.19h.01c5.43 0 9.84-4.4 9.84-9.84S17.47 2 12.04 2m0 17.98h-.01a8.2 8.2 0 0 1-4.17-1.14l-.3-.18-3.18.83.85-3.1-.2-.32a8.14 8.14 0 0 1-1.25-4.35c0-4.51 3.68-8.18 8.2-8.18a8.18 8.18 0 0 1 .06 16.36m4.5-6.12c-.25-.13-1.46-.72-1.68-.8s-.39-.13-.55.12-.63.8-.78.97-.29.19-.54.06a6.7 6.7 0 0 1-1.97-1.22 7.4 7.4 0 0 1-1.37-1.7c-.14-.25-.01-.38.11-.5s.25-.29.37-.44.17-.25.25-.42a.46.46 0 0 0-.02-.44c-.06-.12-.55-1.34-.76-1.83s-.4-.42-.55-.43h-.47a.9.9 0 0 0-.65.3 2.75 2.75 0 0 0-.86 2.04 4.78 4.78 0 0 0 1 2.54 10.9 10.9 0 0 0 4.19 3.7c.58.25 1.04.4 1.4.51.59.19 1.13.16 1.55.1.47-.07 1.46-.6 1.66-1.17s.21-1.07.15-1.18-.23-.18-.48-.3" />
  </svg>
)

export const IconSpark = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9z" />
  </svg>
)

export const IconShield = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <path d="M12 3.2 19 6v6c0 4.2-2.9 7.4-7 8.8-4.1-1.4-7-4.6-7-8.8V6z" />
    <path d="m9 12 2.2 2.2L15.2 10" />
  </svg>
)

export const IconClock = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" />
  </svg>
)

export const IconGem = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <path d="M6 4h12l4 5.5-10 11L2 9.5z" />
    <path d="M2 9.5h20M9 4l-1 5.5 4 11 4-11L15 4" />
  </svg>
)

export const IconMenu = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <path d="M4 8h16M4 16h16" />
  </svg>
)

export const IconClose = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
)

export const IconBank = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <path d="M3.5 9.5 12 4.5l8.5 5M5 9.5v9M9.5 9.5v9M14.5 9.5v9M19 9.5v9M3 19.5h18" />
  </svg>
)

export const IconDoc = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <path d="M6 3.5h7l5 5v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1z" />
    <path d="M13 3.5v5h5M8.5 13h7M8.5 16.5h4.5" />
  </svg>
)
