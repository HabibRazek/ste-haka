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

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 transform bg-white border-r border-border/50 transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-border/50 px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground">
                <span className="text-lg font-bold text-white">
                  H
                </span>
              </div>
              <span className="text-xl font-semibold tracking-tight text-foreground">Haka</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            <p className="px-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-4">
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
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-foreground text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="border-t border-border/50 p-4">
            {bottomNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-foreground text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="h-5 w-5" />
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

