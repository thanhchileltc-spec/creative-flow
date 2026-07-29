import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Pipeline,
});

const STAGES = [
  "Sourcing",
  "Discovery",
  "Story Lock",
  "Logistics",
  "PPM",
  "Shoot",
  "Post",
  "Publish",
] as const;

type Role = "EP" | "PR" | "SP" | "DP" | "ED";

type Episode = {
  code: string;
  location: string;
  title: string;
  meta: string;
  stageIndex: number; // 1-based column
  stageLabel: string;
  status: "normal" | "active" | "blocked" | "idle";
  roles: Role[];
  delay: number;
};

const EPISODES: Episode[] = [
  {
    code: "Ep. 04",
    location: "Hanoi, Vietnam",
    title: "Bà Hạnh’s phở stall",
    meta: "Paired with: Morning Market (Day 4)",
    stageIndex: 7,
    stageLabel: "Review Cut",
    status: "active",
    roles: ["PR", "ED"],
    delay: 100,
  },
  {
    code: "Ep. 05",
    location: "Bologna, Italy",
    title: "Nonna Rosa’s Gnocchi",
    meta: "Shoot Day 1 of 2 — Wrap 22:00",
    stageIndex: 6,
    stageLabel: "On Location",
    status: "normal",
    roles: ["DP"],
    delay: 150,
  },
  {
    code: "! Blocked / Action Required",
    location: "Dakar, Senegal",
    title: "Chef Amadou’s Teranga",
    meta: "Dakar, Senegal • Logistics stalled",
    stageIndex: 4,
    stageLabel: "Visa Delay",
    status: "blocked",
    roles: ["EP", "PR", "SP"],
    delay: 200,
  },
  {
    code: "Ep. 06",
    location: "Oaxaca, Mexico",
    title: "The Masa of Oaxaca",
    meta: "Discovery • Pre-interviewing talent",
    stageIndex: 2,
    stageLabel: "In Scouting",
    status: "idle",
    roles: ["SP"],
    delay: 250,
  },
  {
    code: "Ep. 07",
    location: "Hokkaido, Japan",
    title: "Sourcing the Ainu Kitchen",
    meta: "Sourcing • Translator needed",
    stageIndex: 1,
    stageLabel: "",
    status: "idle",
    roles: ["PR"],
    delay: 300,
  },
  {
    code: "Ep. 08",
    location: "Lisbon, Portugal",
    title: "Maria’s Bacalhau",
    meta: "Paired with: The Masa of Oaxaca (Day 6)",
    stageIndex: 5,
    stageLabel: "PPM Fri",
    status: "normal",
    roles: ["EP", "PR", "DP"],
    delay: 350,
  },
  {
    code: "Ep. 03",
    location: "Marrakech, Morocco",
    title: "Tagine at the Souk",
    meta: "Edit in progress — Assembly locked",
    stageIndex: 7,
    stageLabel: "LUT pending",
    status: "normal",
    roles: ["ED"],
    delay: 400,
  },
  {
    code: "Ep. 02",
    location: "Seoul, South Korea",
    title: "Halmeoni’s Doenjang Jjigae",
    meta: "Published — Content calendar active",
    stageIndex: 8,
    stageLabel: "Live",
    status: "normal",
    roles: ["ED"],
    delay: 450,
  },
];

function Avatar({ role }: { role: Role }) {
  const shades: Record<Role, string> = {
    EP: "bg-stone-500 text-background",
    PR: "bg-stone-400 text-background",
    SP: "bg-stone-300 text-foreground",
    DP: "bg-stone-600 text-background",
    ED: "bg-stone-700 text-background",
  };
  return (
    <div
      className={`size-6 rounded-full border border-background flex items-center justify-center text-[8px] font-mono font-medium ${shades[role]}`}
      title={role}
    >
      {role}
    </div>
  );
}

