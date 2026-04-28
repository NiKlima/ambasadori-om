import { AdminTopBar } from "@/components/AdminTopBar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--om-ink-50)]">
      <AdminTopBar />
      <main className="container-om py-10">{children}</main>
    </div>
  );
}
