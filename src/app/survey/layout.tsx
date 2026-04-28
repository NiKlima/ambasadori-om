import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function SurveyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="bg-[var(--om-ink-50)]" style={{ minHeight: "calc(100vh - 72px)" }}>{children}</main>
      <SiteFooter />
    </>
  );
}
