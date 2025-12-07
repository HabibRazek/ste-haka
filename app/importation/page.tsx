import { getImportContacts, getImportProcedures, getImportStats } from "@/lib/actions/imports";
import { ImportList } from "@/components/import-list";

export default async function ImportationPage() {
  const [contactsResult, proceduresResult, statsResult] = await Promise.all([
    getImportContacts(),
    getImportProcedures(),
    getImportStats(),
  ]);

  const contacts = contactsResult.success ? contactsResult.data || [] : [];
  const procedures = proceduresResult.success ? proceduresResult.data || [] : [];
  const stats = statsResult.success ? statsResult.data ?? null : null;

  return (
    <ImportList
      initialContacts={contacts}
      initialProcedures={procedures}
      initialStats={stats}
    />
  );
}

