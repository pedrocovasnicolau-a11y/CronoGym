// Minimal stroke icons — reps app
const Icon = ({ children, size = 22, stroke = 'currentColor', fill = 'none', sw = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const IconStopwatch = (p) => <Icon {...p}><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M9 2h6"/><path d="M12 2v3"/></Icon>;
const IconCountdown = (p) => <Icon {...p}><circle cx="12" cy="13" r="8"/><path d="M12 13V8"/><path d="M9 2h6"/></Icon>;
const IconTabata   = (p) => <Icon {...p}><rect x="3" y="6" width="8" height="12" rx="1.5"/><rect x="13" y="6" width="8" height="12" rx="1.5"/></Icon>;
const IconEmom     = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/><path d="M21 5l-2 2"/><path d="M3 5l2 2"/></Icon>;
const IconRest     = (p) => <Icon {...p}><path d="M4 18h16"/><path d="M6 14c0-3 2-5 6-5s6 2 6 5"/><path d="M8 9V6"/><path d="M12 9V4"/><path d="M16 9V6"/></Icon>;
const IconSets     = (p) => <Icon {...p}><rect x="3" y="4" width="18" height="5" rx="1"/><rect x="3" y="11" width="18" height="5" rx="1"/><rect x="3" y="18" width="18" height="3" rx="1"/></Icon>;
const IconPlay     = (p) => <Icon {...p} fill="currentColor" sw={0}><path d="M7 5v14l12-7z"/></Icon>;
const IconPause    = (p) => <Icon {...p} fill="currentColor" sw={0}><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></Icon>;
const IconStop     = (p) => <Icon {...p} fill="currentColor" sw={0}><rect x="6" y="6" width="12" height="12" rx="2"/></Icon>;
const IconReset    = (p) => <Icon {...p}><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></Icon>;
const IconPlus     = (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>;
const IconMinus    = (p) => <Icon {...p}><path d="M5 12h14"/></Icon>;
const IconFlag     = (p) => <Icon {...p}><path d="M4 22V4h13l-2 4 2 4H4"/></Icon>;
const IconBell     = (p) => <Icon {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 21a2 2 0 0 0 4 0"/></Icon>;
const IconMore     = (p) => <Icon {...p}><circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/></Icon>;
const IconBack     = (p) => <Icon {...p}><path d="M15 6l-6 6 6 6"/></Icon>;
const IconCheck    = (p) => <Icon {...p}><path d="M4 12l5 5 11-11"/></Icon>;
const IconFlash    = (p) => <Icon {...p} fill="currentColor" sw={0}><path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z"/></Icon>;
const IconHome     = (p) => <Icon {...p}><path d="M3 11l9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V11z"/></Icon>;
const IconList     = (p) => <Icon {...p}><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></Icon>;
const IconSettings = (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8L4.2 7a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></Icon>;

Object.assign(window, {
  Icon,
  IconStopwatch, IconCountdown, IconTabata, IconEmom, IconRest, IconSets,
  IconPlay, IconPause, IconStop, IconReset, IconPlus, IconMinus, IconFlag,
  IconBell, IconMore, IconBack, IconCheck, IconFlash, IconHome, IconList, IconSettings,
});
