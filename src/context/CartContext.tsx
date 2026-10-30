import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { MenuItem } from "../data/menu";

export type Fulfilment = "pickup" | "delivery";

export type CartLine = {
  lineId: string;
  itemId: string;
  name: string;
  /** Selected variant / choice text, e.g. "Green · Chicken / Beef" */
  detail: string;
  /** undefined = the menu lists no price; staff confirm it */
  unitPrice?: number;
  image: string;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  unpricedCount: number;
  fulfilment: Fulfilment;
  setFulfilment: (f: Fulfilment) => void;
  addLine: (
    item: MenuItem,
    opts?: { detail?: string; unitPrice?: number }
  ) => void;
  increment: (lineId: string) => void;
  decrement: (lineId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [fulfilment, setFulfilment] = useState<Fulfilment>("pickup");

  const addLine = useCallback<CartContextValue["addLine"]>((item, opts) => {
    const detail = opts?.detail ?? "";
    const unitPrice = opts?.unitPrice ?? item.price;
    const lineId = `${item.id}|${detail}`;
    setLines((prev) => {
      const existing = prev.find((l) => l.lineId === lineId);
      if (existing) {
        return prev.map((l) =>
          l.lineId === lineId ? { ...l, qty: l.qty + 1 } : l
        );
      }
      return [
        ...prev,
        {
          lineId,
          itemId: item.id,
          name: item.name,
          detail,
          unitPrice,
          image: item.image,
          qty: 1,
        },
      ];
    });
  }, []);

  const increment = useCallback((lineId: string) => {
    setLines((prev) =>
      prev.map((l) => (l.lineId === lineId ? { ...l, qty: l.qty + 1 } : l))
    );
  }, []);

  const decrement = useCallback((lineId: string) => {
    setLines((prev) =>
      prev
        .map((l) => (l.lineId === lineId ? { ...l, qty: l.qty - 1 } : l))
        .filter((l) => l.qty > 0)
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce(
      (sum, l) => sum + (l.unitPrice ?? 0) * l.qty,
      0
    );
    const unpricedCount = lines
      .filter((l) => l.unitPrice === undefined)
      .reduce((n, l) => n + l.qty, 0);
    return {
      lines,
      count,
      subtotal,
      unpricedCount,
      fulfilment,
      setFulfilment,
      addLine,
      increment,
      decrement,
      clear,
    };
  }, [lines, fulfilment, addLine, increment, decrement, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
