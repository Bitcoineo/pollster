export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="mx-auto max-w-3xl px-6 py-10">{children}</div>;
}