function StageMarker({ status, label }: { status: Episode["status"]; label: string }) {
  const dot =
    status === "blocked"
      ? "bg-accent rotate-45 ring-4 ring-accent/20"
      : status === "active"
        ? "rounded-full bg-accent ring-4 ring-accent/10"
        : status === "idle"
          ? "rounded-full bg-foreground/30"
          : "rounded-full bg-foreground ring-4 ring-foreground/5";
  const labelColor =
    status === "blocked" ? "text-accent font-bold" : "text-muted-foreground";
  return (
    <div className="flex flex-col items-center relative">
      <div className={`size-3 ${dot}`} />
      {label ? (
        <span
          className={`absolute top-[65%] mt-1 whitespace-nowrap text-[9px] font-mono uppercase tracking-tighter ${labelColor}`}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}

function EpisodeRow({ ep }: { ep: Episode }) {
  const isBlocked = ep.status === "blocked";
  const rowBg = isBlocked
    ? "bg-accent/[0.02] hover:bg-accent/[0.04]"
    : "hover:bg-black/[0.02]";
  const line = isBlocked ? "bg-accent/20" : "bg-border";

  return (
    <div
      className={`group grid grid-cols-[320px_1fr] border-b border-border ${rowBg} transition-colors duration-500 animate-reveal`}
      style={{ animationDelay: `${ep.delay}ms` }}
    >
      <div className="py-6 pr-8">
        <div className="flex items-start justify-between">
          <div>
            <span
              className={`text-[9px] font-mono mb-1 block uppercase tracking-tighter ${
                isBlocked ? "text-accent italic font-bold" : "text-muted-foreground"
              }`}
            >
              {isBlocked ? ep.code : `${ep.code} • ${ep.location}`}
            </span>
            <h3 className="font-display text-xl group-hover:text-accent transition-colors">
              {ep.title}
            </h3>
            <p className="text-[11px] italic text-muted-foreground mt-1">{ep.meta}</p>
          </div>
          <div className="flex -space-x-1">
            {ep.roles.map((r, i) => (
              <Avatar key={i} role={r} />
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-8 items-center px-4 relative h-full">
        <div className={`absolute left-4 right-4 h-px top-1/2 -translate-y-1/2 ${line}`} />
        <div className="z-10" style={{ gridColumnStart: ep.stageIndex }}>
          <StageMarker status={ep.status} label={ep.stageLabel} />
        </div>
      </div>
    </div>
  );
}

function Pipeline() {
  const stalled = EPISODES.filter((e) => e.status === "blocked").length;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/10">
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-6 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-12">
          <h1 className="font-display italic text-2xl tracking-tight">
            The Meals That Matter
          </h1>
          <div className="hidden md:flex gap-8 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            <a href="#" className="text-foreground border-b border-foreground pb-1">
              Episodes
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Shoot Days
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Talent Bank
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Team
            </a>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-tighter">
            <span className="text-accent font-bold italic">
              {String(stalled).padStart(2, "0")}
            </span>{" "}
            episodes stalled
          </div>
          <button className="px-5 py-2.5 bg-foreground text-background text-[11px] font-bold uppercase tracking-widest hover:bg-accent transition-colors duration-300">
            New Episode
          </button>
        </div>
      </nav>

      <main className="p-8">
        <div className="grid grid-cols-[320px_1fr] mb-4 items-end">
          <div className="pb-4">
            <h2 className="font-display text-4xl leading-tight">Production Pipeline</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Active cycle — Autumn Series 04
            </p>
          </div>
          <div className="grid grid-cols-8 text-[10px] font-mono font-medium uppercase tracking-widest text-muted-foreground border-b border-border pb-4 px-4">
            {STAGES.map((s) => (
              <div key={s} className="px-2">
                {s}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          {EPISODES.map((ep, i) => (
            <EpisodeRow key={i} ep={ep} />
          ))}
        </div>

        <footer className="mt-12 flex justify-between items-center text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] animate-reveal" style={{ animationDelay: "500ms" }}>
          <div className="flex gap-12">
            <div>
              Production Load: <span className="text-foreground">82%</span>
            </div>
            <div>
              Post-Production Queue: <span className="text-foreground">04 Episodes</span>
            </div>
          </div>
          <div className="text-right italic font-display tracking-normal normal-case">
            Current Local Time: 11:42 AM — Shoot active in Bologna
          </div>
        </footer>
      </main>
    </div>
  );
}
