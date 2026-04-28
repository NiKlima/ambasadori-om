import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DashboardSubnav } from "@/components/DashboardSubnav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <DashboardSubnav />
      <main className="bg-[var(--om-ink-50)] min-h-[calc(100vh-72px-49px)]">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
