import { useState, useEffect, useCallback } from 'react';
import type { SavedProduct, Kit, AllSettings, CostBreakdown } from '../types';

const PRODUCTS_KEY = 'precifica3d-products';
const KITS_KEY = 'precifica3d-kits';

export function useProducts() {
  const [products, setProducts] = useState<SavedProduct[]>(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Erro ao carregar produtos:', e);
    }
    return [];
  });

  const [kits, setKits] = useState<Kit[]>(() => {
    try {
      const saved = localStorage.getItem(KITS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Erro ao carregar kits:', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Erro ao salvar produtos:', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(KITS_KEY, JSON.stringify(kits));
    } catch (e) {
      console.error('Erro ao salvar kits:', e);
    }
  }, [kits]);

  const saveProduct = useCallback(
    (name: string, settings: AllSettings, cogs: number) => {
      const newProduct: SavedProduct = {
        id: `product-${Date.now()}`,
        name,
        print: { ...settings.print },
        material: { ...settings.material },
        extraCosts: { ...settings.extraCosts },
        cogs,
        createdAt: Date.now(),
      };
      setProducts((prev) => [...prev, newProduct]);
      return newProduct;
    },
    []
  );

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    // Também remove o produto de todos os kits
    setKits((prev) =>
      prev.map((kit) => ({
        ...kit,
        items: kit.items.filter((item) => item.productId !== id),
      })).filter((kit) => kit.items.length > 0)
    );
  }, []);

  const updateProduct = useCallback(
    (id: string, name: string, settings: AllSettings, cogs: number) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                name,
                print: { ...settings.print },
                material: { ...settings.material },
                extraCosts: { ...settings.extraCosts },
                cogs,
              }
            : p
        )
      );
    },
    []
  );

  const saveKit = useCallback(
    (name: string, items: { productId: string; quantity: number }[]) => {
      const newKit: Kit = {
        id: `kit-${Date.now()}`,
        name,
        items,
        createdAt: Date.now(),
      };
      setKits((prev) => [...prev, newKit]);
      return newKit;
    },
    []
  );

  const deleteKit = useCallback((id: string) => {
    setKits((prev) => prev.filter((k) => k.id !== id));
  }, []);

  const updateKit = useCallback(
    (id: string, name: string, items: { productId: string; quantity: number }[]) => {
      setKits((prev) =>
        prev.map((k) =>
          k.id === id
            ? { ...k, name, items }
            : k
        )
      );
    },
    []
  );

  const calculateKitCogs = useCallback(
    (kitId: string): number => {
      const kit = kits.find((k) => k.id === kitId);
      if (!kit) return 0;

      return kit.items.reduce((total, item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return total;
        return total + product.cogs * item.quantity;
      }, 0);
    },
    [kits, products]
  );

  const getKitCostBreakdown = useCallback(
    (kitId: string): Partial<CostBreakdown> | null => {
      const kit = kits.find((k) => k.id === kitId);
      if (!kit) return null;

      const breakdown: Partial<CostBreakdown> = {
        filamentCost: 0,
        energyCost: 0,
        laborCost: 0,
        packagingCost: 0,
        depreciationCost: 0,
        otherCosts: 0,
        cogs: 0,
      };

      kit.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          breakdown.cogs! += product.cogs * item.quantity;
        }
      });

      return breakdown;
    },
    [kits, products]
  );

  return {
    products,
    kits,
    saveProduct,
    deleteProduct,
    updateProduct,
    saveKit,
    deleteKit,
    updateKit,
    calculateKitCogs,
    getKitCostBreakdown,
  };
}
