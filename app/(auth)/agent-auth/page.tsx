"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, AlertCircle, ShieldCheck } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useAuth } from "@/hooks/useAuth";

export default function AgentAuthPage() {
  const router = useRouter();
  const { setLoginSession } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (user: any, nameToSave?: string, isNewUser?: boolean) => {
    try {
      if (!isNewUser) {
        // Just verify session status
        const token = await user.getIdToken();
        const res = await fetch("/api/auth/session", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          if (!data.success) {
            throw new Error(data.error ? `${data.message}: ${data.error}` : (data.message || "Account not approved"));
          }
        } else {
          const text = await res.text();
          console.error("Non-JSON response:", text);
          // Strip out some HTML tags to make it readable in the UI
          const readableError = text.replace(/<[^>]*>?/gm, '').trim().substring(0, 100);
          throw new Error(`Vercel Server Error: ${res.status} - ${readableError}`);
        }
      }
      setLoginSession();
      router.push("/");
    } catch (err: any) {
      auth?.signOut();
      let msg = err.message || "Failed to login. Account may not be approved.";
      if (msg.includes("Firebase")) msg = "Invalid credentials or account does not exist.";
      setError(msg);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setError("Firebase not configured");
      return;
    }
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        await handleSuccess(userCred.user, undefined, false);
      } else {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, fullName: name, role: "agent" })
        });
        const data = await res.json();
        
        if (!data.success) {
          throw new Error(data.message || "Signup failed");
        }
        
        setError("Agent signup successful! Please wait for admin approval before logging in.");
        setIsLogin(true); // Switch to login screen
      }
    } catch (err: any) {
      let msg = err.message || "An error occurred";
      if (msg.includes("Firebase")) msg = "Invalid credentials or account does not exist.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) {
      setError("Firebase not configured");
      return;
    }
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth, provider);
      
      // Sync user with Firestore (passing role=agent)
      const token = await userCred.user.getIdToken();
      await fetch("/api/auth/oauth", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ role: "agent" })
      });

      await handleSuccess(userCred.user, undefined, false);
    } catch (err: any) {
      let msg = err.message || "Failed to sign in with Google";
      if (msg.includes("Firebase")) msg = "Failed to sign in. Please try again.";
      setError(msg);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-md bg-background/80 backdrop-blur-2xl border border-primary/30 p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-primary" />

      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {isLogin ? "Agent Portal" : "Agent Registration"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isLogin
            ? "Sign in to access your agent dashboard and exclusive rates"
            : "Register as an agent to get 20% off all bookings"}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-200 leading-tight">{error}</p>
        </div>
      )}

      <form onSubmit={handleEmailAuth} className="space-y-4">
        {!isLogin && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-background border border-border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="John Doe"
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-background border border-border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="agent@example.com"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-background border border-border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl py-3.5 transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 mt-2 disabled:opacity-70 disabled:pointer-events-none"
        >
          {loading ? "Processing..." : isLogin ? "Sign In" : "Register as Agent"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px bg-border flex-1" />
        <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Or continue with</span>
        <div className="h-px bg-border flex-1" />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={handleGoogleSignIn}
          type="button"
          className="flex items-center justify-center gap-2 bg-background border border-border text-foreground rounded-xl py-3 font-semibold hover:bg-muted transition-colors shadow-sm text-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {isLogin ? "Sign in with Google" : "Register with Google"}
        </button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-muted-foreground text-sm">
          {isLogin ? "Not an agent yet?" : "Already registered as an agent?"}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="ml-2 text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            {isLogin ? "Apply Now" : "Sign In"}
          </button>
        </p>
      </div>
    </motion.div>
  );
}
