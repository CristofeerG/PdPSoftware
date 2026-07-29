import { PrismaClient, UnidadMedida } from "@prisma/client";

const prisma = new PrismaClient();

// Migración del menú real (ver extraccion-menu-para-migracion.md en la raíz del proyecto).
// Costo y stock_actual de cada insumo se dejan en 0 a propósito: no vienen en el archivo
// y se cargan manualmente desde la pantalla de inventario. Este script es re-ejecutable:
// en updates nunca se toca costo/stockActual/stockMinimo de un insumo ya existente.

type Unidad = "UNIDAD" | "ML";

interface InsumoSeed {
  nombre: string;
  categoria: string;
  unidad: Unidad;
}

interface RecetaSeed {
  insumo: string;
  cantidad: number;
}

interface ProductoSeed {
  nombre: string;
  categoria: string;
  precioVenta: number;
  receta: RecetaSeed[];
}

function r(insumo: string, cantidad: number): RecetaSeed {
  return { insumo, cantidad };
}

const CATEGORIA_CERVEZAS = "Cervezas";
const CATEGORIA_LICORES = "Licores";
const CATEGORIA_SNACKS_REFRESCOS = "Snacks y refrescos";
const CATEGORIA_COMBOS = "Combos";
const CATEGORIA_LICORES_ROCAS = "Licores a las rocas";
const CATEGORIA_BOTELLAS = "Botellas";
const CATEGORIA_SHOTS = "Shots";
const CATEGORIA_SHOTS_PREPARADOS = "Shots preparados";
const CATEGORIA_COCTELES_SUAVES = "Cócteles Suaves & Refrescantes";
const CATEGORIA_COCTELES_TROPICALES = "Cócteles Tropicales";
const CATEGORIA_COCTELES_CLASICOS = "Cócteles Clásicos de Siempre";
const CATEGORIA_COCTELES_INTENSOS = "Cócteles Intensos";
const CATEGORIA_MICHELADAS = "Micheladas";
const CATEGORIA_MOCKTAILS = "Mocktails";
const CATEGORIA_MODO_CERO = "Modo Cero";
const CATEGORIA_ZONA_REFRESCANTE = "Zona Refrescante";
const CATEGORIA_JUGOS = "Jugos";
const CATEGORIA_HELADOS = "Helados";
const CATEGORIA_ANTOJO_SNACKS = "Antojo Rápido — Snacks";
const CATEGORIA_DULCES = "Dulces";

const TODAS_LAS_CATEGORIAS = [
  CATEGORIA_CERVEZAS,
  CATEGORIA_LICORES,
  CATEGORIA_SNACKS_REFRESCOS,
  CATEGORIA_COMBOS,
  CATEGORIA_LICORES_ROCAS,
  CATEGORIA_BOTELLAS,
  CATEGORIA_SHOTS,
  CATEGORIA_SHOTS_PREPARADOS,
  CATEGORIA_COCTELES_SUAVES,
  CATEGORIA_COCTELES_TROPICALES,
  CATEGORIA_COCTELES_CLASICOS,
  CATEGORIA_COCTELES_INTENSOS,
  CATEGORIA_MICHELADAS,
  CATEGORIA_MOCKTAILS,
  CATEGORIA_MODO_CERO,
  CATEGORIA_ZONA_REFRESCANTE,
  CATEGORIA_JUGOS,
  CATEGORIA_HELADOS,
  CATEGORIA_ANTOJO_SNACKS,
  CATEGORIA_DULCES,
];

// Categorías del seed de prueba (prompt 2) que no coinciden con el menú real.
const CATEGORIAS_OBSOLETAS = ["Cocteles", "Refrescos", "Snacks"];

