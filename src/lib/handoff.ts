import { EPISODES, getEpisode, type Episode } from "./episodes";

export type ChecklistItem = {
  label: string;
  status: "ready" | "pending" | "missing";
  note?: string;
};

export type TreatmentSection = {
  heading: string;
  body: string;
};

export type DPNote = {
  scene: string;
  lens: string;
  movement: string;
  light: string;
  note?: string;
};

export type TechSpecs = {
  camera: string;
  codec: string;
  resolution: string;
  frameRate: string;
  colorSpace: string;
  lut: string;
  audio: string;
  aspect: string;
  cardCount: number;
  dataSize: string;
  deliveryTo: string;
};

export type Deliverable = {
  label: string;
  spec: string;
  due: string;
};

export type Handoff = {
  slug: string; // episode slug
  editor: string;
  editWindow: string; // "3-day edit · 04–06 Nov"
  status: "ready" | "conditional" | "not-ready";
  director: string;
  dp: string;
  treatment: TreatmentSection[];
  dpNotes: DPNote[];
  tech: TechSpecs;
  deliverables: Deliverable[];
  checklist: ChecklistItem[];
  musicRef?: string;
  narrativeSpine?: string;
};

export const HANDOFFS: Handoff[] = [
  {
    slug: "ep-04-ba-hanh-pho",
    editor: "Dani Ortega",
    editWindow: "3-day edit · 14–16 Oct",
    status: "conditional",
    director: "Chi Le",
    dp: "Tomás Reyes",
    narrativeSpine:
      "Dawn to sell-out. The broth is the clock; the family is the story. Cut on repetition until the final bowl breaks the rhythm.",
    musicRef: "Sparse đàn bầu single notes — no score under the first 90 seconds.",
    treatment: [
      {
        heading: "Intent",
        body: "A portrait of inheritance told through one service. Nothing is explained in voice-over that the hands already say. The audience should feel the hour of the morning before they know the country.",
      },
      {
        heading: "Structure",
        body: "Cold open on the pot at 04:10. Three movements — Fire, Service, Sell-out. Each movement opens wide and closes tight on Bà Hạnh's hands.",
      },
      {
        heading: "Tone",
        body: "Observational, patient, no interview cutaways in the first act. Interview only enters once the queue forms.",
      },
      {
        heading: "Ending",
        body: "Hold on the empty pot for a full four seconds before the card. Resist the urge to trim.",
      },
    ],
    dpNotes: [
      { scene: "Broth / 04:10", lens: "35mm", movement: "Locked-off tripod", light: "Practical only — single bulb", note: "Underexposed by design. Do not lift shadows in grade." },
      { scene: "Prep hands", lens: "50mm macro", movement: "Handheld, braced", light: "Bounce card camera-left" },
      { scene: "Queue exterior", lens: "24mm", movement: "Slow dolly right", light: "Available dawn", note: "Two takes — use take 2, take 1 has a scooter horn." },
      { scene: "Interview", lens: "85mm", movement: "Static", light: "Window key, neg fill", note: "Frame is deliberately loose left for lower-third." },
      { scene: "Empty pot", lens: "35mm", movement: "Locked-off", light: "Practical only" },
    ],
    tech: {
      camera: "Sony FX6 (A) + FX3 (B)",
      codec: "XAVC-I / 10-bit 4:2:2",
      resolution: "4K UHD 3840×2160",
      frameRate: "25p (50p for prep hands only)",
      colorSpace: "S-Log3 / S-Gamut3.Cine",
      lut: "CHI_BASE_v2.cube — show LUT, not baked",
      audio: "Zoom F6 · 32-bit float · 2× lav + boom + ambient stereo",
      aspect: "2.00:1 extraction from 16:9",
      cardCount: 6,
      dataSize: "812 GB",
      deliveryTo: "chi-les/post/ep-04 (Frame.io + LTO backup)",
    },
    deliverables: [
      { label: "Master", spec: "ProRes 422 HQ · 2.00:1 · 25p", due: "17 Oct" },
      { label: "YouTube upload", spec: "H.264 · 4K · 40 Mbps", due: "18 Oct" },
      { label: "Social cutdowns ×5", spec: "9:16 · 1080×1920 · burned captions", due: "20 Oct" },
      { label: "Stills selects", spec: "20× graded JPEG", due: "20 Oct" },
    ],
    checklist: [
      { label: "Footage ingested & verified", status: "ready", note: "6/6 cards checksummed" },
      { label: "Sync maps delivered", status: "ready" },
      { label: "Ambient sound pass", status: "missing", note: "Field recordings not uploaded — blocking assembly notes" },
      { label: "Transcript + translation", status: "ready", note: "Vietnamese → EN, timecoded" },
      { label: "Show LUT applied to proxies", status: "ready" },
      { label: "Music licence cleared", status: "pending", note: "Awaiting publisher confirmation" },
      { label: "Talent release on file", status: "ready" },
    ],
  },
  {
    slug: "ep-03-tagine-marrakech",
    editor: "Dani Ortega",
    editWindow: "3-day edit · wrapped",
    status: "ready",
    director: "Chi Le",
    dp: "Ines Haddad",
    narrativeSpine:
      "Heat and negotiation. The souk sets the tempo; the tagine slows it down.",
    musicRef: "Percussion-forward, drops out entirely in the clay-pot sequence.",
    treatment: [
      { heading: "Intent", body: "Contrast the noise of commerce with the silence of slow cooking. The edit should feel like stepping through a doorway." },
      { heading: "Structure", body: "Souk montage → the walk → the kitchen → the meal. One continuous fall in volume across the episode." },
      { heading: "Tone", body: "Warm, saturated, textural. Lean into grain." },
    ],
    dpNotes: [
      { scene: "Souk montage", lens: "24mm", movement: "Handheld, walking", light: "Available, hard midday", note: "Embrace blown highlights in the awning gaps." },
      { scene: "The walk", lens: "35mm", movement: "Gimbal follow", light: "Available" },
      { scene: "Clay pot", lens: "50mm macro", movement: "Locked-off", light: "Single practical + bounce" },
      { scene: "Shared meal", lens: "35mm", movement: "Slow push", light: "Window key" },
    ],
    tech: {
      camera: "Sony FX6",
      codec: "XAVC-I / 10-bit 4:2:2",
      resolution: "4K UHD 3840×2160",
      frameRate: "25p",
      colorSpace: "S-Log3 / S-Gamut3.Cine",
      lut: "CHI_WARM_v1.cube",
      audio: "Zoom F6 · 32-bit float · boom + ambient stereo",
      aspect: "2.00:1",
      cardCount: 4,
      dataSize: "540 GB",
      deliveryTo: "chi-les/post/ep-03",
    },
    deliverables: [
      { label: "Master", spec: "ProRes 422 HQ · 2.00:1 · 25p", due: "delivered" },
      { label: "Grade references", spec: "12× stills for colorist", due: "Fri" },
      { label: "Social cutdowns ×5", spec: "9:16 · burned captions", due: "next week" },
    ],
    checklist: [
      { label: "Footage ingested & verified", status: "ready" },
      { label: "Assembly locked", status: "ready" },
      { label: "Reference stills for colorist", status: "pending", note: "Due Friday — colorist starts Monday" },
      { label: "Transcript + translation", status: "ready" },
      { label: "Music licence cleared", status: "ready" },
      { label: "Talent release on file", status: "ready" },
    ],
  },
  {
    slug: "ep-05-nonna-rosa",
    editor: "Marta Feddersen",
    editWindow: "3-day edit · 01–03 Aug",
    status: "not-ready",
    director: "Chi Le",
    dp: "Tomás Reyes",
    narrativeSpine:
      "Hands that never measure. The whole episode is the making of one plate, interrupted by a family that will not stop talking.",
    musicRef: "No score in act one. Solo cello from the table scene onward.",
    treatment: [
      { heading: "Intent", body: "Show competence as a form of love. Let the family overlap and talk over each other — do not clean it up." },
      { heading: "Structure", body: "Flour to fork, single day, chronological. Only one flashback beat via photographs." },
      { heading: "Tone", body: "Bright, domestic, noisy." },
    ],
    dpNotes: [
      { scene: "Gnocchi board", lens: "50mm macro", movement: "Overhead rig", light: "Soft top light", note: "Keep the ridges legible — stop down." },
      { scene: "Kitchen wide", lens: "24mm", movement: "Locked-off", light: "Available window" },
      { scene: "Exterior golden hour", lens: "85mm", movement: "Handheld", light: "Backlit", note: "At risk — rain forecast 18:00. Cover shot on Day 2." },
      { scene: "Family table", lens: "35mm", movement: "Handheld float", light: "Practical + bounce" },
    ],
    tech: {
      camera: "Sony FX6 (A) + FX3 (B)",
      codec: "XAVC-I / 10-bit 4:2:2",
      resolution: "4K UHD 3840×2160",
      frameRate: "25p",
      colorSpace: "S-Log3 / S-Gamut3.Cine",
      lut: "CHI_BASE_v2.cube",
      audio: "Zoom F6 · 32-bit float · 3× lav + boom",
      aspect: "2.00:1",
      cardCount: 3,
      dataSize: "410 GB (partial — shoot in progress)",
      deliveryTo: "chi-les/post/ep-05",
    },
    deliverables: [
      { label: "Master", spec: "ProRes 422 HQ · 2.00:1 · 25p", due: "05 Aug" },
      { label: "YouTube upload", spec: "H.264 · 4K", due: "07 Aug" },
      { label: "Social cutdowns ×5", spec: "9:16 · burned captions", due: "09 Aug" },
    ],
    checklist: [
      { label: "Footage ingested & verified", status: "pending", note: "Day 1 only — Day 2 still shooting" },
      { label: "Golden hour exterior captured", status: "missing", note: "Weather-dependent, cover on Day 2" },
      { label: "Sync maps delivered", status: "pending" },
      { label: "Transcript + translation", status: "missing", note: "Italian → EN not ordered yet" },
      { label: "Music licence cleared", status: "pending" },
      { label: "Talent release on file", status: "ready" },
    ],
  },
  {
    slug: "ep-02-halmeoni-doenjang",
    editor: "Marta Feddersen",
    editWindow: "3-day edit · wrapped",
    status: "ready",
    director: "Chi Le",
    dp: "Ines Haddad",
    narrativeSpine: "Fermentation as memory. Time is the co-author.",
    musicRef: "Ambient drone, no melody until the final minute.",
    treatment: [
      { heading: "Intent", body: "A quiet episode about waiting. Nothing dramatic happens and that is the point." },
      { heading: "Structure", body: "Jars → stew → table. Interview woven throughout, not blocked." },
      { heading: "Tone", body: "Cool, still, muted." },
    ],
    dpNotes: [
      { scene: "Jar rooftop", lens: "35mm", movement: "Locked-off", light: "Overcast available" },
      { scene: "Stew close", lens: "50mm macro", movement: "Slow push", light: "Practical" },
      { scene: "Interview", lens: "85mm", movement: "Static", light: "Window key" },
    ],
    tech: {
      camera: "Sony FX3",
      codec: "XAVC-I / 10-bit 4:2:2",
      resolution: "4K UHD 3840×2160",
      frameRate: "25p",
      colorSpace: "S-Log3 / S-Gamut3.Cine",
      lut: "CHI_COOL_v1.cube",
      audio: "Zoom F6 · 32-bit float · lav + boom",
      aspect: "2.00:1",
      cardCount: 3,
      dataSize: "365 GB",
      deliveryTo: "chi-les/post/ep-02",
    },
    deliverables: [
      { label: "Master", spec: "ProRes 422 HQ", due: "delivered" },
      { label: "Social cutdowns ×5", spec: "9:16 · burned captions", due: "3 of 5 queued" },
    ],
    checklist: [
      { label: "Footage ingested & verified", status: "ready" },
      { label: "Master delivered", status: "ready" },
      { label: "Social cutdowns", status: "pending", note: "3 of 5 still queued" },
      { label: "Transcript + translation", status: "ready" },
      { label: "Music licence cleared", status: "ready" },
      { label: "Talent release on file", status: "ready" },
    ],
  },
  {
    slug: "ep-08-marias-bacalhau",
    editor: "Unassigned",
    editWindow: "3-day edit · 18–20 Nov (planned)",
    status: "not-ready",
    director: "Chi Le",
    dp: "Tomás Reyes",
    narrativeSpine: "Salt, water, and a recipe with 365 versions. Pick one and defend it.",
    musicRef: "Fado guitar, used sparingly as punctuation.",
    treatment: [
      { heading: "Intent", body: "Argue for a single version of a national dish through one cook's conviction." },
      { heading: "Structure", body: "Market → soak → kitchen → verdict at the table." },
      { heading: "Tone", body: "Coastal light, blue-grey, salt texture." },
    ],
    dpNotes: [
      { scene: "Market", lens: "24mm", movement: "Handheld", light: "Available" },
      { scene: "Soaking bowls", lens: "50mm macro", movement: "Overhead", light: "Soft top", note: "Shot list section 4 still owned by DP — pending PPM." },
    ],
    tech: {
      camera: "Sony FX6 (A) + FX3 (B)",
      codec: "XAVC-I / 10-bit 4:2:2",
      resolution: "4K UHD 3840×2160",
      frameRate: "25p",
      colorSpace: "S-Log3 / S-Gamut3.Cine",
      lut: "CHI_BASE_v2.cube",
      audio: "Zoom F6 · 32-bit float · 2× lav + boom",
      aspect: "2.00:1",
      cardCount: 0,
      dataSize: "—",
      deliveryTo: "chi-les/post/ep-08",
    },
    deliverables: [
      { label: "Master", spec: "ProRes 422 HQ", due: "22 Nov" },
      { label: "YouTube upload", spec: "H.264 · 4K", due: "24 Nov" },
    ],
    checklist: [
      { label: "PPM deck complete", status: "missing", note: "Section 4 (shot list) outstanding — due Thu EOD" },
      { label: "Editor assigned", status: "missing" },
      { label: "Footage captured", status: "pending", note: "Shoot 14–15 Nov" },
      { label: "Transcript + translation", status: "pending" },
      { label: "Talent release on file", status: "ready" },
    ],
  },
];

