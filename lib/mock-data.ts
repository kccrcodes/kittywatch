/**
 * Fake data for the Milestone 1 visual frontend.
 * Shapes loosely mirror the SPEC API contract (GET /api/cats etc.) so the
 * swap to real endpoints later is mostly a data-source change.
 */

export type CatStatus = "healthy" | "needs_attention" | "missing";

export type CatPersonality = "friendly" | "shy" | "explorer" | "sleepy";

export interface MockCat {
  id: string;
  name: string;
  sex: "female" | "male";
  breed: string;
  zone: string;
  /** Real-ish NUS coordinates; the placeholder map projects them to x/y. */
  lat: number;
  lng: number;
  status: CatStatus;
  lastSeen: string;
  personality: CatPersonality;
  photoUrl: string;
  favorite: boolean;
  /** Pastel tint used by the doodle map marker face. */
  tint: string;
}

export interface MockSighting {
  id: string;
  catId: string;
  catName: string;
  photoUrl: string;
  spottedAt: string;
  note: string;
  timeAgo: string;
}

export interface MockAlert {
  id: string;
  catName: string;
  photoUrl: string;
  title: string;
  meta: string;
  severity: "high" | "medium";
}

export interface MockStat {
  id: string;
  label: string;
  value: string;
  hint?: string;
  hintTone?: "pink" | "green";
  icon: "cats" | "sightings" | "followup" | "watchers";
  sparkline?: number[];
}

export interface MockZone {
  name: string;
  cats: number;
  dot: string;
}

// placecats.com serves a small set of named cats; distinct crops keep the
// thumbnails varied. Purely placeholder imagery.
const photo = (cat: string, w: number, h: number) =>
  `https://placecats.com/${cat}/${w}/${h}`;

export const mockCats: MockCat[] = [
  {
    id: "cat-mochi",
    name: "Mochi",
    sex: "female",
    breed: "Domestic Shorthair",
    zone: "UTown",
    lat: 1.3049,
    lng: 103.7727,
    status: "healthy",
    lastSeen: "10m ago",
    personality: "friendly",
    photoUrl: photo("millie", 240, 240),
    favorite: true,
    tint: "var(--pink-200)",
  },
  {
    id: "cat-oreo",
    name: "Oreo",
    sex: "male",
    breed: "Tuxedo",
    zone: "Science Drive",
    lat: 1.2966,
    lng: 103.7764,
    status: "needs_attention",
    lastSeen: "1h ago",
    personality: "shy",
    photoUrl: photo("neo", 240, 240),
    favorite: false,
    tint: "var(--blue-soft)",
  },
  {
    id: "cat-tiger",
    name: "Tiger",
    sex: "male",
    breed: "Orange Tabby",
    zone: "Central Library",
    lat: 1.2976,
    lng: 103.7736,
    status: "healthy",
    lastSeen: "2h ago",
    personality: "explorer",
    photoUrl: photo("bella", 260, 240),
    favorite: true,
    tint: "var(--orange-soft)",
  },
  {
    id: "cat-luna",
    name: "Luna",
    sex: "female",
    breed: "Calico",
    zone: "Kent Ridge Park",
    lat: 1.2921,
    lng: 103.7769,
    status: "healthy",
    lastSeen: "3h ago",
    personality: "friendly",
    photoUrl: photo("millie_neo", 240, 220),
    favorite: false,
    tint: "var(--green-200)",
  },
  {
    id: "cat-smokey",
    name: "Smokey",
    sex: "male",
    breed: "Russian Blue mix",
    zone: "COM3",
    lat: 1.2949,
    lng: 103.7744,
    status: "healthy",
    lastSeen: "5h ago",
    personality: "shy",
    photoUrl: photo("neo", 250, 230),
    favorite: false,
    tint: "var(--blue-soft)",
  },
  {
    id: "cat-ziggy",
    name: "Ziggy",
    sex: "male",
    breed: "Grey Tabby",
    zone: "E3 Carpark",
    lat: 1.3005,
    lng: 103.7708,
    status: "missing",
    lastSeen: "3 days ago",
    personality: "explorer",
    photoUrl: photo("louie", 240, 240),
    favorite: true,
    tint: "var(--red-soft)",
  },
  {
    id: "cat-sunny",
    name: "Sunny",
    sex: "female",
    breed: "Ginger",
    zone: "Prince George's Park",
    lat: 1.2911,
    lng: 103.7806,
    status: "healthy",
    lastSeen: "yesterday",
    personality: "sleepy",
    photoUrl: photo("poppy", 260, 230),
    favorite: false,
    tint: "var(--yellow-soft)",
  },
  {
    id: "cat-patches",
    name: "Patches",
    sex: "female",
    breed: "Calico",
    zone: "Yusof Ishak House",
    lat: 1.2989,
    lng: 103.7748,
    status: "needs_attention",
    lastSeen: "2 days ago",
    personality: "friendly",
    photoUrl: photo("millie_neo", 250, 240),
    favorite: false,
    tint: "var(--yellow-soft)",
  },
];

