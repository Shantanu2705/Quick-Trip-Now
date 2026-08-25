"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, Mail, Lock, ShieldAlert, CheckCircle } from "lucide-react";

export default function UserProfilePage() {
  const { user, userData: authUserData } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    newPassword: ""
  });

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setProfile(data.data);
          setFormData({
            fullName: data.data.fullName || "",
            phone: data.data.phone || "",
            newPassword: ""
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    
    if (formData.newPassword && formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      setSaving(false);
      return;
    }

    try {
      if (!user) return;
      const token = await user.getIdToken();
      
      const payload: any = {
        fullName: formData.fullName,
        phone: formData.phone
      };

      if (formData.newPassword) {
        payload.newPassword = formData.newPassword;
      }

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        setSuccess("Profile updated successfully!");
        setFormData(prev => ({ ...prev, newPassword: "" })); // Clear password field
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  const isAgent = profile?.role === 'agent';

  return (
    <div className="space-y-8 max-w-3xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal details and account security.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm flex items-start gap-2">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-sm flex items-start gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/20 border-b border-border/50 pb-6 pt-8 px-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <User className="w-8 h-8" />
            </div>
            <div>
              <CardTitle className="text-2xl mb-1">{profile?.fullName || "User"}</CardTitle>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <span className="capitalize font-medium text-foreground">{profile?.role} Account</span>
                •
                <span>Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'recently'}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-lg font-bold font-heading mb-4">Personal Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      value={formData.fullName} 
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                      className="w-full bg-muted/30 border border-border rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-primary transition-all"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email (Cannot be changed)</label>
                  <div className="relative opacity-70">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="email" 
                      value={profile?.email || ""} 
                      disabled
                      className="w-full bg-muted/50 border border-border rounded-xl py-2.5 pl-10 pr-4 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="tel" 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-muted/30 border border-border rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-primary transition-all"
                      placeholder="e.g. 7047399677"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-border/50 my-8 w-full" />

            <div className="space-y-4">
              <h3 className="text-lg font-bold font-heading mb-4">Security</h3>
              
              {isAgent ? (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-800 dark:text-amber-500 mb-1">Agent Security Policy</h4>
                    <p className="text-sm text-amber-700/80 dark:text-amber-400/80">
                      For security and auditing purposes, agent accounts cannot change their passwords directly. If you need to update your password, please contact the administrator.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 max-w-md">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Change Password</label>
                  <p className="text-xs text-muted-foreground mb-2">Leave blank if you don't want to change your password.</p>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      value={formData.newPassword} 
                      onChange={e => setFormData({...formData, newPassword: e.target.value})}
                      className="w-full bg-muted/30 border border-border rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-primary transition-all"
                      placeholder="Enter new password (min 6 chars)"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl px-8 py-3 transition-all disabled:opacity-70 flex items-center justify-center min-w-[200px]"
              >
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
            
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