export function getHandoff(slug: string): Handoff | undefined {
  return HANDOFFS.find((h) => h.slug === slug);
}

export function handoffEpisode(h: Handoff): Episode | undefined {
  return getEpisode(h.slug);
}

export function readiness(h: Handoff) {
  const total = h.checklist.length;
  const ready = h.checklist.filter((c) => c.status === "ready").length;
  const missing = h.checklist.filter((c) => c.status === "missing");
  const pending = h.checklist.filter((c) => c.status === "pending");
  return {
    total,
    ready,
    missing,
    pending,
    pct: total === 0 ? 0 : Math.round((ready / total) * 100),
    verdict:
      missing.length > 0 ? "not-ready" : pending.length > 0 ? "conditional" : "ready",
  } as const;
}

/** Compiles the full "ready for edit" brief as plain text for copy / handoff. */
export function buildBrief(h: Handoff): string {
  const ep = handoffEpisode(h);
  const r = readiness(h);
  const line = "—".repeat(52);
  const out: string[] = [];

  out.push("READY FOR EDIT — BRIEF");
  out.push(line);
  out.push(`Episode      ${ep ? `${ep.code} · ${ep.title}` : h.slug}`);
  out.push(`Location     ${ep?.location ?? "—"}`);
  out.push(`Director     ${h.director}`);
  out.push(`DP           ${h.dp}`);
  out.push(`Editor       ${h.editor}`);
  out.push(`Edit window  ${h.editWindow}`);
  out.push(`Readiness    ${r.ready}/${r.total} cleared · ${r.verdict.replace("-", " ")}`);
  out.push("");

  if (h.narrativeSpine) {
    out.push("NARRATIVE SPINE");
    out.push(h.narrativeSpine);
    out.push("");
  }

  out.push("DIRECTOR TREATMENT");
  h.treatment.forEach((t) => {
    out.push(`· ${t.heading}`);
    out.push(`  ${t.body}`);
  });
  out.push("");

  out.push("DP NOTES");
  h.dpNotes.forEach((d) => {
    out.push(
      `· ${d.scene} — ${d.lens} · ${d.movement} · ${d.light}${d.note ? `\n  ${d.note}` : ""}`,
    );
  });
  out.push("");

  out.push("TECH SPECS");
  out.push(`Camera       ${h.tech.camera}`);
  out.push(`Codec        ${h.tech.codec}`);
  out.push(`Resolution   ${h.tech.resolution}`);
  out.push(`Frame rate   ${h.tech.frameRate}`);
  out.push(`Colour       ${h.tech.colorSpace}`);
  out.push(`LUT          ${h.tech.lut}`);
  out.push(`Audio        ${h.tech.audio}`);
  out.push(`Aspect       ${h.tech.aspect}`);
  out.push(`Media        ${h.tech.cardCount} cards · ${h.tech.dataSize}`);
  out.push(`Delivery to  ${h.tech.deliveryTo}`);
  out.push("");

  if (h.musicRef) {
    out.push("MUSIC REFERENCE");
    out.push(h.musicRef);
    out.push("");
  }

  out.push("DELIVERABLES");
  h.deliverables.forEach((d) => out.push(`· ${d.label} — ${d.spec} — due ${d.due}`));
  out.push("");

  out.push("OUTSTANDING BEFORE EDIT STARTS");
  const open = [...r.missing, ...r.pending];
  if (open.length === 0) out.push("Nothing outstanding. Cleared to cut.");
  open.forEach((c) =>
    out.push(`· [${c.status.toUpperCase()}] ${c.label}${c.note ? ` — ${c.note}` : ""}`),
  );
  out.push("");
  out.push(line);
  out.push("Chi Les — production operating system");

  return out.join("\n");
}

/** Handoffs ordered by how close they are to the edit room. */
export function handoffsInOrder(): Handoff[] {
  const order = new Map(EPISODES.map((e, i) => [e.slug, i]));
  return [...HANDOFFS].sort(
    (a, b) => (order.get(a.slug) ?? 99) - (order.get(b.slug) ?? 99),
  );
}
