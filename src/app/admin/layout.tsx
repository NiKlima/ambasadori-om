import { AdminTopBar } from "@/components/AdminTopBar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--om-ink-50)]">
      <AdminTopBar />
      <main className="container-om" style={{ paddingTop: 48, paddingBottom: 80 }}>{children}</main>
    </div>
  );
}