export const mockSightings: MockSighting[] = [
  {
    id: "sight-1",
    catId: "cat-mochi",
    catName: "Mochi",
    photoUrl: photo("millie", 320, 200),
    spottedAt: "UTown near Starbucks",
    note: "Relaxing on the grass near the benches.",
    timeAgo: "10m ago",
  },
  {
    id: "sight-2",
    catId: "cat-tiger",
    catName: "Tiger",
    photoUrl: photo("bella", 320, 210),
    spottedAt: "Central Library steps",
    note: "Waiting near the bicycle rack.",
    timeAgo: "2h ago",
  },
  {
    id: "sight-3",
    catId: "cat-luna",
    catName: "Luna",
    photoUrl: photo("millie_neo", 320, 200),
    spottedAt: "Kent Ridge Park benches",
    note: "Chasing butterflies by the trail.",
    timeAgo: "3h ago",
  },
  {
    id: "sight-4",
    catId: "cat-smokey",
    catName: "Smokey",
    photoUrl: photo("neo", 320, 200),
    spottedAt: "COM3 loading bay",
    note: "Napping in the shade, looked well fed.",
    timeAgo: "5h ago",
  },
];

export const mockAlerts: MockAlert[] = [
  {
    id: "alert-1",
    catName: "Ziggy",
    photoUrl: photo("louie", 200, 200),
    title: "Ziggy hasn't been seen for 3 days",
    meta: "Last seen near E3 Carpark",
    severity: "high",
  },
  {
    id: "alert-2",
    catName: "Patches",
    photoUrl: photo("millie_neo", 200, 200),
    title: "Patches was flagged as needs care",
    meta: "Limping reported near Yusof Ishak House",
    severity: "medium",
  },
  {
    id: "alert-3",
    catName: "New kitten",
    photoUrl: photo("neo", 210, 200),
    title: "New kitten spotted!",
    meta: "Near UTown Residence — not yet registered",
    severity: "medium",
  },
];

export const mockStats: MockStat[] = [
  {
    id: "stat-cats",
    label: "Registered Cats",
    value: "128",
    hint: "+5 this week",
    hintTone: "pink",
    icon: "cats",
  },
  {
    id: "stat-sightings",
    label: "Sightings Today",
    value: "28",
    hint: "↑ 12% vs yesterday",
    hintTone: "green",
    icon: "sightings",
    sparkline: [4, 7, 5, 9, 8, 12, 10],
  },
  {
    id: "stat-followup",
    label: "Need Follow-up",
    value: "3",
    hint: "View alerts",
    hintTone: "pink",
    icon: "followup",
    sparkline: [1, 2, 1, 3, 2, 4, 3],
  },
  {
    id: "stat-watchers",
    label: "Volunteer Watchers",
    value: "42",
    hint: "Active today",
    hintTone: "green",
    icon: "watchers",
  },
];

export const mockZones: MockZone[] = [
  { name: "UTown", cats: 28, dot: "var(--pink-400)" },
  { name: "Central Campus", cats: 34, dot: "var(--yellow-soft)" },
  { name: "Science Drive", cats: 22, dot: "var(--green-400)" },
  { name: "Kent Ridge", cats: 26, dot: "var(--blue-soft)" },
  { name: "Others", cats: 18, dot: "var(--text-muted-c)" },
];

export const statusLabels: Record<CatStatus, string> = {
  healthy: "Healthy",
  needs_attention: "Needs Care",
  missing: "Missing",
};

export const personalityLabels: Record<CatPersonality, string> = {
  friendly: "Friendly",
  shy: "Shy",
  explorer: "Explorer",
  sleepy: "Sleepy",
};
