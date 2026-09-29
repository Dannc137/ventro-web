import { useState } from "react";
import { Outlet } from "react-router";
import { Menu, X } from "lucide-react";
import { CreateEventDialog } from "@/features/events/components/create-event-dialog";
import { Sidebar } from "./sidebar";

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  function openCreate() {
    setDrawerOpen(false);
    setCreateOpen(true);
  }

  return (
    <div className="min-h-svh bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r md:block">
        <Sidebar onCreateEvent={openCreate} />
      </aside>

      {/* Mobile drawer */}
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

      <div className="md:pl-60">
        <header className="flex h-14 items-center gap-3 border-b bg-card px-4 md:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
          >
            <Menu className="size-5" />
          </button>
          <span className="text-sm font-medium">Ventro</span>
        </header>

        <main className="px-4 py-6 md:px-8 md:py-8">
          <div className="max-w-[1200px]">
            <Outlet />
          </div>
        </main>
      </div>

      <CreateEventDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}