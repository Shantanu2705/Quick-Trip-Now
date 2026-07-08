import { Plus, Search, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_PACKAGES = [
  { id: 1, title: "North Sikkim 3 Days Package", category: "Shared Tour", price: 4000, status: "Active" },
  { id: 2, title: "Nathula Pass Day Trip", category: "Private Tour", price: 1200, status: "Active" },
  { id: 3, title: "Complete Sikkim Expedition", category: "Package", price: 15500, status: "Draft" },
];

export default function AdminPackagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Packages</h1>
          <p className="text-muted-foreground mt-1">Manage all your travel packages, tours, and services.</p>
        </div>
        <Button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Package
        </Button>
      </div>

      <div className="bg-background border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 flex flex-col md:flex-row items-center gap-4 justify-between bg-muted/10">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search packages..." 
              className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select className="bg-background border border-input rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer appearance-none">
              <option>All Categories</option>
              <option>Shared Tours</option>
              <option>Private Tours</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Package Name</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Category</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Price (Base)</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PACKAGES.map((pkg) => (
                <tr key={pkg.id} className="border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{pkg.title}</td>
                  <td className="px-6 py-4 text-muted-foreground">{pkg.category}</td>
                  <td className="px-6 py-4 font-bold">₹{pkg.price}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      pkg.status === "Active" 
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" 
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}>
                      {pkg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-muted/50 rounded-lg text-muted-foreground hover:text-primary transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
