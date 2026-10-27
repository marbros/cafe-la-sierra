'use client';

// Carrito del cliente: estado { productId: qty } persistido en localStorage.
// Es solo conveniencia de UI — el servidor re-valida productos, cantidades y
// precios contra el catálogo en cada POST (ADR-0009). El checkout lo consume
// como cantidades iniciales y lo limpia al confirmar.
import { useEffect, useState } from 'react';
import { catalog } from '../data/content.js';

const STORAGE_KEY = 'cls-cart';
const CHANGE_EVENT = 'cls-cart-changed';

const VALID_IDS = new Set(catalog.products.map((p) => p.id));

export function readCart() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
    const clean = {};
    for (const [id, qty] of Object.entries(raw)) {
      if (VALID_IDS.has(id) && Number.isInteger(qty) && qty > 0) {
        clean[id] = Math.min(qty, catalog.maxQtyPerProduct);
      }
    }
    return clean;
  } catch {
    return {};
  }
}

export function writeCart(cart) {
  if (typeof window === 'undefined') return;
  const clean = Object.fromEntries(Object.entries(cart).filter(([, qty]) => qty > 0));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function addToCart(productId, delta = 1) {
  const cart = readCart();
  const next = Math.min(catalog.maxQtyPerProduct, Math.max(0, (cart[productId] ?? 0) + delta));
  writeCart({ ...cart, [productId]: next });
}

export function clearCart() {
  writeCart({});
}

export function cartCount(cart) {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

/** Hook: carrito vivo, sincronizado entre componentes y pestañas. */
export function useCart() {
  const [cart, setCart] = useState({});

  useEffect(() => {
    const sync = () => setCart(readCart());
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return cart;
}
