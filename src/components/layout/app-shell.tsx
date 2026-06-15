import { AppSidebar } from "@/components/layout/app-sidebar";
import { getSession } from "@/lib/auth/session";
import { isLocalMode } from "@/lib/config/mode";
import { LocalModeBanner } from "@/components/local/local-mode-banner";
import {
  getActiveBusinessAccess,
  getPendingBusinessInviteCount,
} from "@/lib/data/business-access";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  const local = isLocalMode();
  const [access, pendingInvitesCount] = await Promise.all([
    getActiveBusinessAccess(),
    getPendingBusinessInviteCount(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      {local ? <LocalModeBanner /> : null}
      <div className="flex min-h-0 flex-1">
        <AppSidebar
          email={user?.email}
          projectName={access?.businessName}
          projectRole={access?.role}
          pendingInvitesCount={pendingInvitesCount}
        />
        <div className="min-w-0 flex-1 overflow-auto bg-background">
          <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
