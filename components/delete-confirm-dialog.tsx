"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Loader2 } from "lucide-react";

// Theme colors
const ACCENT_LIME = "#c4f500";
const ACCENT_LIME_DARK = "#80a100";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  itemName?: string;
  isLoading?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Confirmer la suppression",
  description = "Cette action est irréversible. L'élément sera définitivement supprimé.",
  itemName,
  isLoading = false,
}: DeleteConfirmDialogProps) {
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };

  const showLoading = isLoading || loading;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md border-0 shadow-2xl">
        {/* Warning Icon Header */}
        <div className="flex flex-col items-center pt-4 pb-2">
          <div 
            className="h-16 w-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: "#fee2e2" }}
          >
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <AlertDialogHeader className="text-center space-y-3">
          <AlertDialogTitle className="text-xl font-semibold text-gray-900">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-500 text-sm leading-relaxed">
            {itemName ? (
              <>
                Êtes-vous sûr de vouloir supprimer{" "}
                <span className="font-semibold text-gray-700">&quot;{itemName}&quot;</span> ?
                <br />
                <span className="text-red-500 mt-2 block">
                  Cette action est irréversible.
                </span>
              </>
            ) : (
              description
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex gap-3 mt-6 sm:flex-row sm:justify-center">
          <AlertDialogCancel 
            disabled={showLoading}
            className="flex-1 sm:flex-none sm:min-w-[120px] border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={showLoading}
            className="flex-1 sm:flex-none sm:min-w-[120px] bg-red-500 hover:bg-red-600 text-white border-0 transition-all"
          >
            {showLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Suppression...
              </span>
            ) : (
              "Supprimer"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