const INSUMOS: InsumoSeed[] = [
  // Cervezas (unidad)
  { nombre: "Club 850ml", categoria: CATEGORIA_CERVEZAS, unidad: "UNIDAD" },
  { nombre: "Club 550ml", categoria: CATEGORIA_CERVEZAS, unidad: "UNIDAD" },
  { nombre: "Club 330ml", categoria: CATEGORIA_CERVEZAS, unidad: "UNIDAD" },
  { nombre: "Pilsener 1000ml", categoria: CATEGORIA_CERVEZAS, unidad: "UNIDAD" },
  { nombre: "Pilsener 600ml", categoria: CATEGORIA_CERVEZAS, unidad: "UNIDAD" },
  { nombre: "Corona 330ml", categoria: CATEGORIA_CERVEZAS, unidad: "UNIDAD" },
  { nombre: "Corona en lata", categoria: CATEGORIA_CERVEZAS, unidad: "UNIDAD" },
  { nombre: "Coronita 210ml", categoria: CATEGORIA_CERVEZAS, unidad: "UNIDAD" },
  { nombre: "Corona Cero 330ml", categoria: CATEGORIA_CERVEZAS, unidad: "UNIDAD" },

  // Licores (ml) — tamaño de botella referencial, no se guarda en el modelo
  { nombre: "Jägermeister", categoria: CATEGORIA_LICORES, unidad: "ML" }, // botella 700ml
  { nombre: "Something Special", categoria: CATEGORIA_LICORES, unidad: "ML" }, // botella 750ml
  { nombre: "Johnnie Walker Rojo", categoria: CATEGORIA_LICORES, unidad: "ML" }, // botella 750ml
  { nombre: "Johnnie Walker Negro", categoria: CATEGORIA_LICORES, unidad: "ML" }, // botella 750ml
  { nombre: "Old Parr", categoria: CATEGORIA_LICORES, unidad: "ML" }, // botella 750ml
  { nombre: "Buchanan's Deluxe", categoria: CATEGORIA_LICORES, unidad: "ML" }, // botella 750ml
  { nombre: "Buchanan's Master", categoria: CATEGORIA_LICORES, unidad: "ML" }, // botella 750ml
  { nombre: "Double Black", categoria: CATEGORIA_LICORES, unidad: "ML" }, // botella 750ml
  { nombre: "Chivas Aged 12 Years", categoria: CATEGORIA_LICORES, unidad: "ML" }, // botella 750ml
  { nombre: "Antioqueño", categoria: CATEGORIA_LICORES, unidad: "ML" }, // botella 750ml
  { nombre: "Tequila", categoria: CATEGORIA_LICORES, unidad: "ML" }, // botella 750ml
  { nombre: "Vodka", categoria: CATEGORIA_LICORES, unidad: "ML" }, // botella 750ml, no se vende embotellado
  { nombre: "Ron Castillo", categoria: CATEGORIA_LICORES, unidad: "ML" }, // botella 750ml (tamaño asumido)
  { nombre: "Gin Under", categoria: CATEGORIA_LICORES, unidad: "ML" }, // botella 750ml (tamaño asumido)
  { nombre: "Gancia Vermouth Extra Dry", categoria: CATEGORIA_LICORES, unidad: "ML" }, // botella 750ml (tamaño asumido)

  // Snacks, dulces y refrescos (unidad)
  { nombre: "Doritos", categoria: CATEGORIA_SNACKS_REFRESCOS, unidad: "UNIDAD" },
  { nombre: "Ruffles", categoria: CATEGORIA_SNACKS_REFRESCOS, unidad: "UNIDAD" },
  { nombre: "Chupetes", categoria: CATEGORIA_SNACKS_REFRESCOS, unidad: "UNIDAD" },
  { nombre: "Chicles (paq. 2)", categoria: CATEGORIA_SNACKS_REFRESCOS, unidad: "UNIDAD" },
  { nombre: "Gaseosa (genérica)", categoria: CATEGORIA_SNACKS_REFRESCOS, unidad: "UNIDAD" },
  { nombre: "Agua", categoria: CATEGORIA_SNACKS_REFRESCOS, unidad: "UNIDAD" },
  { nombre: "Güitig", categoria: CATEGORIA_SNACKS_REFRESCOS, unidad: "UNIDAD" },
  { nombre: "Pony malta", categoria: CATEGORIA_SNACKS_REFRESCOS, unidad: "UNIDAD" },
  { nombre: "V220", categoria: CATEGORIA_SNACKS_REFRESCOS, unidad: "UNIDAD" },
  { nombre: "Imperial de toronja", categoria: CATEGORIA_SNACKS_REFRESCOS, unidad: "UNIDAD" },
];

