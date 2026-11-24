import { useEffect, useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { CampusProvider } from "@/components/campus";
import { IngressGate, IngressProvider } from "@/components/ingress";
import { BootScreen, Shell } from "@/components/shell";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/_app")({ component: AppLayout });

function AppLayout() {
  const { user, isPending } = useCurrentUserState();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || isPending) return <BootScreen />;
  if (!user) return <RedirectToSignIn />;
  return (
    <IngressProvider>
      <IngressGate>
        <CampusProvider>
          <Shell>
            <Outlet />
          </Shell>
        </CampusProvider>
      </IngressGate>
    </IngressProvider>
  );
}
