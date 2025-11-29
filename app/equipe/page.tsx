import { getMembers } from "@/lib/actions/members";
import { MemberList } from "@/components/member-list";

export default async function EquipePage() {
  const result = await getMembers();
  const members = result.success && result.data ? result.data : [];

  return (
    <div className="p-6 lg:p-8">
      <MemberList members={members} />
    </div>
  );
}

