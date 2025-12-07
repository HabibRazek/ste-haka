import { ComptabiliteList } from "@/components/comptabilite-list";
import { getDocuments, getDeclarations, getCharges, getExercices, getComptabiliteStats } from "@/lib/actions/comptabilite";

export default async function ComptabilitePage() {
  const [documents, declarations, charges, exercices, stats] = await Promise.all([
    getDocuments(),
    getDeclarations(),
    getCharges(),
    getExercices(),
    getComptabiliteStats(),
  ]);

  return (
    <div className="p-6">
      <ComptabiliteList
        documents={documents}
        declarations={declarations}
        charges={charges}
        exercices={exercices}
        stats={stats}
      />
    </div>
  );
}

