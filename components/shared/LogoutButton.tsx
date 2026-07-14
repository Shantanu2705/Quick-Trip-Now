"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function LogoutButton() {
  const { signOut } = useAuth();

  return (
    <button onClick={signOut} className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-destructive hover:bg-destructive/10 transition-all font-medium">
      <LogOut className="w-5 h-5" />
      Logout
    </button>
  );
}
