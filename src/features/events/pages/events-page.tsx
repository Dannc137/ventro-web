import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";

export function EventsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="mx-auto max-w-xl space-y-6 p-8">
      <h1 className="text-2xl font-semibold">
        Signed in as {user?.fullName}
      </h1>
      <p className="text-muted-foreground">{user?.email}</p>

      <Button variant="outline" onClick={logout}>
        Log out
      </Button>
    </div>
  );
}