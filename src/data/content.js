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

export const catalog = {
  currency: 'COP',
  maxQtyPerProduct: 10,
  products: [
    {
      id: 'cafe-medio',
      title: 'Café Medio',
      roast: 'Tueste medio',
      description: 'Equilibrado y dulce, con notas de panela, caramelo y frutos rojos.',
      price: 25000,
      weight: '340g',
    },
    {
      id: 'cafe-oscuro',
      title: 'Café Oscuro',
      roast: 'Tueste oscuro',
      description: 'Intenso y achocolatado, cuerpo alto y final prolongado.',
      price: 27000,
      weight: '340g',
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
