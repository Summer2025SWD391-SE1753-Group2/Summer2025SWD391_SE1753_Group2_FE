import { BaseLayout } from "../shared/BaseLayout";
import { GuestTopbar } from "./GuestTopbar";

interface GuestLayoutProps {
  children: React.ReactNode;
}

export function GuestLayout({ children }: GuestLayoutProps) {
  return (
    <BaseLayout
      topbar={<GuestTopbar />}
      // No sidebar for guests
    >
      {children}
    </BaseLayout>
  );
}
