import { useState } from "react";
import { Outlet } from "react-router";
import { X } from "lucide-react";
import { CreateEventDialog } from "@/features/events/components/create-event-dialog";
import { VerifyEmailBanner } from "@/components/shared/verify-email-banner";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  function openCreate() {
    setDrawerOpen(false);
    setCreateOpen(true);
  }

  return (
    <div className="min-h-svh bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r md:block">
        <Sidebar onCreateEvent={openCreate} />
      </aside>

      {drawerOpen && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-40 bg-foreground/30"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r shadow-lg">
            <Sidebar
              onCreateEvent={openCreate}
              onNavigate={() => setDrawerOpen(false)}
            />
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="absolute top-4 right-3 rounded-md p-2 text-muted-foreground hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
            >
              <X className="size-5" />
            </button>
          </aside>
        </div>
      )}

      <div className="min-w-0 md:pl-60">
        <VerifyEmailBanner />
        <TopBar onOpenMenu={() => setDrawerOpen(true)} />

        <main className="px-4 py-6 md:px-8 md:py-8">
          <div className="max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>

      <CreateEventDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}