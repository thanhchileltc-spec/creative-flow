export type Role = "EP" | "PR" | "SP" | "DP" | "ED";

export type EpisodeStatus = "normal" | "active" | "blocked" | "idle";

export type StageDoc = {
  label: string;
  kind: "brief" | "outline" | "shotlist" | "budget" | "call-sheet" | "cut" | "release" | "deck";
  status: "draft" | "in-review" | "locked" | "missing";
  updated: string;
};

export type TalentRecord = {
  name: string;
  role: string; // "Chef", "Translator", "Fixer"
  location: string;
  contact: string;
  status: "confirmed" | "pending" | "contacted" | "declined";
  note?: string;
};

export type StageDetail = {
  key: string;
  index: number; // 1-8
  name: string;
  status: "done" | "current" | "upcoming" | "blocked";
  docs: StageDoc[];
  blocker?: string;
};

export type Episode = {
  slug: string;
  code: string;
  location: string;
  title: string;
  meta: string;
  stageIndex: number;
  stageLabel: string;
  status: EpisodeStatus;
  roles: Role[];
  delay: number;
  logline?: string;
  pairedWith?: string;
  shootWindow?: string;
  stages: StageDetail[];
  talent: TalentRecord[];
};

export const STAGES = [
  "Sourcing",
  "Discovery",
  "Story Lock",
  "Logistics",
  "PPM",
  "Shoot",
  "Post",
  "Publish",
] as const;

// helper to build a default stage set with statuses based on current index
function buildStages(
  currentIndex: number,
  overrides: Partial<Record<number, Partial<StageDetail>>> = {},
): StageDetail[] {
  return STAGES.map((name, i) => {
    const index = i + 1;
    const base: StageDetail = {
      key: name.toLowerCase().replace(/\s+/g, "-"),
      index,
      name,
      status:
        index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming",
      docs: [],
    };
    const o = overrides[index];
    return o ? { ...base, ...o, docs: o.docs ?? base.docs } : base;
  });
}

