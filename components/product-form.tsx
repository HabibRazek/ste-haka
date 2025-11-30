"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, ImagePlus, X } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing-components";
import { createProduct, updateProduct, ProductFormData, ProductWithMargin } from "@/lib/actions/products";

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductWithMargin | null;
  onProductSaved?: (savedProduct: ProductWithMargin, isUpdate: boolean) => void;
}

// Format number with comma for thousands
const formatNumberInput = (num: number): string => {
  if (num === 0) return "";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Parse formatted string back to number
const parseNumberInput = (str: string): number => {
  const cleaned = str.replace(/,/g, "");
  return parseFloat(cleaned) || 0;
};

export function ProductForm({ open, onOpenChange, product, onProductSaved }: ProductFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [images, setImages] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing("productImage", {
    onClientUploadComplete: (res) => {
      if (res?.length) {
        const newUrls = res.map(file => file.url || file.ufsUrl);
        setImages(prev => [...prev, ...newUrls]);
      }
      setIsUploading(false);
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      setError(`Erreur d'upload: ${error.message}`);
      setIsUploading(false);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setIsUploading(true);
    setError(null);
    await startUpload(Array.from(files));
    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const [formData, setFormData] = React.useState<ProductFormData>({
    name: "",
    description: "",
    contenance: "",
    images: [],
    prixAchat: 0,
    prixVente: 0,
    stock: 0,
  });

  React.useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        contenance: product.contenance || "",
        images: product.images || [],
        prixAchat: product.prixAchat,
        prixVente: product.prixVente,
        stock: product.stock,
      });
      setImages(product.images || []);
    } else {
      setFormData({
        name: "",
        description: "",
        contenance: "",
        images: [],
        prixAchat: 0,
        prixVente: 0,
        stock: 0,
      });
      setImages([]);
    }
    setError(null);
  }, [product, open]);

  const marge = formData.prixVente - formData.prixAchat;
  const pourcentageMarge = formData.prixVente > 0 
    ? Math.round((marge / formData.prixVente) * 100) 
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Le nom du produit est obligatoire");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const dataToSend = { ...formData, images };
      const result = product
        ? await updateProduct(product.id, dataToSend)
        : await createProduct(dataToSend);
      if (result.success && result.data) {
        const savedProduct: ProductWithMargin = {
          ...result.data,
          marge: result.data.prixVente - result.data.prixAchat,
          pourcentageMarge: result.data.prixVente > 0
            ? Math.round(((result.data.prixVente - result.data.prixAchat) / result.data.prixVente) * 100)
            : 0,
        };
        onProductSaved?.(savedProduct, !!product);
        onOpenChange(false);
      } else {
        setError(result.error || "Une erreur est survenue");
      }
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {product ? "Modifier le produit" : "Nouveau produit"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Images du produit</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex flex-wrap gap-3">
              {/* Existing images */}
              {images.map((url, index) => (
                <div key={index} className="relative w-24 h-24 border rounded-lg overflow-hidden bg-accent/30">
                  <Image src={url} alt={`Product ${index + 1}`} fill className="object-contain" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-0.5 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {/* Add image button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 hover:border-primary/50 hover:bg-accent/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                ) : (
                  <>
                    <ImagePlus className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Ajouter</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Product Name & Contenance */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom du produit *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nom du produit"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contenance</label>
              <Input
                value={formData.contenance}
                onChange={(e) => setFormData({ ...formData, contenance: e.target.value })}
                placeholder="ex: 1 L, 0,75 cl, 500 ml"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description du produit"
              disabled={isLoading}
              rows={2}
            />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Prix d&apos;Achat (TND) *</label>
              <Input
                type="text"
                inputMode="numeric"
                value={formatNumberInput(formData.prixAchat)}
                onChange={(e) => setFormData({ ...formData, prixAchat: parseNumberInput(e.target.value) })}
                placeholder="0"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Prix de Vente (TND) *</label>
              <Input
                type="text"
                inputMode="numeric"
                value={formatNumberInput(formData.prixVente)}
                onChange={(e) => setFormData({ ...formData, prixVente: parseNumberInput(e.target.value) })}
                placeholder="0"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Stock</label>
              <Input
                type="number"
                value={formData.stock || ""}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                placeholder="0"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Live calculation preview */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-accent/50 rounded-lg border border-border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Marge</p>
              <p className={`text-xl font-bold ${marge >= 0 ? "text-primary" : "text-red-500"}`}>
                {formatNumberInput(marge)} TND
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">% Marge</p>
              <p className={`text-xl font-bold ${pourcentageMarge >= 0 ? "text-primary" : "text-red-500"}`}>
                {pourcentageMarge}%
              </p>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {product ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

