import { getSpecies } from "@/app/actions/speciesActions";
import SpeciesManager from "@/components/SpeciesManager";

export default async function SpeciesPage() {
  const species = await getSpecies();

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-n-text">Види риб</h1>
        <p className="text-sm text-n-muted">Налаштуйте свій список видів риб для швидкого логування уловів</p>
      </div>

      <section className="bg-n-surface border border-n-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-n-border bg-n-hover">
          <h2 className="text-sm font-bold text-n-text uppercase tracking-wider">Ваші види</h2>
        </div>
        <div className="p-6">
          <SpeciesManager initialSpecies={species} />
        </div>
      </section>
    </div>
  );
}