const PRODUCTOS: ProductoSeed[] = [
  // --- Cervezas ---
  { nombre: "Club 850ml", categoria: CATEGORIA_CERVEZAS, precioVenta: 3.75, receta: [r("Club 850ml", 1)] },
  { nombre: "Club 550ml", categoria: CATEGORIA_CERVEZAS, precioVenta: 3.0, receta: [r("Club 550ml", 1)] },
  { nombre: "Pilsener 1000ml", categoria: CATEGORIA_CERVEZAS, precioVenta: 3.25, receta: [r("Pilsener 1000ml", 1)] },
  { nombre: "Pilsener 600ml", categoria: CATEGORIA_CERVEZAS, precioVenta: 2.5, receta: [r("Pilsener 600ml", 1)] },
  { nombre: "Corona 330ml", categoria: CATEGORIA_CERVEZAS, precioVenta: 3.5, receta: [r("Corona 330ml", 1)] },
  { nombre: "Corona en lata", categoria: CATEGORIA_CERVEZAS, precioVenta: 2.5, receta: [r("Corona en lata", 1)] },
  { nombre: "Coronita 210ml", categoria: CATEGORIA_CERVEZAS, precioVenta: 2.0, receta: [r("Coronita 210ml", 1)] },
  { nombre: "Corona Cero 330ml", categoria: CATEGORIA_CERVEZAS, precioVenta: 3.0, receta: [r("Corona Cero 330ml", 1)] },

  // --- Combos ---
  { nombre: "3 Club 850ml", categoria: CATEGORIA_COMBOS, precioVenta: 10.75, receta: [r("Club 850ml", 3)] },
  { nombre: "3 Club 550ml", categoria: CATEGORIA_COMBOS, precioVenta: 8.5, receta: [r("Club 550ml", 3)] },
  { nombre: "3 Pilsener 1000ml", categoria: CATEGORIA_COMBOS, precioVenta: 9.25, receta: [r("Pilsener 1000ml", 3)] },
  { nombre: "3 Pilsener 600ml", categoria: CATEGORIA_COMBOS, precioVenta: 7.0, receta: [r("Pilsener 600ml", 3)] },
  { nombre: "3 Coronas 330ml", categoria: CATEGORIA_COMBOS, precioVenta: 10.0, receta: [r("Corona 330ml", 3)] },
  { nombre: "4 Coronas en lata", categoria: CATEGORIA_COMBOS, precioVenta: 9.5, receta: [r("Corona en lata", 4)] },

  // --- Licores a las rocas (60ml) ---
  { nombre: "Jägermeister Rocas", categoria: CATEGORIA_LICORES_ROCAS, precioVenta: 5.0, receta: [r("Jägermeister", 60)] },
  { nombre: "Something Special Rocas", categoria: CATEGORIA_LICORES_ROCAS, precioVenta: 5.0, receta: [r("Something Special", 60)] },
  { nombre: "Johnnie Rojo Rocas", categoria: CATEGORIA_LICORES_ROCAS, precioVenta: 6.0, receta: [r("Johnnie Walker Rojo", 60)] },
  { nombre: "Johnnie Negro Rocas", categoria: CATEGORIA_LICORES_ROCAS, precioVenta: 8.0, receta: [r("Johnnie Walker Negro", 60)] },
  { nombre: "Old Parr Rocas", categoria: CATEGORIA_LICORES_ROCAS, precioVenta: 8.0, receta: [r("Old Parr", 60)] },
  { nombre: "Buchanan's Deluxe Rocas", categoria: CATEGORIA_LICORES_ROCAS, precioVenta: 8.0, receta: [r("Buchanan's Deluxe", 60)] },
  { nombre: "Buchanan's Master Rocas", categoria: CATEGORIA_LICORES_ROCAS, precioVenta: 9.0, receta: [r("Buchanan's Master", 60)] },
  { nombre: "Double Black Rocas", categoria: CATEGORIA_LICORES_ROCAS, precioVenta: 9.0, receta: [r("Double Black", 60)] },
  { nombre: "Chivas Aged 12 Years Rocas", categoria: CATEGORIA_LICORES_ROCAS, precioVenta: 9.0, receta: [r("Chivas Aged 12 Years", 60)] },

  // --- Botellas (tamaño completo) ---
  { nombre: "Antioqueño Botella", categoria: CATEGORIA_BOTELLAS, precioVenta: 30.0, receta: [r("Antioqueño", 750)] },
  { nombre: "Tequila Botella", categoria: CATEGORIA_BOTELLAS, precioVenta: 35.0, receta: [r("Tequila", 750)] },
  { nombre: "Jägermeister Botella", categoria: CATEGORIA_BOTELLAS, precioVenta: 60.0, receta: [r("Jägermeister", 700)] },
  { nombre: "Something Special Botella", categoria: CATEGORIA_BOTELLAS, precioVenta: 50.0, receta: [r("Something Special", 750)] },
  { nombre: "Johnnie Rojo Botella", categoria: CATEGORIA_BOTELLAS, precioVenta: 65.0, receta: [r("Johnnie Walker Rojo", 750)] },
  { nombre: "Johnnie Negro Botella", categoria: CATEGORIA_BOTELLAS, precioVenta: 90.0, receta: [r("Johnnie Walker Negro", 750)] },
  { nombre: "Old Parr Botella", categoria: CATEGORIA_BOTELLAS, precioVenta: 90.0, receta: [r("Old Parr", 750)] },
  { nombre: "Buchanan's Deluxe Botella", categoria: CATEGORIA_BOTELLAS, precioVenta: 90.0, receta: [r("Buchanan's Deluxe", 750)] },
  { nombre: "Buchanan's Master Botella", categoria: CATEGORIA_BOTELLAS, precioVenta: 100.0, receta: [r("Buchanan's Master", 750)] },
  { nombre: "Double Black Botella", categoria: CATEGORIA_BOTELLAS, precioVenta: 100.0, receta: [r("Double Black", 750)] },
  { nombre: "Chivas Aged 12 Years Botella", categoria: CATEGORIA_BOTELLAS, precioVenta: 100.0, receta: [r("Chivas Aged 12 Years", 750)] },

  // --- Shots (60ml — corregido, no 75ml) ---
  { nombre: "Tequila Shot", categoria: CATEGORIA_SHOTS, precioVenta: 3.0, receta: [r("Tequila", 60)] },
  { nombre: "Antioqueño Shot", categoria: CATEGORIA_SHOTS, precioVenta: 3.0, receta: [r("Antioqueño", 60)] },
  { nombre: "Vodka Shot", categoria: CATEGORIA_SHOTS, precioVenta: 3.0, receta: [r("Vodka", 60)] },
  { nombre: "Jägermeister Shot", categoria: CATEGORIA_SHOTS, precioVenta: 4.0, receta: [r("Jägermeister", 60)] },

  // --- Shots preparados (30ml = 1oz) ---
  { nombre: "Vodka picante", categoria: CATEGORIA_SHOTS_PREPARADOS, precioVenta: 4.0, receta: [r("Vodka", 30)] },
  { nombre: "Tentación Roja", categoria: CATEGORIA_SHOTS_PREPARADOS, precioVenta: 4.0, receta: [r("Vodka", 30)] },
  { nombre: "Pecado Tropical", categoria: CATEGORIA_SHOTS_PREPARADOS, precioVenta: 4.0, receta: [r("Vodka", 30)] },
  { nombre: "Deseo Oscuro", categoria: CATEGORIA_SHOTS_PREPARADOS, precioVenta: 4.0, receta: [r("Vodka", 30)] },
  { nombre: "Beso de Maracuyá", categoria: CATEGORIA_SHOTS_PREPARADOS, precioVenta: 4.0, receta: [r("Vodka", 30)] },
  { nombre: "Luna de Mango", categoria: CATEGORIA_SHOTS_PREPARADOS, precioVenta: 4.0, receta: [r("Vodka", 30)] },
  { nombre: "Fuego Secreto", categoria: CATEGORIA_SHOTS_PREPARADOS, precioVenta: 4.0, receta: [] }, // falta definir receta
  { nombre: "La Última y Nos Vamos", categoria: CATEGORIA_SHOTS_PREPARADOS, precioVenta: 4.0, receta: [r("Jägermeister", 30)] },

  // --- Cócteles — Suaves & Refrescantes (60ml licor base) ---
  { nombre: "Piña Colada", categoria: CATEGORIA_COCTELES_SUAVES, precioVenta: 5.0, receta: [r("Ron Castillo", 60)] },
  { nombre: "Paloma", categoria: CATEGORIA_COCTELES_SUAVES, precioVenta: 5.0, receta: [r("Tequila", 60)] },
  { nombre: "Paloma de Fresa", categoria: CATEGORIA_COCTELES_SUAVES, precioVenta: 6.0, receta: [r("Tequila", 60)] },
  { nombre: "Blue Lady", categoria: CATEGORIA_COCTELES_SUAVES, precioVenta: 5.0, receta: [r("Gin Under", 60)] },
  { nombre: "Mojito Blue", categoria: CATEGORIA_COCTELES_SUAVES, precioVenta: 6.0, receta: [r("Ron Castillo", 60)] },
  { nombre: "Mojito Maracuyá", categoria: CATEGORIA_COCTELES_SUAVES, precioVenta: 6.0, receta: [r("Ron Castillo", 60)] },
  { nombre: "Mojito Fresa", categoria: CATEGORIA_COCTELES_SUAVES, precioVenta: 6.0, receta: [r("Ron Castillo", 60)] },
  { nombre: "Mojito Mango", categoria: CATEGORIA_COCTELES_SUAVES, precioVenta: 6.0, receta: [r("Ron Castillo", 60)] },
  { nombre: "Mojito Frutos Rojos", categoria: CATEGORIA_COCTELES_SUAVES, precioVenta: 6.0, receta: [r("Ron Castillo", 60)] },
  { nombre: "Caipiroska de Limón", categoria: CATEGORIA_COCTELES_SUAVES, precioVenta: 5.0, receta: [r("Vodka", 60)] },
  { nombre: "Caipiroska de Fresa", categoria: CATEGORIA_COCTELES_SUAVES, precioVenta: 6.0, receta: [r("Vodka", 60)] },
  { nombre: "Daiquiri de Fresa", categoria: CATEGORIA_COCTELES_SUAVES, precioVenta: 5.0, receta: [r("Ron Castillo", 60)] },
  {
    nombre: "Corona Sunrise",
    categoria: CATEGORIA_COCTELES_SUAVES,
    precioVenta: 6.0,
    receta: [r("Tequila", 60), r("Corona 330ml", 1)], // supuesto: usa Corona 330ml
  },

  // --- Cócteles — Tropicales ---
  { nombre: "Barbie", categoria: CATEGORIA_COCTELES_TROPICALES, precioVenta: 6.0, receta: [r("Vodka", 60)] },
  { nombre: "Coco Sunset", categoria: CATEGORIA_COCTELES_TROPICALES, precioVenta: 5.0, receta: [r("Ron Castillo", 60)] },
  { nombre: "Blue Hawaii", categoria: CATEGORIA_COCTELES_TROPICALES, precioVenta: 6.0, receta: [r("Ron Castillo", 60)] },
  { nombre: "Sex on the Beach", categoria: CATEGORIA_COCTELES_TROPICALES, precioVenta: 6.0, receta: [r("Vodka", 60)] },
  { nombre: "Margarita Blue", categoria: CATEGORIA_COCTELES_TROPICALES, precioVenta: 6.0, receta: [r("Tequila", 60)] },
  { nombre: "Margarita Mango", categoria: CATEGORIA_COCTELES_TROPICALES, precioVenta: 6.0, receta: [r("Tequila", 60)] },
  { nombre: "Valentina Frozen", categoria: CATEGORIA_COCTELES_TROPICALES, precioVenta: 5.0, receta: [r("Tequila", 60)] },

  // --- Cócteles — Clásicos de Siempre ---
  { nombre: "Margarita", categoria: CATEGORIA_COCTELES_CLASICOS, precioVenta: 5.0, receta: [r("Tequila", 60)] },
  { nombre: "Cuba", categoria: CATEGORIA_COCTELES_CLASICOS, precioVenta: 5.0, receta: [r("Ron Castillo", 60)] },
  { nombre: "Mojito Clásico", categoria: CATEGORIA_COCTELES_CLASICOS, precioVenta: 6.0, receta: [r("Ron Castillo", 60)] },
  { nombre: "Tequila Sunrise", categoria: CATEGORIA_COCTELES_CLASICOS, precioVenta: 5.0, receta: [r("Tequila", 60)] },
  { nombre: "Calimocho", categoria: CATEGORIA_COCTELES_CLASICOS, precioVenta: 5.0, receta: [] }, // vino tinto no trackeado aún

  // --- Cócteles — Intensos ---
  { nombre: "Padrino", categoria: CATEGORIA_COCTELES_INTENSOS, precioVenta: 8.0, receta: [r("Something Special", 60)] },
  { nombre: "El Padrino Gold (Buchanan's Deluxe)", categoria: CATEGORIA_COCTELES_INTENSOS, precioVenta: 10.0, receta: [r("Buchanan's Deluxe", 60)] },
  { nombre: "El Padrino Gold (Johnnie Negro)", categoria: CATEGORIA_COCTELES_INTENSOS, precioVenta: 10.0, receta: [r("Johnnie Walker Negro", 60)] },
  { nombre: "El Padrino Gold (Old Parr)", categoria: CATEGORIA_COCTELES_INTENSOS, precioVenta: 10.0, receta: [r("Old Parr", 60)] },
  { nombre: "Whisky Tropical", categoria: CATEGORIA_COCTELES_INTENSOS, precioVenta: 8.0, receta: [r("Something Special", 60)] },
  { nombre: "Orgasmo", categoria: CATEGORIA_COCTELES_INTENSOS, precioVenta: 7.0, receta: [] }, // licor de café aún no trackeado
  { nombre: "Jäger Recargado", categoria: CATEGORIA_COCTELES_INTENSOS, precioVenta: 6.0, receta: [r("Jägermeister", 60)] },
  { nombre: "Margarita Corona", categoria: CATEGORIA_COCTELES_INTENSOS, precioVenta: 7.0, receta: [r("Tequila", 60), r("Coronita 210ml", 1)] },
  { nombre: "Valentina Corona", categoria: CATEGORIA_COCTELES_INTENSOS, precioVenta: 7.0, receta: [r("Tequila", 60), r("Coronita 210ml", 1)] },
  { nombre: "Martini", categoria: CATEGORIA_COCTELES_INTENSOS, precioVenta: 7.0, receta: [r("Gin Under", 60), r("Gancia Vermouth Extra Dry", 15)] },
  { nombre: "Espresso Martini", categoria: CATEGORIA_COCTELES_INTENSOS, precioVenta: 8.0, receta: [r("Vodka", 60)] },

  // --- Micheladas ---
  { nombre: "Michelada de limón", categoria: CATEGORIA_MICHELADAS, precioVenta: 5.0, receta: [r("Club 330ml", 1)] },
  { nombre: "Michelada de maracuyá", categoria: CATEGORIA_MICHELADAS, precioVenta: 6.0, receta: [r("Club 330ml", 1)] },
  { nombre: "Michelada de mango", categoria: CATEGORIA_MICHELADAS, precioVenta: 6.0, receta: [r("Club 330ml", 1)] },
  { nombre: "Michelada de maracumango", categoria: CATEGORIA_MICHELADAS, precioVenta: 6.0, receta: [r("Club 330ml", 1)] },
  { nombre: "Michelada Corona", categoria: CATEGORIA_MICHELADAS, precioVenta: 7.0, receta: [r("Corona 330ml", 1)] },

  // --- Mocktails (sin alcohol, sin receta trackeada) ---
  { nombre: "Mango Mint", categoria: CATEGORIA_MOCKTAILS, precioVenta: 4.0, receta: [] },
  { nombre: "Atardecer", categoria: CATEGORIA_MOCKTAILS, precioVenta: 4.0, receta: [] },
  { nombre: "Pasión Rosada", categoria: CATEGORIA_MOCKTAILS, precioVenta: 4.0, receta: [] },
  { nombre: "Dúo Tropical", categoria: CATEGORIA_MOCKTAILS, precioVenta: 4.0, receta: [] },
  { nombre: "Piñada", categoria: CATEGORIA_MOCKTAILS, precioVenta: 5.0, receta: [] },
  { nombre: "Strawberry Crush", categoria: CATEGORIA_MOCKTAILS, precioVenta: 4.0, receta: [] },

  // --- Modo Cero ---
  { nombre: "Michelada cero", categoria: CATEGORIA_MODO_CERO, precioVenta: 5.0, receta: [r("Corona Cero 330ml", 1)] },

  // --- Zona Refrescante (unidad) ---
  // El archivo no trae columna "Receta" para esta sección (a diferencia de Cervezas/Antojo),
  // así que se crean sin RecetaItem, tal como se documentó.
  { nombre: "Gaseosas", categoria: CATEGORIA_ZONA_REFRESCANTE, precioVenta: 1.0, receta: [] },
  { nombre: "Agua", categoria: CATEGORIA_ZONA_REFRESCANTE, precioVenta: 1.0, receta: [] },
  { nombre: "Güitig", categoria: CATEGORIA_ZONA_REFRESCANTE, precioVenta: 1.0, receta: [] },
  { nombre: "Pony malta", categoria: CATEGORIA_ZONA_REFRESCANTE, precioVenta: 1.0, receta: [] },
  { nombre: "V220", categoria: CATEGORIA_ZONA_REFRESCANTE, precioVenta: 1.0, receta: [] },
  { nombre: "Imperial de toronja", categoria: CATEGORIA_ZONA_REFRESCANTE, precioVenta: 1.5, receta: [] },

  // --- Jugos (sin receta trackeada — fruta fresca) ---
  { nombre: "Limonada clásica", categoria: CATEGORIA_JUGOS, precioVenta: 3.0, receta: [] },
  { nombre: "Limonada de fresa", categoria: CATEGORIA_JUGOS, precioVenta: 3.75, receta: [] },
  { nombre: "Limonada de coco", categoria: CATEGORIA_JUGOS, precioVenta: 3.75, receta: [] },
  { nombre: "Mango natural", categoria: CATEGORIA_JUGOS, precioVenta: 3.5, receta: [] },
  { nombre: "Brisa de maracuyá", categoria: CATEGORIA_JUGOS, precioVenta: 3.5, receta: [] },

  // --- Helados ---
  { nombre: "Maracuyá con sal", categoria: CATEGORIA_HELADOS, precioVenta: 1.0, receta: [] },
  { nombre: "Mango con sal", categoria: CATEGORIA_HELADOS, precioVenta: 1.0, receta: [] },
  { nombre: "Maracumango con sal", categoria: CATEGORIA_HELADOS, precioVenta: 1.0, receta: [] },
  { nombre: "Ice Prohibido", categoria: CATEGORIA_HELADOS, precioVenta: 2.0, receta: [] }, // no lleva licor

  // --- Antojo Rápido — Snacks ---
  { nombre: "Doritos", categoria: CATEGORIA_ANTOJO_SNACKS, precioVenta: 1.0, receta: [r("Doritos", 1)] },
  { nombre: "Ruffles", categoria: CATEGORIA_ANTOJO_SNACKS, precioVenta: 1.0, receta: [r("Ruffles", 1)] },
  { nombre: "Doritos Preparados", categoria: CATEGORIA_ANTOJO_SNACKS, precioVenta: 1.25, receta: [r("Doritos", 1)] },
  { nombre: "Volquetero", categoria: CATEGORIA_ANTOJO_SNACKS, precioVenta: 7.0, receta: [] },

  // --- Dulces ---
  // Igual que Zona Refrescante: sin columna "Receta" en el archivo, se crean sin RecetaItem.
  { nombre: "Chupetes", categoria: CATEGORIA_DULCES, precioVenta: 0.5, receta: [] },
  { nombre: "Chicles (2 unid.)", categoria: CATEGORIA_DULCES, precioVenta: 0.25, receta: [] },
];

