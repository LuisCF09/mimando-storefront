import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  productId: string;
  nome: string;
  preco: number;
  imagem_url: string | null;
  quantity: number;
};

export type AppliedCoupon = {
  codigo: string;
  tipo: "percent" | "fixed";
  valor: number;
  desconto: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  total: number;
  coupon: AppliedCoupon | null;
  applyCoupon: (c: AppliedCoupon) => void;
  removeCoupon: () => void;
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "mimando-cart";
const COUPON_KEY = "mimando-coupon";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setItems(JSON.parse(raw));
      const cRaw = typeof window !== "undefined" ? window.localStorage.getItem(COUPON_KEY) : null;
      if (cRaw) setCoupon(JSON.parse(cRaw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (coupon) window.localStorage.setItem(COUPON_KEY, JSON.stringify(coupon));
      else window.localStorage.removeItem(COUPON_KEY);
    } catch {
      /* ignore */
    }
  }, [coupon, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((acc, i) => acc + i.quantity, 0);
    const subtotal = items.reduce((acc, i) => acc + i.preco * i.quantity, 0);
    // Recompute discount against current subtotal (handles qty changes)
    let desconto = 0;
    if (coupon) {
      if (coupon.tipo === "percent") {
        desconto = Number(((subtotal * coupon.valor) / 100).toFixed(2));
      } else {
        desconto = Number(Math.min(coupon.valor, subtotal).toFixed(2));
      }
    }
    const total = Math.max(0, Number((subtotal - desconto).toFixed(2)));
    return {
      items,
      count,
      subtotal,
      total,
      coupon: coupon ? { ...coupon, desconto } : null,
      applyCoupon: (c) => setCoupon(c),
      removeCoupon: () => setCoupon(null),
      addItem: (item, qty = 1) =>
        setItems((prev) => {
          const existing = prev.find((p) => p.productId === item.productId);
          if (existing) {
            return prev.map((p) =>
              p.productId === item.productId ? { ...p, quantity: p.quantity + qty } : p,
            );
          }
          return [...prev, { ...item, quantity: qty }];
        }),
      updateQuantity: (productId, quantity) =>
        setItems((prev) =>
          prev
            .map((p) => (p.productId === productId ? { ...p, quantity } : p))
            .filter((p) => p.quantity > 0),
        ),
      removeItem: (productId) => setItems((prev) => prev.filter((p) => p.productId !== productId)),
      clear: () => {
        setItems([]);
        setCoupon(null);
      },
    };
  }, [items, coupon]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
