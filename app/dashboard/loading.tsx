export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-9 w-36 rounded-xl bg-card-border" />
        <div className="h-11 w-32 rounded-full bg-card-border" />
      </div>
      <div className="mt-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-card-border bg-card p-5"
          >
            <div className="h-5 w-3/4 rounded-lg bg-card-border" />
            <div className="mt-3 h-4 w-1/3 rounded-lg bg-card-border" />
          </div>
        ))}
      </div>
    </div>
  );
}