async function upsertCategoria(nombre: string) {
  return prisma.categoria.upsert({
    where: { nombre },
    update: {},
    create: { nombre },
  });
}

async function upsertInsumo(data: { nombre: string; categoriaId: number; unidad: UnidadMedida }) {
  const existente = await prisma.insumo.findFirst({ where: { nombre: data.nombre } });
  if (existente) {
    return prisma.insumo.update({
      where: { id: existente.id },
      data: { categoriaId: data.categoriaId, unidad: data.unidad },
    });
  }
  return prisma.insumo.create({
    data: { ...data, costo: 0, stockActual: 0, stockMinimo: 0 },
  });
}

async function upsertProductoVenta(data: { nombre: string; categoriaId: number; precioVenta: number }) {
  const existente = await prisma.productoVenta.findFirst({ where: { nombre: data.nombre } });
  if (existente) {
    return prisma.productoVenta.update({
      where: { id: existente.id },
      data: { categoriaId: data.categoriaId, precioVenta: data.precioVenta },
    });
  }
  return prisma.productoVenta.create({ data });
}

async function upsertRecetaItem(productoVentaId: number, insumoId: number, cantidad: number) {
  return prisma.recetaItem.upsert({
    where: { productoVentaId_insumoId: { productoVentaId, insumoId } },
    update: { cantidad },
    create: { productoVentaId, insumoId, cantidad },
  });
}

