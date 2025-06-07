import { cn } from "@/lib/utils";
import { useLayoutStore } from "@/store/layout/layoutStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft } from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Sidebar({ className, children, ...props }: SidebarProps) {
  const { isSidebarOpen, toggleSidebar } = useLayoutStore();

  return (
    <div
      className={cn(
        "relative flex h-full flex-col border-r bg-background",
        isSidebarOpen ? "w-64" : "w-16",
        className
      )}
      {...props}
    >
      <div className="flex h-14 items-center border-b px-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={toggleSidebar}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              !isSidebarOpen && "rotate-180"
            )}
          />
        </Button>
      </div>
      <ScrollArea className="flex-1 px-2">{children}</ScrollArea>
    </div>
  );
}
