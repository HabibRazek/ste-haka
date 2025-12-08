"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Settings,
  Users,
  Menu,
  X,
  Package,
  ShoppingBag,
  Printer,
  FileText,
  Receipt,
  Globe,
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    title: "Tableau de bord",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Commandes",
    href: "/commandes",
    icon: Package,
  },
  {
    title: "Produits",
    href: "/produits",
    icon: ShoppingBag,
  },
  {
    title: "Impression",
    href: "/impression",
    icon: Printer,
  },
  {
    title: "Devis",
    href: "/devis",
    icon: FileText,
  },
  {
    title: "Factures",
    href: "/factures",
    icon: Receipt,
  },
  {
    title: "Importation",
    href: "/importation",
    icon: Globe,
  },
  {
    title: "Comptabilité",
    href: "/comptabilite",
    icon: Calculator,
  },
  {
    title: "Tâches",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    title: "Équipe",
    href: "/equipe",
    icon: Users,
  },
];

const bottomNavItems = [
  {
    title: "Paramètres",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  // Dark green color for active state
  const PRIMARY_GREEN = "#166534";

  return (
    <>
      {/* Mobile Top Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 lg:hidden">
        <div className="flex h-14 items-center justify-between bg-white border-b border-border/50 px-4 shadow-sm">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ backgroundColor: PRIMARY_GREEN }}>
              <span className="text-sm font-bold text-white">H</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">Haka</span>
          </Link>

          {/* Burger Menu Button (Right Side) */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Desktop: left side, Mobile: right side slide-in */}
      <aside
        className={cn(
          "fixed z-40 h-screen w-64 transform bg-white transition-transform duration-300 ease-in-out",
          // Desktop: left side, always visible
          "lg:left-0 lg:top-0 lg:translate-x-0 lg:border-r lg:border-border/50",
          // Mobile: right side, slides from right, starts below navbar
          "max-lg:right-0 max-lg:top-14 max-lg:h-[calc(100vh-3.5rem)] max-lg:border-l max-lg:border-border/50 max-lg:shadow-2xl",
          isOpen ? "max-lg:translate-x-0" : "max-lg:translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo - Only visible on desktop */}
          <div className="hidden lg:flex h-16 items-center border-b border-border/50 px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-md" style={{ backgroundColor: PRIMARY_GREEN }}>
                <span className="text-lg font-bold text-white">
                  H
                </span>
              </div>
              <span className="text-xl font-semibold tracking-tight text-foreground">Haka</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 mb-4">
              Menu
            </p>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "text-white shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                  style={isActive ? { backgroundColor: PRIMARY_GREEN } : {}}
                >
                  <item.icon className={cn("h-5 w-5", isActive && "text-white")} />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="border-t border-border/50 p-3">
            {bottomNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "text-white shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                  style={isActive ? { backgroundColor: PRIMARY_GREEN } : {}}
                >
                  <item.icon className={cn("h-5 w-5", isActive && "text-white")} />
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}