export const EPISODES: Episode[] = [
  {
    slug: "ep-04-ba-hanh-pho",
    code: "Ep. 04",
    location: "Hanoi, Vietnam",
    title: "Bà Hạnh's phở stall",
    meta: "Paired with: Morning Market (Day 4)",
    stageIndex: 7,
    stageLabel: "Review Cut",
    status: "active",
    roles: ["PR", "ED"],
    delay: 40,
    logline:
      "Four generations of a Hanoi phở family serve dawn until the broth runs out — a portrait of ritual, patience, and inheritance.",
    pairedWith: "Morning Market (Day 4)",
    shootWindow: "Wrapped · 12 Oct",
    stages: buildStages(7, {
      7: {
        status: "current",
        blocker: "Editor waiting on ambient sound pass from field recordings.",
        docs: [
          { label: "Assembly cut v3", kind: "cut", status: "in-review", updated: "2h ago" },
          { label: "LUT / grade notes", kind: "cut", status: "draft", updated: "yesterday" },
          { label: "Music brief", kind: "brief", status: "locked", updated: "3d ago" },
        ],
      },
    }),
    talent: [
      { name: "Bà Hạnh Nguyễn", role: "Chef / Owner", location: "Hanoi", contact: "via fixer", status: "confirmed" },
      { name: "Linh Trần", role: "Translator", location: "Hanoi", contact: "linh@—", status: "confirmed" },
      { name: "Minh Pham", role: "Fixer", location: "Hanoi", contact: "+84 ···", status: "confirmed" },
    ],
  },
  {
    slug: "ep-05-nonna-rosa",
    code: "Ep. 05",
    location: "Bologna, Italy",
    title: "Nonna Rosa's Gnocchi",
    meta: "Shoot Day 1 of 2 — Wrap 22:00",
    stageIndex: 6,
    stageLabel: "On Location",
    status: "normal",
    roles: ["DP"],
    delay: 80,
    shootWindow: "In progress · 28–29 Jul",
    stages: buildStages(6, {
      6: {
        status: "current",
        blocker: "Golden hour exterior at risk — rain forecast 18:00.",
        docs: [
          { label: "Call sheet — Day 1", kind: "call-sheet", status: "locked", updated: "this morning" },
          { label: "DP shot list", kind: "shotlist", status: "locked", updated: "2d ago" },
          { label: "Location release", kind: "release", status: "locked", updated: "1w ago" },
        ],
      },
    }),
    talent: [
      { name: "Rosa Bianchi", role: "Chef", location: "Bologna", contact: "via agent", status: "confirmed" },
      { name: "Studio 12", role: "Location", location: "Bologna", contact: "studio12@—", status: "confirmed" },
    ],
  },
  {
    slug: "ep-dakar-teranga",
    code: "Blocked — Action Required",
    location: "Dakar, Senegal",
    title: "Chef Amadou's Teranga",
    meta: "Dakar, Senegal · Logistics stalled",
    stageIndex: 4,
    stageLabel: "Visa Delay",
    status: "blocked",
    roles: ["EP", "PR", "SP"],
    delay: 120,
    logline: "A chef reclaiming the communal table as a form of resistance in modern Dakar.",
    shootWindow: "Target · Nov (at risk)",
    stages: buildStages(4, {
      4: {
        status: "blocked",
        blocker:
          "DP visa pending — consulate response 12+ business days. Need decision by Fri: reschedule or swap DP.",
        docs: [
          { label: "Logistics brief", kind: "brief", status: "in-review", updated: "yesterday" },
          { label: "Budget v2", kind: "budget", status: "draft", updated: "3d ago" },
          { label: "Visa packet — DP", kind: "release", status: "missing", updated: "—" },
        ],
      },
    }),
    talent: [
      { name: "Amadou Diop", role: "Chef", location: "Dakar", contact: "via SP", status: "confirmed" },
      { name: "Awa Sy", role: "Fixer", location: "Dakar", contact: "awa@—", status: "confirmed", note: "Excellent local network" },
      { name: "TBD", role: "Second DP (contingency)", location: "—", contact: "—", status: "pending" },
    ],
  },
  {
    slug: "ep-06-masa-oaxaca",
    code: "Ep. 06",
    location: "Oaxaca, Mexico",
    title: "The Masa of Oaxaca",
    meta: "Discovery · Pre-interviewing talent",
    stageIndex: 2,
    stageLabel: "In Scouting",
    status: "idle",
    roles: ["SP"],
    delay: 160,
    stages: buildStages(2, {
      2: {
        status: "current",
        blocker: "Awaiting call-back from third candidate before shortlisting.",
        docs: [
          { label: "Talent shortlist", kind: "brief", status: "draft", updated: "today" },
          { label: "Discovery notes", kind: "outline", status: "draft", updated: "today" },
        ],
      },
    }),
    talent: [
      { name: "Doña Marcelina", role: "Chef candidate", location: "Oaxaca", contact: "via SP", status: "contacted" },
      { name: "Rufina López", role: "Chef candidate", location: "Teotitlán", contact: "via SP", status: "pending" },
    ],
  },
  {
    slug: "ep-07-ainu-kitchen",
    code: "Ep. 07",
    location: "Hokkaido, Japan",
    title: "Sourcing the Ainu Kitchen",
    meta: "Sourcing · Translator needed",
    stageIndex: 1,
    stageLabel: "",
    status: "idle",
    roles: ["PR"],
    delay: 200,
    stages: buildStages(1, {
      1: {
        status: "current",
        blocker: "No Ainu-speaking translator sourced yet — reach out to Hokkaido U. contact.",
        docs: [
          { label: "Research doc", kind: "brief", status: "draft", updated: "1w ago" },
        ],
      },
    }),
    talent: [],
  },
  {
    slug: "ep-08-marias-bacalhau",
    code: "Ep. 08",
    location: "Lisbon, Portugal",
    title: "Maria's Bacalhau",
    meta: "Paired with: The Masa of Oaxaca (Day 6)",
    stageIndex: 5,
    stageLabel: "PPM Fri",
    status: "normal",
    roles: ["EP", "PR", "DP"],
    delay: 240,
    pairedWith: "The Masa of Oaxaca (Day 6)",
    shootWindow: "Planned · 14–15 Nov",
    stages: buildStages(5, {
      5: {
        status: "current",
        blocker: "PPM deck section 4 (shot list) still owned by DP — due Thu EOD.",
        docs: [
          { label: "PPM deck v1", kind: "deck", status: "draft", updated: "yesterday" },
          { label: "Budget final", kind: "budget", status: "in-review", updated: "2d ago" },
          { label: "Call sheet draft", kind: "call-sheet", status: "draft", updated: "today" },
        ],
      },
    }),
    talent: [
      { name: "Maria Alves", role: "Chef", location: "Lisbon", contact: "confirmed", status: "confirmed" },
      { name: "João Serra", role: "Fixer", location: "Lisbon", contact: "joao@—", status: "confirmed" },
    ],
  },
  {
    slug: "ep-03-tagine-marrakech",
    code: "Ep. 03",
    location: "Marrakech, Morocco",
    title: "Tagine at the Souk",
    meta: "Edit in progress · Assembly locked",
    stageIndex: 7,
    stageLabel: "LUT pending",
    status: "normal",
    roles: ["ED"],
    delay: 280,
    stages: buildStages(7, {
      7: {
        status: "current",
        blocker: "Colorist starts Mon — deliver reference stills by Fri.",
        docs: [
          { label: "Locked assembly", kind: "cut", status: "locked", updated: "4d ago" },
          { label: "Grade references", kind: "cut", status: "draft", updated: "today" },
        ],
      },
    }),
    talent: [
      { name: "Yassine El Amrani", role: "Chef", location: "Marrakech", contact: "wrapped", status: "confirmed" },
    ],
  },
  {
    slug: "ep-02-halmeoni-doenjang",
    code: "Ep. 02",
    location: "Seoul, South Korea",
    title: "Halmeoni's Doenjang Jjigae",
    meta: "Published · Content calendar active",
    stageIndex: 8,
    stageLabel: "Live",
    status: "normal",
    roles: ["ED"],
    delay: 320,
    stages: buildStages(8, {
      8: {
        status: "current",
        blocker: "Short-form cutdown 3 of 5 still queued for social.",
        docs: [
          { label: "Master file", kind: "cut", status: "locked", updated: "2w ago" },
          { label: "Social cutdowns", kind: "cut", status: "in-review", updated: "3d ago" },
        ],
      },
    }),
    talent: [
      { name: "Choi Sun-hee", role: "Chef / Grandmother", location: "Seoul", contact: "wrapped", status: "confirmed" },
    ],
  },
];

export function getEpisode(slug: string): Episode | undefined {
  return EPISODES.find((e) => e.slug === slug);
}
