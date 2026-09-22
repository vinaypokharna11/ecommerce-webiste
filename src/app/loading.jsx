export default function AppLoading() {
  return (
    <div className="min-h-screen bg-[#FBFBFD] w-full flex flex-col items-center justify-start pt-24 px-4 sm:px-8">
      <div className="w-full max-w-7xl animate-pulse space-y-8">
        <div className="h-10 bg-neutral-200/70 rounded-2xl w-56" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-3xl border border-black/5 p-4 space-y-4 shadow-xs">
              <div className="aspect-square bg-neutral-100 rounded-2xl" />
              <div className="h-4 bg-neutral-100 rounded-md w-3/4" />
              <div className="h-4 bg-neutral-100 rounded-md w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
