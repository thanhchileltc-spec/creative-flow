import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/ui/platform";

export const Route = createFileRoute("/publish")({
  head: () => ({
    meta: [
      { title: "Publish — ALICE Production Platform" },
      { name: "description", content: "Publish workspace for Meals That Matter." },
      { property: "og:title", content: "Publish — ALICE Production Platform" },
      { property: "og:description", content: "Publish workspace for Meals That Matter." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PublishPage,
});

function PublishPage() {
  return (
    <PageContainer className="pb-24">
      <PageHeader eyebrow="Meals That Matter" title="Publish" lede="Not supplied yet. This workspace is next in the build order." />
    </PageContainer>
  );
}
