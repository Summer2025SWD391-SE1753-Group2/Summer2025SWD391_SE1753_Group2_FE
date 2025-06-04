import { Sidebar } from "./Sidebar/Sidebar";

interface BaseLayoutProps {
  sidebar?: React.ReactNode;
  topbar?: React.ReactNode;
  children: React.ReactNode;
}

export function BaseLayout({ sidebar, topbar, children }: BaseLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {topbar}
      <div className="flex flex-1">
        {sidebar && <Sidebar>{sidebar}</Sidebar>}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
