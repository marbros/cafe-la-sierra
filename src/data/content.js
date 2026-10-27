// Única fuente de verdad del copy, el catálogo y la tabla de zonas (regla del CLAUDE.md).
// El servidor valida precios y tarifas contra este archivo: nunca confía en el cliente.

export const site = {
  name: 'Café La Sierra',
  tagline: 'Café colombiano de origen, directo a tu taza',
  description:
    'Cultivado en las montañas de la Sierra Nevada y tostado en pequeños lotes para resaltar su sabor.',
};

export const features = [
  {
    icon: 'mountain',
    title: 'Origen único',
    text: 'Grano 100% arábica cultivado en fincas de la Sierra Nevada.',
  },
  {
    icon: 'flame',
    title: 'Tueste artesanal',
    text: 'Tostado en pequeños lotes para conservar aroma y frescura.',
  },
  {
    icon: 'handshake',
    title: 'Comercio justo',
    text: 'Apoyamos directamente a las familias caficultoras colombianas.',
  },
];

// Catálogo completo. `kind` separa el café en grano (340g) de las bebidas de la
// casa (vaso 12 oz, ampliación del 2026-10-27 pedida por el dueño). El id y el
// precio son autoridad del servidor (ADR-0009); `image`/`rating` son solo UI.
export const catalog = {
  currency: 'COP',
  maxQtyPerProduct: 10,
  products: [
    {
      id: 'cafe-medio',
      kind: 'grano',
      title: 'Café Medio',
      roast: 'Tueste medio',
      description: 'Equilibrado y dulce, con notas de panela, caramelo y frutos rojos.',
      price: 25000,
      presentation: '340g',
    },
    {
      id: 'cafe-oscuro',
      kind: 'grano',
      title: 'Café Oscuro',
      roast: 'Tueste oscuro',
      description: 'Intenso y achocolatado, cuerpo alto y final prolongado.',
      price: 27000,
      presentation: '340g',
    },
    {
      id: 'cappuccino',
      kind: 'bebida',
      title: 'Cappuccino',
      rating: 4.9,
      description: 'Un clásico atemporal: 20% espresso, 40% leche vaporizada y 40% espuma aireada.',
      price: 12000,
      presentation: 'Vaso 12 oz',
      image: '/cup-1.png',
    },
    {
      id: 'latte',
      kind: 'bebida',
      title: 'Latte',
      rating: 5.0,
      description: 'Suave y cremoso: 30% espresso y 70% leche fresca caliente.',
      price: 13000,
      presentation: 'Vaso 12 oz',
      image: '/cup-2.png',
    },
    {
      id: 'mocha',
      kind: 'bebida',
      title: 'Mocha',
      rating: 4.7,
      description: 'Para amantes del chocolate: 20% espresso, 50% leche y 30% chocolate premium.',
      price: 14000,
      presentation: 'Vaso 12 oz',
      image: '/cup-3.png',
    },
  ],
};

// Tabla estática de zonas con tarifa fija, definida por el dueño (PRD: no hay
// cálculo por dirección ni mapas). El id viaja en el pedido; la tarifa la pone el servidor.
export const delivery = {
  zones: [
    { id: 'norte', name: 'Zona Norte', fee: 5000 },
    { id: 'centro', name: 'Zona Centro', fee: 4000 },
    { id: 'occidente', name: 'Zona Occidente', fee: 6000 },
    { id: 'sur', name: 'Zona Sur', fee: 6000 },
  ],
  // Las horas (inicio, fin, corte) viven en src/lib/time.js; aquí solo el copy.
  slotLabels: {
    manana: 'Mañana (9:00 a. m. – 12:00 m.)',
    tarde: 'Tarde (2:00 p. m. – 6:00 p. m.)',
  },
  paymentNote: 'Pagas en efectivo al recibir tu pedido. Sin pagos online, sin cuentas.',
};

// Copy del tablero del operador.
export const board = {
  statusLabels: {
    NUEVO: 'Nuevo',
    PREPARANDO: 'Preparando',
    EN_CAMINO: 'En camino',
    ENTREGADO: 'Entregado',
    CANCELADO: 'Devuelto / Cancelado',
  },
  actionLabels: {
    PREPARANDO: 'Preparar',
    EN_CAMINO: 'Despachar',
    ENTREGADO: 'Entregado',
    CANCELADO: 'Devolver / Cancelar',
  },
};

export function formatCop(value) {
  return `$${new Intl.NumberFormat('es-CO').format(value)}`;
}
