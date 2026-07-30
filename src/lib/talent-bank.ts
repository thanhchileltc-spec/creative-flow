import { EPISODES } from "./episodes";

export type ApprovalStatus =
  | "sourced"
  | "call-scheduled"
  | "in-review"
  | "approved"
  | "passed";

export type DiscoveryCall = {
  date: string;
  duration: string;
  interviewer: string; // role code, e.g. "PR"
  summary: string;
  outcome: "advance" | "hold" | "pass";
};

export type TalentProfile = {
  id: string;
  name: string;
  craft: string; // "Chef", "Fixer", "Translator"
  location: string;
  sourcedBy: string; // role code
  sourcedOn: string;
  sourcedVia: string; // "Local fixer", "Instagram", "Referral"
  contact: string;
  approval: ApprovalStatus;
  /** episode slugs this talent is attached to or considered for */
  episodes: string[];
  storyFit: {
    score: number; // 1-5
    note: string;
    risk?: string;
  };
  calls: DiscoveryCall[];
};

export const APPROVAL_ORDER: ApprovalStatus[] = [
  "sourced",
  "call-scheduled",
  "in-review",
  "approved",
  "passed",
];

export const APPROVAL_LABEL: Record<ApprovalStatus, string> = {
  sourced: "Sourced",
  "call-scheduled": "Call scheduled",
  "in-review": "In review",
  approved: "Approved",
  passed: "Passed",
};

