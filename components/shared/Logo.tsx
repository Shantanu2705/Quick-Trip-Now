import Link from "next/link";

export function Logo({ className = "", variant = "default" }: { className?: string, variant?: "default" | "bare" }) {
  if (variant === "bare") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <img 
          src="/images/logo_transparent.png" 
          alt="Quick Trip Now Logo" 
          className="object-contain w-full h-full drop-shadow-md" 
        />
      </div>
    );
  }

  return (
    <Link href="/" className={`flex items-center group ${className}`}>
      <div className="relative h-20 w-72 hover:scale-105 transition-transform duration-300 flex items-center justify-center">
        <img 
          src="/images/logo_transparent.png" 
          alt="Quick Trip Now Logo" 
          className="object-contain w-full h-full drop-shadow-md" 
        />
      </div>
    </Link>
  );
}
