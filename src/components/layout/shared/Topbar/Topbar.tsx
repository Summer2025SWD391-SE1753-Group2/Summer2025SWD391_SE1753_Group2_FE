import { cn } from "@/lib/utils";
import { useLayoutStore } from "@/store/layout/layoutStore";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface TopbarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function Topbar({ className, children, ...props }: TopbarProps) {
  const { toggleMobileMenu } = useLayoutStore();

  return (
    <div
      className={cn(
        "sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-4",
        className
      )}
      {...props}
    >
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={toggleMobileMenu}
      >
        <Menu className="h-5 w-5" />
      </Button>
      {children}
    </div>
  );
}
