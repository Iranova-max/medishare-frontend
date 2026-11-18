const SKY_ICON = "#38BDF8";

const Icon = ({ name, size = 16, color = SKY_ICON, strokeWidth = 2, style = {} }) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style,
    "aria-hidden": true,
    role: "img",
  };

  const glyphs = {
    hospital: (
      <svg {...common}>
        <path d="M3 21V8.5L12 3l9 5.5V21" />
        <path d="M9 21v-6h6v6" />
        <path d="M7 9h10" />
        <path d="M12 9v12" />
      </svg>
    ),
    crown: (
      <svg {...common}>
        <path d="M4 18 6 7l5 5 3-6 3 6 5 11H4Z" />
        <path d="M7 18h10" />
      </svg>
    ),
    doctor: (
      <svg {...common}>
        <path d="M9 5a3 3 0 0 1 6 0v1.5A3 3 0 0 1 12 9.5 3 3 0 0 1 9 6.5V5Z" />
        <path d="M7 19v-2a5 5 0 0 1 10 0v2" />
        <path d="M12 10v9" />
        <path d="M9 13h6" />
      </svg>
    ),
    nurse: (
      <svg {...common}>
        <path d="M7 8V5.8A1.8 1.8 0 0 1 8.8 4h6.4A1.8 1.8 0 0 1 17 5.8V8" />
        <path d="M8 8h8l1 11H7L8 8Z" />
        <path d="M12 11v5" />
        <path d="M9.5 13.5h5" />
      </svg>
    ),
    dashboard: (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="4" rx="1.5" />
        <rect x="14" y="11" width="7" height="10" rx="1.5" />
        <rect x="3" y="12" width="7" height="9" rx="1.5" />
      </svg>
    ),
    users: (
      <svg {...common}>
        <path d="M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1" />
        <circle cx="10" cy="7" r="3" />
        <path d="M20 19v-1a4 4 0 0 0-3-3.87" />
        <path d="M16 4.13a3.5 3.5 0 0 1 0 6.74" />
      </svg>
    ),
    inbox: (
      <svg {...common}>
        <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5v7A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5v-7Z" />
        <path d="M4 13h4l2 2h4l2-2h4" />
      </svg>
    ),
    send: (
      <svg {...common}>
        <path d="M4 12 20 4l-4 16-5-6-7-2Z" />
        <path d="M20 4 10 14" />
      </svg>
    ),
    folder: (
      <svg {...common}>
        <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2h7.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
      </svg>
    ),
    bell: (
      <svg {...common}>
        <path d="M15 17H5l1.4-2.1V10a5.6 5.6 0 1 1 11.2 0v4.9L19 17h-4" />
        <path d="M10 20a2 2 0 0 0 4 0" />
      </svg>
    ),
    file: (
      <svg {...common}>
        <path d="M7 3h6l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M13 3v5h5" />
        <path d="M8 13h8M8 17h8" />
      </svg>
    ),
    check: (
      <svg {...common}>
        <path d="m5 12 4 4L19 2" />
      </svg>
    ),
    close: (
      <svg {...common}>
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    ),
    warning: (
      <svg {...common}>
        <path d="M12 3 2.5 18.5h19L12 3Z" />
        <path d="M12 9v5" />
        <circle cx="12" cy="16.5" r="1" fill={color} stroke="none" />
      </svg>
    ),
    info: (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 10v6" />
        <path d="M12 7.5h.01" />
      </svg>
    ),
    search: (
      <svg {...common}>
        <circle cx="11" cy="11" r="5" />
        <path d="m16 16 4 4" />
      </svg>
    ),
    plus: (
      <svg {...common}>
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
    lock: (
      <svg {...common}>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 1 1 8 0v3" />
      </svg>
    ),
    eye: (
      <svg {...common}>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    document: (
      <svg {...common}>
        <path d="M7 3h7l5 5v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M14 3v5h5" />
      </svg>
    ),
    filter: (
      <svg {...common}>
        <path d="M4 6h16M7 12h10M10 18h4" />
      </svg>
    ),
    user: (
      <svg {...common}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 19a8 8 0 0 1 16 0" />
      </svg>
    ),
    shield: (
      <svg {...common}>
        <path d="M12 3 5 6v6c0 4.4 2.7 8.1 7 10 4.3-1.9 7-5.6 7-10V6l-7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    alert: (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v6" />
        <path d="M12 17h.01" />
      </svg>
    ),
    audit: (
      <svg {...common}>
        <path d="M7 3h6l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M13 3v5h5" />
        <path d="M8 13h8M8 17h6" />
      </svg>
    ),
    medical: (
      <svg {...common}>
        <path d="M9 6h6v4h4v6h-4v4H9v-4H5V10h4V6Z" />
      </svg>
    ),
    calendar: (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </svg>
    ),
    phone: (
      <svg {...common}>
        <path d="M7 3h3l2 5-2.5 1.5a13 13 0 0 0 5 5L16 12l5 2v3a3 3 0 0 1-3 3A15 15 0 0 1 4 6a3 3 0 0 1 3-3Z" />
      </svg>
    ),
    mail: (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    ),
    pin: (
      <svg {...common}>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
    tag: (
      <svg {...common}>
        <path d="M20 13 13 20 3 10V4h6l11 9Z" />
        <circle cx="7.5" cy="7.5" r="1" />
      </svg>
    ),
    edit: (
      <svg {...common}>
        <path d="m14 5 5 5M4 20l4.5-1 11-11a2.1 2.1 0 0 0-3-3l-11 11L4 20Z" />
      </svg>
    ),
    clock: (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
    prescription: (
      <svg {...common}>
        <path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M14 3v5h5M9 13h6M9 17h6" />
      </svg>
    ),
    lab: (
      <svg {...common}>
        <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" />
        <path d="M7 16h10M9 13h6" />
      </svg>
    ),
    arrowLeft: (
      <svg {...common}>
        <path d="M19 12H5m7 7-7-7 7-7" />
      </svg>
    ),
    arrowRight: (
      <svg {...common}>
        <path d="M5 12h14m-7-7 7 7-7 7" />
      </svg>
    ),
    chevronDown: (
      <svg {...common}>
        <path d="m6 9 6 6 6-6" />
      </svg>
    ),
    chevronUp: (
      <svg {...common}>
        <path d="m6 15 6-6 6 6" />
      </svg>
    ),
    pause: (
      <svg {...common}>
        <rect x="6" y="4" width="4" height="16" rx="1" />
        <rect x="14" y="4" width="4" height="16" rx="1" />
      </svg>
    ),
    play: (
      <svg {...common}>
        <path d="m7 4 13 8-13 8V4Z" />
      </svg>
    ),
    refresh: (
      <svg {...common}>
        <path d="M20 7v5h-5M4 17v-5h5" />
        <path d="M5.6 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.4-3" />
      </svg>
    ),
  };

  return glyphs[name] || glyphs.hospital;
};

export default Icon;
