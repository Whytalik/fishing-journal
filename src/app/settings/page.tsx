import { getSpecies } from "@/app/actions/speciesActions";
import SpeciesManager from "@/components/SpeciesManager";

export default async function SettingsPage() {
  const species = await getSpecies();

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-n-text">Settings</h1>
        <p className="text-sm text-n-muted">Manage your fishing preferences and configuration</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Species Management Section */}
        <section className="bg-n-surface border border-n-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-n-border bg-n-hover">
            <h2 className="text-sm font-bold text-n-text uppercase tracking-wider">Fish Species List</h2>
            <p className="text-xs text-n-muted mt-1">Add or remove fish species for your catch counter</p>
          </div>
          <div className="p-6">
            <SpeciesManager initialSpecies={species} />
          </div>
        </section>

        {/* General Config - Placeholder for future settings */}
        <section className="bg-n-surface border border-n-border rounded-xl overflow-hidden opacity-60">
          <div className="px-6 py-4 border-b border-n-border bg-n-hover">
            <h2 className="text-sm font-bold text-n-text uppercase tracking-wider">General Configuration</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-n-border last:border-0">
              <div>
                <p className="text-sm font-medium text-n-text">Measurement Units</p>
                <p className="text-xs text-n-muted">Metric (kg, cm)</p>
              </div>
              <span className="text-xs font-mono text-n-accent bg-n-accent/10 px-2 py-1 rounded">DEFAULT</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-n-border last:border-0">
              <div>
                <p className="text-sm font-medium text-n-text">Time Format</p>
                <p className="text-xs text-n-muted">24-hour clock</p>
              </div>
              <span className="text-xs font-mono text-n-accent bg-n-accent/10 px-2 py-1 rounded">DEFAULT</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