async function main() {
  const categoriaIds = new Map<string, number>();
  for (const nombre of TODAS_LAS_CATEGORIAS) {
    const categoria = await upsertCategoria(nombre);
    categoriaIds.set(nombre, categoria.id);
  }

  const insumoIds = new Map<string, number>();
  for (const insumoSeed of INSUMOS) {
    const insumo = await upsertInsumo({
      nombre: insumoSeed.nombre,
      categoriaId: categoriaIds.get(insumoSeed.categoria)!,
      unidad: insumoSeed.unidad,
    });
    insumoIds.set(insumoSeed.nombre, insumo.id);
  }

  let recetaItemsCreados = 0;
  for (const productoSeed of PRODUCTOS) {
    const producto = await upsertProductoVenta({
      nombre: productoSeed.nombre,
      categoriaId: categoriaIds.get(productoSeed.categoria)!,
      precioVenta: productoSeed.precioVenta,
    });

    for (const item of productoSeed.receta) {
      const insumoId = insumoIds.get(item.insumo);
      if (!insumoId) {
        throw new Error(`Insumo "${item.insumo}" referenciado por "${productoSeed.nombre}" no existe`);
      }
      await upsertRecetaItem(producto.id, insumoId, item.cantidad);
      recetaItemsCreados += 1;
    }
  }

  // Elimina categorías del seed de prueba anterior que no coinciden con el menú real.
  // Solo se borran si ya no tienen insumos/productos asociados (deberían estar en 0 tras la migración).
  const categoriasEliminadas: string[] = [];
  for (const nombre of CATEGORIAS_OBSOLETAS) {
    const categoria = await prisma.categoria.findUnique({ where: { nombre } });
    if (!categoria) continue;
    const [insumosRestantes, productosRestantes] = await Promise.all([
      prisma.insumo.count({ where: { categoriaId: categoria.id } }),
      prisma.productoVenta.count({ where: { categoriaId: categoria.id } }),
    ]);
    if (insumosRestantes === 0 && productosRestantes === 0) {
      await prisma.categoria.delete({ where: { id: categoria.id } });
      categoriasEliminadas.push(nombre);
    } else {
      console.warn(
        `No se eliminó la categoría "${nombre}": todavía tiene ${insumosRestantes} insumo(s) y ${productosRestantes} producto(s).`,
      );
    }
  }

  const insumosPendientesDeCosto = await prisma.insumo.findMany({
    where: { costo: 0 },
    select: { nombre: true },
    orderBy: { nombre: "asc" },
  });

  console.log("=== Seed del menú real completado ===");
  console.log(`Categorías: ${TODAS_LAS_CATEGORIAS.length}`);
  console.log(`Insumos: ${INSUMOS.length}`);
  console.log(`Productos de venta: ${PRODUCTOS.length}`);
  console.log(`RecetaItem creados/actualizados: ${recetaItemsCreados}`);
  console.log(`Categorías obsoletas eliminadas: ${categoriasEliminadas.join(", ") || "(ninguna)"}`);
  console.log(`\nInsumos con costo pendiente (${insumosPendientesDeCosto.length}):`);
  for (const insumo of insumosPendientesDeCosto) {
    console.log(`  - ${insumo.nombre}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
