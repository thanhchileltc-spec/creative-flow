import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/ui/platform";

export const Route = createFileRoute("/crew")({
  head: () => ({
    meta: [
      { title: "Crew Directory — ALICE Production Platform" },
      { name: "description", content: "Crew Directory workspace for Meals That Matter." },
      { property: "og:title", content: "Crew Directory — ALICE Production Platform" },
      { property: "og:description", content: "Crew Directory workspace for Meals That Matter." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CrewDirectoryPage,
});

function CrewDirectoryPage() {
  return (
    <PageContainer className="pb-24">
      <PageHeader eyebrow="Meals That Matter" title="Crew Directory" lede="Not supplied yet. This workspace is next in the build order." />
    </PageContainer>
  );
}
