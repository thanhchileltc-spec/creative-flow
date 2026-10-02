import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/ui/platform";

export const Route = createFileRoute("/budget")({
  head: () => ({
    meta: [
      { title: "Budget — ALICE Production Platform" },
      { name: "description", content: "Budget workspace for Meals That Matter." },
      { property: "og:title", content: "Budget — ALICE Production Platform" },
      { property: "og:description", content: "Budget workspace for Meals That Matter." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BudgetPage,
});

function BudgetPage() {
  return (
    <PageContainer className="pb-24">
      <PageHeader eyebrow="Meals That Matter" title="Budget" lede="Not supplied yet. This workspace is next in the build order." />
    </PageContainer>
  );
}
