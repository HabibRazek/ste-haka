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
      {/* Mobile Top Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 lg:hidden">
        <div className="flex h-14 items-center justify-between bg-white border-b border-border/50 px-4 shadow-sm">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: "#1a1a1a" }}>
              <span className="text-sm font-bold text-white">H</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">Haka</span>
          </Link>

          {/* Burger Menu Button (Right Side) */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Desktop: left side, Mobile: right side slide-in */}
      <aside
        className={cn(
          "fixed z-40 h-screen w-64 transform bg-white transition-transform duration-200 ease-in-out",
          // Desktop: left side, always visible
          "lg:left-0 lg:top-0 lg:translate-x-0 lg:border-r lg:border-border/50",
          // Mobile: right side, slides from right, starts below navbar
          "max-lg:right-0 max-lg:top-14 max-lg:h-[calc(100vh-3.5rem)] max-lg:border-l max-lg:border-border/50 max-lg:shadow-xl",
          isOpen ? "max-lg:translate-x-0" : "max-lg:translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo - Only visible on desktop */}
          <div className="hidden lg:flex h-16 items-center border-b border-border/50 px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: "#1a1a1a" }}>
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
                      ? "text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-gray-100"
                  )}
                  style={isActive ? { backgroundColor: "#1a1a1a" } : {}}
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
                      ? "text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-gray-100"
                  )}
                  style={isActive ? { backgroundColor: "#1a1a1a" } : {}}
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

