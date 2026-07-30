import { EPISODES, type Episode } from "./episodes";

export type ScheduleBlock = {
  time: string;
  label: string;
  unit: "A" | "B" | "both";
  note?: string;
};

export type LogisticsItem = {
  label: string;
  value: string;
  status: "ok" | "pending" | "risk";
};

export type CrewCall = {
  role: string;
  name: string;
  call: string;
  unit: "A" | "B" | "both";
};

export type ShootDay = {
  id: string;
  dayCode: string; // "Day 4"
  date: string;
  city: string;
  status: "confirmed" | "in-progress" | "at-risk" | "wrapped";
  /** exactly two episode slugs — a shoot day always pairs two episodes */
  pair: [string, string];
  wrap: string;
  schedule: ScheduleBlock[];
  crew: CrewCall[];
  logistics: LogisticsItem[];
  note?: string;
};

export const SHOOT_DAYS: ShootDay[] = [
  {
    id: "day-04-hanoi",
    dayCode: "Day 04",
    date: "12 Oct",
    city: "Hanoi, Vietnam",
    status: "wrapped",
    pair: ["ep-04-ba-hanh-pho", "ep-07-ainu-kitchen"],
    wrap: "21:30",
    note: "Dawn unit + afternoon market unit shared one crew.",
    schedule: [
      { time: "04:30", label: "Crew call — stall prep", unit: "A" },
      { time: "05:15", label: "Broth ritual / first light", unit: "A", note: "Ambient audio pass" },
      { time: "08:00", label: "Interview — Bà Hạnh", unit: "A" },
      { time: "11:00", label: "Company move", unit: "both" },
      { time: "13:00", label: "Unit B setup — market", unit: "B" },
      { time: "18:00", label: "Golden hour exteriors", unit: "B" },
      { time: "21:30", label: "Wrap + card offload", unit: "both" },
    ],
    crew: [
      { role: "PR", name: "Producer — Chi", call: "04:30", unit: "both" },
      { role: "DP", name: "Camera — T. Oyama", call: "04:30", unit: "both" },
      { role: "SP", name: "Fixer — Minh Pham", call: "04:15", unit: "both" },
      { role: "ED", name: "DIT — remote", call: "12:00", unit: "both" },
    ],
    logistics: [
      { label: "Transport", value: "2 vans · 04:00 pickup", status: "ok" },
      { label: "Permits", value: "Street filming — approved", status: "ok" },
      { label: "Meals", value: "Crew 6 · on-location", status: "ok" },
      { label: "Media", value: "512GB × 6 · offloaded", status: "ok" },
    ],
  },
  {
    id: "day-05-bologna",
    dayCode: "Day 05",
    date: "28–29 Jul",
    city: "Bologna, Italy",
    status: "in-progress",
    pair: ["ep-05-nonna-rosa", "ep-03-tagine-marrakech"],
    wrap: "22:00",
    note: "Rain forecast 18:00 — exterior block may swap with kitchen block.",
    schedule: [
      { time: "07:00", label: "Crew call — Studio 12", unit: "both" },
      { time: "08:30", label: "Kitchen setup / pasta board", unit: "A" },
      { time: "10:00", label: "Gnocchi process — A cam", unit: "A" },
      { time: "14:00", label: "Interview — Rosa Bianchi", unit: "A" },
      { time: "16:30", label: "Unit B pickups — grade refs", unit: "B", note: "Stills for colorist" },
      { time: "19:00", label: "Golden hour exterior", unit: "A", note: "Weather-dependent" },
      { time: "22:00", label: "Wrap", unit: "both" },
    ],
    crew: [
      { role: "DP", name: "Camera — L. Ferri", call: "07:00", unit: "both" },
      { role: "PR", name: "Producer — Chi", call: "07:00", unit: "both" },
      { role: "SP", name: "Sound — M. Conti", call: "08:00", unit: "A" },
      { role: "ED", name: "DIT — on set", call: "10:00", unit: "both" },
    ],
    logistics: [
      { label: "Transport", value: "1 van · 06:30 pickup", status: "ok" },
      { label: "Permits", value: "Piazza exterior — filed", status: "pending" },
      { label: "Weather", value: "Rain 70% at 18:00", status: "risk" },
      { label: "Meals", value: "Crew 5 · Studio 12", status: "ok" },
    ],
  },
  {
    id: "day-06-lisbon-oaxaca",
    dayCode: "Day 06",
    date: "14–15 Nov",
    city: "Lisbon, Portugal",
    status: "confirmed",
    pair: ["ep-08-marias-bacalhau", "ep-06-masa-oaxaca"],
    wrap: "20:00",
    note: "PPM Friday locks the shot list before this pairing is final.",
    schedule: [
      { time: "06:45", label: "Crew call — quay", unit: "A" },
      { time: "07:30", label: "Salt cod market b-roll", unit: "A" },
      { time: "11:00", label: "Kitchen block — Maria", unit: "A" },
      { time: "15:00", label: "Company move", unit: "both" },
      { time: "16:00", label: "Unit B — masa remote pre-interview", unit: "B" },
      { time: "20:00", label: "Wrap", unit: "both" },
    ],
    crew: [
      { role: "EP", name: "EP — Chi", call: "06:45", unit: "both" },
      { role: "PR", name: "Producer — J. Serra", call: "06:30", unit: "both" },
      { role: "DP", name: "Camera — TBC", call: "06:45", unit: "A" },
    ],
    logistics: [
      { label: "Transport", value: "1 van + 1 car", status: "ok" },
      { label: "Permits", value: "Quay access — awaiting", status: "pending" },
      { label: "Shot list", value: "PPM deck §4 outstanding", status: "risk" },
      { label: "Meals", value: "Crew 4 · catered", status: "ok" },
    ],
  },
  {
    id: "day-07-dakar",
    dayCode: "Day 07",
    date: "Nov · TBC",
    city: "Dakar, Senegal",
    status: "at-risk",
    pair: ["ep-dakar-teranga", "ep-02-halmeoni-doenjang"],
    wrap: "—",
    note: "DP visa pending — pairing cannot be locked until crew is cleared.",
    schedule: [
      { time: "—", label: "Schedule blocked pending visa decision", unit: "both" },
    ],
    crew: [
      { role: "EP", name: "EP — Chi", call: "TBC", unit: "both" },
      { role: "SP", name: "Fixer — Awa Sy", call: "TBC", unit: "both" },
      { role: "DP", name: "Camera — visa pending", call: "TBC", unit: "A" },
    ],
    logistics: [
      { label: "Visas", value: "DP packet — 12+ days", status: "risk" },
      { label: "Transport", value: "Not booked", status: "pending" },
      { label: "Permits", value: "Not filed", status: "pending" },
      { label: "Meals", value: "—", status: "pending" },
    ],
  },
];

export function getShootDay(id: string): ShootDay | undefined {
  return SHOOT_DAYS.find((d) => d.id === id);
}

export function pairEpisodes(day: ShootDay): [Episode | undefined, Episode | undefined] {
  return [
    EPISODES.find((e) => e.slug === day.pair[0]),
    EPISODES.find((e) => e.slug === day.pair[1]),
  ];
}
