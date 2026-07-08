import Link from "next/link";
import { Compass } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 group ${className}`}>
      <div className="bg-primary text-primary-foreground p-1.5 rounded-xl group-hover:scale-105 transition-transform duration-300">
        <Compass className="w-6 h-6" />
      </div>
      <span className="font-heading font-bold text-xl tracking-tight">
        <span className="text-primary">QuickTrip</span><span className="text-secondary">Now</span>
      </span>
    </Link>
  );
}
