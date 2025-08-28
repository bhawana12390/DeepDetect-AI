import { SidebarTrigger } from "@/components/ui/sidebar";
import { ShieldCheck } from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";

export default function Header() {
  return (
    <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
            <SidebarTrigger className="md:hidden" />
            <div className="flex items-center gap-2">
                <ShieldCheck className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                DeepDetect AI
                </h1>
            </div>
        </div>
        <ThemeSwitcher />
      </div>
    </header>
  );
}
