import { ReactNode } from "react";
import { Sparkles } from "lucide-react";

export default function GenericPage({ title, description }: { title: string, description: string }) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden bg-white mt-20">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>
      
      <div className="relative z-10 text-center max-w-2xl px-4">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">{title}</h1>
        <p className="text-lg text-muted-foreground mb-8">{description}</p>
        
        <div className="p-8 bg-background/50 backdrop-blur-md border border-border rounded-3xl shadow-xl">
          <p className="text-muted-foreground font-medium">This page is currently under construction. Please check back soon!</p>
        </div>
      </div>
    </div>
  );
}
