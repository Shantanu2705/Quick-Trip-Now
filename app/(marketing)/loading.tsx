export default function Loading() {
  return (
    <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-medium animate-pulse">Loading amazing experiences...</p>
      </div>
    </div>
  );
}
