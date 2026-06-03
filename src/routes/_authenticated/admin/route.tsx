import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getMyRole } from "@/lib/admin-products.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    try {
      const { isAdmin } = await getMyRole();
      if (!isAdmin) throw redirect({ to: "/" });
    } catch (e: any) {
      if (e?.isRedirect) throw e;
      throw redirect({ to: "/" });
    }
  },
  component: () => <Outlet />,
});
