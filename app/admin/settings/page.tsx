"use client";

import { useState, useEffect } from "react";
import { Settings, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    siteName: "",
    contactEmail: "",
    contactPhone: "",
    taxRate: 18,
    agentRegistrationEnabled: true,
    maintenanceMode: false,
    globalMaxChildAge: 12
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const authModule = await import("@/lib/firebase");
      const currentUser = authModule.auth?.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      
      const res = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    
    try {
      const authModule = await import("@/lib/firebase");
      const currentUser = authModule.auth?.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(settings)
      });
      
      const data = await res.json();
      if (data.success) {
        setStatus({ type: 'success', message: "Settings saved successfully!" });
        setTimeout(() => setStatus(null), 3000);
      } else {
        setStatus({ type: 'error', message: data.message || "Failed to save settings." });
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || "An error occurred." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            Platform Settings
          </h1>
          <p className="text-muted-foreground">Manage global configuration for Quick Trip Now.</p>
        </div>
      </div>

      {status && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="font-medium">{status.message}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-primary" />
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>Basic details about the platform displayed to users.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Platform Name</label>
              <input 
                type="text" required 
                value={settings.siteName} onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                className="w-full bg-muted/30 border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary transition-all max-w-md block"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Contact Email</label>
                <input 
                  type="email" required 
                  value={settings.contactEmail} onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                  className="w-full bg-muted/30 border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Contact Phone</label>
                <input 
                  type="text" required 
                  value={settings.contactPhone} onChange={(e) => setSettings({...settings, contactPhone: e.target.value})}
                  className="w-full bg-muted/30 border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-secondary" />
          <CardHeader>
            <CardTitle>Booking & Taxes</CardTitle>
            <CardDescription>Configure global booking variables.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 max-w-[200px]">
                <label className="text-sm font-semibold text-foreground">Tax Rate / GST (%)</label>
                <div className="relative">
                  <input 
                    type="number" min="0" max="100" required 
                    value={settings.taxRate} onChange={(e) => setSettings({...settings, taxRate: parseFloat(e.target.value) || 0})}
                    className="w-full bg-muted/30 border border-border rounded-xl py-2.5 pl-4 pr-10 focus:outline-none focus:border-primary transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">%</span>
                </div>
              </div>
              <div className="space-y-2 max-w-[200px]">
                <label className="text-sm font-semibold text-foreground">Global Max Child Age</label>
                <input 
                  type="number" min="1" max="18" required 
                  value={settings.globalMaxChildAge} onChange={(e) => setSettings({...settings, globalMaxChildAge: parseInt(e.target.value, 10) || 12})}
                  className="w-full bg-muted/30 border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-amber-500" />
          <CardHeader>
            <CardTitle>Platform Controls</CardTitle>
            <CardDescription>Enable or disable critical platform features.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/10">
              <div className="space-y-1">
                <h4 className="font-semibold text-foreground">Agent Registrations</h4>
                <p className="text-sm text-muted-foreground">Allow new travel agents to register via the Agent Portal.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.agentRegistrationEnabled}
                  onChange={(e) => setSettings({...settings, agentRegistrationEnabled: e.target.checked})}
                />
                <div className="w-14 h-7 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/10">
              <div className="space-y-1">
                <h4 className="font-semibold text-foreground">Maintenance Mode</h4>
                <p className="text-sm text-muted-foreground">Temporarily disable customer bookings (admin access remains active).</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                />
                <div className="w-14 h-7 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" disabled={saving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl px-8 py-3 transition-all disabled:opacity-70 flex items-center gap-2 shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Save className="w-5 h-5" />
            {saving ? "Saving Changes..." : "Save Configuration"}
          </button>
        </div>
      </form>
    </div>
  );
}