export const TALENT: TalentProfile[] = [
  {
    id: "ba-hanh-nguyen",
    name: "Bà Hạnh Nguyễn",
    craft: "Chef / Owner",
    location: "Hanoi, Vietnam",
    sourcedBy: "PR",
    sourcedOn: "14 Jun",
    sourcedVia: "Local fixer — Minh Pham",
    contact: "via fixer",
    approval: "approved",
    episodes: ["ep-04-ba-hanh-pho"],
    storyFit: {
      score: 5,
      note: "Four generations behind one pot. Speaks in ritual, not recipe — the inheritance angle carries the whole episode without narration.",
    },
    calls: [
      {
        date: "18 Jun",
        duration: "42 min",
        interviewer: "PR",
        summary:
          "Interpreted call. Warm, unguarded, comfortable with a camera in the stall at 4am. Confirmed family will appear.",
        outcome: "advance",
      },
      {
        date: "02 Jul",
        duration: "25 min",
        interviewer: "EP",
        summary: "Story lock alignment — agreed to close on the last bowl of the day as the ending beat.",
        outcome: "advance",
      },
    ],
  },
  {
    id: "rosa-bianchi",
    name: "Rosa Bianchi",
    craft: "Chef",
    location: "Bologna, Italy",
    sourcedBy: "SP",
    sourcedOn: "02 May",
    sourcedVia: "Agent referral",
    contact: "via agent",
    approval: "approved",
    episodes: ["ep-05-nonna-rosa"],
    storyFit: {
      score: 4,
      note: "Gnocchi as a weekly family summons. Strong verbal storyteller; agent involvement adds a scheduling layer.",
      risk: "Agent requires 10-day notice for any reshoot.",
    },
    calls: [
      {
        date: "09 May",
        duration: "35 min",
        interviewer: "SP",
        summary: "Discovery call via agent. Kitchen is small — flagged early for DP blocking.",
        outcome: "advance",
      },
    ],
  },
  {
    id: "amadou-diop",
    name: "Amadou Diop",
    craft: "Chef",
    location: "Dakar, Senegal",
    sourcedBy: "SP",
    sourcedOn: "21 Apr",
    sourcedVia: "Referral — Awa Sy",
    contact: "via SP",
    approval: "approved",
    episodes: ["ep-dakar-teranga"],
    storyFit: {
      score: 5,
      note: "Frames the communal table as resistance. The clearest thesis of any talent in the bank.",
      risk: "Episode logistics stalled on DP visa — talent availability window closes in Nov.",
    },
    calls: [
      {
        date: "28 Apr",
        duration: "51 min",
        interviewer: "EP",
        summary: "Long call. Articulate, political, generous. Volunteered access to the Sunday table.",
        outcome: "advance",
      },
    ],
  },
  {
    id: "dona-marcelina",
    name: "Doña Marcelina",
    craft: "Chef candidate",
    location: "Oaxaca, Mexico",
    sourcedBy: "SP",
    sourcedOn: "11 Jul",
    sourcedVia: "Market scout",
    contact: "via SP",
    approval: "in-review",
    episodes: ["ep-06-masa-oaxaca"],
    storyFit: {
      score: 4,
      note: "Nixtamal from her grandmother's ratio. Quiet on camera — needs an observational treatment rather than interview-led.",
      risk: "Shy in the test call; may need a second visit before committing.",
    },
    calls: [
      {
        date: "16 Jul",
        duration: "28 min",
        interviewer: "SP",
        summary: "Reserved but willing. Best material came after the recorder stopped — good sign for verité.",
        outcome: "hold",
      },
    ],
  },
  {
    id: "rufina-lopez",
    name: "Rufina López",
    craft: "Chef candidate",
    location: "Teotitlán, Mexico",
    sourcedBy: "SP",
    sourcedOn: "19 Jul",
    sourcedVia: "Weaver co-op contact",
    contact: "via SP",
    approval: "call-scheduled",
    episodes: ["ep-06-masa-oaxaca"],
    storyFit: {
      score: 3,
      note: "Strong location, thinner narrative. Would work as a B-strand if Marcelina carries the episode.",
    },
    calls: [
      {
        date: "31 Jul",
        duration: "scheduled · 30 min",
        interviewer: "SP",
        summary: "Discovery call pending — third candidate, blocking the shortlist.",
        outcome: "hold",
      },
    ],
  },
  {
    id: "maria-alves",
    name: "Maria Alves",
    craft: "Chef",
    location: "Lisbon, Portugal",
    sourcedBy: "PR",
    sourcedOn: "03 Jun",
    sourcedVia: "Instagram — tasca account",
    contact: "confirmed",
    approval: "approved",
    episodes: ["ep-08-marias-bacalhau"],
    storyFit: {
      score: 4,
      note: "365 ways to cook bacalhau, one for grief. Ties food to memory without prompting.",
    },
    calls: [
      {
        date: "07 Jun",
        duration: "38 min",
        interviewer: "PR",
        summary: "Open, funny, fluent in English. Confirmed access to the salt cod supplier for a second location.",
        outcome: "advance",
      },
    ],
  },
  {
    id: "kenji-arai",
    name: "Kenji Arai",
    craft: "Translator — Ainu",
    location: "Sapporo, Japan",
    sourcedBy: "PR",
    sourcedOn: "24 Jul",
    sourcedVia: "Hokkaido University contact",
    contact: "pending intro",
    approval: "sourced",
    episodes: ["ep-07-ainu-kitchen"],
    storyFit: {
      score: 3,
      note: "Academic rather than cultural insider — useful for accuracy, not for access. Keep sourcing in parallel.",
      risk: "No Ainu-speaking translator confirmed; episode cannot leave Sourcing.",
    },
    calls: [],
  },
  {
    id: "yassine-el-amrani",
    name: "Yassine El Amrani",
    craft: "Chef",
    location: "Marrakech, Morocco",
    sourcedBy: "SP",
    sourcedOn: "02 Feb",
    sourcedVia: "Souk walk-up",
    contact: "wrapped",
    approval: "approved",
    episodes: ["ep-03-tagine-marrakech"],
    storyFit: {
      score: 5,
      note: "Third-generation tagine stall inside the souk. Shot and delivered — reference talent for future markets.",
    },
    calls: [
      {
        date: "09 Feb",
        duration: "33 min",
        interviewer: "PR",
        summary: "Immediate yes. Offered the pre-dawn coal lighting as an opening sequence.",
        outcome: "advance",
      },
    ],
  },
  {
    id: "gustavo-neri",
    name: "Gustavo Neri",
    craft: "Chef candidate",
    location: "Mexico City, Mexico",
    sourcedBy: "SP",
    sourcedOn: "06 Jul",
    sourcedVia: "Press feature",
    contact: "via publicist",
    approval: "passed",
    episodes: ["ep-06-masa-oaxaca"],
    storyFit: {
      score: 2,
      note: "Polished, press-trained, already covered widely. Wrong register for the channel — passed after one call.",
    },
    calls: [
      {
        date: "12 Jul",
        duration: "22 min",
        interviewer: "SP",
        summary: "Answers felt rehearsed. No personal stake in the dish beyond the restaurant.",
        outcome: "pass",
      },
    ],
  },
];

export function getTalent(id: string): TalentProfile | undefined {
  return TALENT.find((t) => t.id === id);
}

export function episodeTitle(slug: string): string {
  return EPISODES.find((e) => e.slug === slug)?.title ?? slug;
}

export function episodeCode(slug: string): string {
  return EPISODES.find((e) => e.slug === slug)?.code ?? "—";
}

export function talentForEpisode(slug: string): TalentProfile[] {
  return TALENT.filter((t) => t.episodes.includes(slug));
}

export function countByApproval(status: ApprovalStatus): number {
  return TALENT.filter((t) => t.approval === status).length;
}
