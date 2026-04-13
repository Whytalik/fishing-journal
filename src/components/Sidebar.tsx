import { auth } from "@/auth";
import SidebarClient from "./SidebarClient";

export default async function Sidebar() {
  const session = await auth();

  return (
    <aside className="hidden md:flex flex-col w-60 bg-n-surface border-r border-n-border h-full">
      <SidebarClient session={session} />
    </aside>
  );
}
