# Extracción del menú — La Posada del Palomo (versión final)

Mapeo de cada ítem del menú contra el modelo Insumo / ProductoVenta / RecetaItem. Todas las ambigüedades quedaron resueltas — lista para migrar. Los pocos supuestos menores que quedan (tamaños de botella no confirmados) están al final, sin bloquear nada.

Supuestos: rocas y base de cóctel = 60ml (2oz). Shots simples = 60ml (2oz, corregido). Shots preparados = 30ml (1oz). Botella = tamaño completo. Solo se trackea el licor base de cada cóctel — mixers/garnishes no descuentan stock.

---

## 1. Insumos a crear

### Cervezas (unidad)
| Insumo | Presentación | Nota |
|---|---|---|
| Club 850ml | botella | se vende al público |
| Club 550ml | botella | se vende al público |
| Club 330ml | botella | **no se vende al público** — solo se usa como base de micheladas |
| Pilsener 1000ml | botella | se vende al público |
| Pilsener 600ml | botella | se vende al público |
| Corona 330ml | botella | se vende al público |
| Corona en lata | lata | se vende al público |
| Coronita 210ml | botella | se vende al público |
| Corona Cero 330ml | botella | se vende al público |

### Licores (ml)
| Insumo | Tamaño de botella |
|---|---|
| Jägermeister | 700ml |
| Something Special | 750ml (también es la base de "Padrino" y "Whisky Tropical") |
| Johnnie Walker Rojo | 750ml |
| Johnnie Walker Negro | 750ml |
| Old Parr | 750ml |
| Buchanan's Deluxe | 750ml |
| Buchanan's Master | 750ml |
| Double Black | 750ml |
| Chivas Aged 12 Years | 750ml |
| Antioqueño | 750ml |
| Tequila | 750ml |
| Vodka | 750ml (no se vende embotellado al público, solo shots y cócteles) |
| Ron Castillo | 750ml (tamaño asumido, ver notas finales) |
| Gin Under | 750ml (tamaño asumido, ver notas finales) |
| Gancia Vermouth Extra Dry | 750ml (tamaño asumido, ver notas finales) |

### Snacks, dulces y refrescos (unidad)
Doritos, Ruffles, Chupetes, Chicles (paq. 2), Gaseosa (genérica), Agua, Güitig, Pony malta, V220, Imperial de toronja.

---

## 2. Productos de venta por categoría

### Cervezas
| Producto | Precio | Receta |
|---|---|---|
| Club 850ml | $3.75 | 1 unidad Club 850ml |
| Club 550ml | $3.00 | 1 unidad Club 550ml |
| Pilsener 1000ml | $3.25 | 1 unidad Pilsener 1000ml |
| Pilsener 600ml | $2.50 | 1 unidad Pilsener 600ml |
| Corona 330ml | $3.50 | 1 unidad Corona 330ml |
| Corona en lata | $2.50 | 1 unidad Corona lata |
| Coronita 210ml | $2.00 | 1 unidad Coronita 210ml |
| Corona Cero 330ml | $3.00 | 1 unidad Corona Cero 330ml |

### Combos
| Producto | Precio | Receta |
|---|---|---|
| 3 Club 850ml | $10.75 | 3 unidades Club 850ml |
| 3 Club 550ml | $8.50 | 3 unidades Club 550ml |
| 3 Pilsener 1000ml | $9.25 | 3 unidades Pilsener 1000ml |
| 3 Pilsener 600ml | $7.00 | 3 unidades Pilsener 600ml |
| 3 Coronas 330ml | $10.00 | 3 unidades Corona 330ml |
| 4 Coronas en lata | $9.50 | 4 unidades Corona lata |

### Licores a las rocas (60ml)
| Producto | Precio | Receta |
|---|---|---|
| Jägermeister Rocas | $5.00 | 60ml Jägermeister |
| Something Special Rocas | $5.00 | 60ml Something Special |
| Johnnie Rojo Rocas | $6.00 | 60ml Johnnie Walker Rojo |
| Johnnie Negro Rocas | $8.00 | 60ml Johnnie Walker Negro |
| Old Parr Rocas | $8.00 | 60ml Old Parr |
| Buchanan's Deluxe Rocas | $8.00 | 60ml Buchanan's Deluxe |
| Buchanan's Master Rocas | $9.00 | 60ml Buchanan's Master |
| Double Black Rocas | $9.00 | 60ml Double Black |
| Chivas Aged 12 Years Rocas | $9.00 | 60ml Chivas Aged 12 Years |

### Botellas (tamaño completo)
| Producto | Precio | Receta |
|---|---|---|
| Antioqueño Botella | $30.00 | 750ml Antioqueño |
| Tequila Botella | $35.00 | 750ml Tequila |
| Jägermeister Botella | $60.00 | 700ml Jägermeister |
| Something Special Botella | $50.00 | 750ml Something Special |
| Johnnie Rojo Botella | $65.00 | 750ml Johnnie Walker Rojo |
| Johnnie Negro Botella | $90.00 | 750ml Johnnie Walker Negro |
| Old Parr Botella | $90.00 | 750ml Old Parr |
| Buchanan's Deluxe Botella | $90.00 | 750ml Buchanan's Deluxe |
| Buchanan's Master Botella | $100.00 | 750ml Buchanan's Master |
| Double Black Botella | $100.00 | 750ml Double Black |
| Chivas Aged 12 Years Botella | $100.00 | 750ml Chivas Aged 12 Years |

### Shots (60ml — corregido, no 75ml)
| Producto | Precio | Receta |
|---|---|---|
| Tequila Shot | $3.00 | 60ml Tequila |
| Antioqueño Shot | $3.00 | 60ml Antioqueño |
| Vodka Shot | $3.00 | 60ml Vodka |
| Jägermeister Shot | $4.00 | 60ml Jägermeister |

### Shots preparados (30ml = 1oz)
| Producto | Precio | Receta |
|---|---|---|
| Vodka picante | $4.00 | 30ml Vodka |
| Tentación Roja | $4.00 | 30ml Vodka |
| Pecado Tropical | $4.00 | 30ml Vodka |
| Deseo Oscuro | $4.00 | 30ml Vodka |
| Beso de Maracuyá | $4.00 | 30ml Vodka |
| Luna de Mango | $4.00 | 30ml Vodka |
| Fuego Secreto | $4.00 | sin receta — falta definir |
| La Última y Nos Vamos | $4.00 | 30ml Jägermeister |

### Cócteles — Suaves & Refrescantes (60ml licor base)
| Producto | Precio | Receta |
|---|---|---|
| Piña Colada | $5.00 | 60ml Ron Castillo |
| Paloma | $5.00 | 60ml Tequila |
| Paloma de Fresa | $6.00 | 60ml Tequila |
| Blue Lady | $5.00 | 60ml Gin Under |
| Mojito Blue | $6.00 | 60ml Ron Castillo |
| Mojito Maracuyá | $6.00 | 60ml Ron Castillo |
| Mojito Fresa | $6.00 | 60ml Ron Castillo |
| Mojito Mango | $6.00 | 60ml Ron Castillo |
| Mojito Frutos Rojos | $6.00 | 60ml Ron Castillo |
| Caipiroska de Limón | $5.00 | 60ml Vodka |
| Caipiroska de Fresa | $6.00 | 60ml Vodka |
| Daiquiri de Fresa | $5.00 | 60ml Ron Castillo |
| Corona Sunrise | $6.00 | 60ml Tequila + 1 unidad Corona 330ml (supuesto) |

### Cócteles — Tropicales
| Producto | Precio | Receta |
|---|---|---|
| Barbie | $6.00 | 60ml Vodka |
| Coco Sunset | $5.00 | 60ml Ron Castillo |
| Blue Hawaii | $6.00 | 60ml Ron Castillo |
| Sex on the Beach | $6.00 | 60ml Vodka |
| Margarita Blue | $6.00 | 60ml Tequila |
| Margarita Mango | $6.00 | 60ml Tequila |
| Valentina Frozen | $5.00 | 60ml Tequila |

### Cócteles — Clásicos de Siempre
| Producto | Precio | Receta |
|---|---|---|
| Margarita | $5.00 | 60ml Tequila |
| Cuba | $5.00 | 60ml Ron Castillo |
| Mojito Clásico | $6.00 | 60ml Ron Castillo |
| Tequila Sunrise | $5.00 | 60ml Tequila |
| Calimocho | $5.00 | sin receta por el momento (vino tinto no trackeado aún) |

### Cócteles — Intensos
| Producto | Precio | Receta |
|---|---|---|
| Padrino | $8.00 | 60ml Something Special |
| El Padrino Gold (Buchanan's Deluxe) | $10.00 | 60ml Buchanan's Deluxe |
| El Padrino Gold (Johnnie Negro) | $10.00 | 60ml Johnnie Walker Negro |
| El Padrino Gold (Old Parr) | $10.00 | 60ml Old Parr |
| Whisky Tropical | $8.00 | 60ml Something Special |
| Orgasmo | $7.00 | sin receta por el momento (base conceptual: licor de café, aún no trackeado) |
| Jäger Recargado | $6.00 | 60ml Jägermeister |
| Margarita Corona | $7.00 | 60ml Tequila + 1 unidad Coronita 210ml |
| Valentina Corona | $7.00 | 60ml Tequila + 1 unidad Coronita 210ml |
| Martini | $7.00 | 60ml Gin Under + 15ml Gancia Vermouth |
| Espresso Martini | $8.00 | 60ml Vodka |

### Micheladas
| Producto | Precio | Receta |
|---|---|---|
| Michelada de limón | $5.00 | 1 unidad Club 330ml |
| Michelada de maracuyá | $6.00 | 1 unidad Club 330ml |
| Michelada de mango | $6.00 | 1 unidad Club 330ml |
| Michelada de maracumango | $6.00 | 1 unidad Club 330ml |
| Michelada Corona | $7.00 | 1 unidad Corona 330ml |

### Mocktails (sin alcohol, sin receta trackeada)
Mango Mint, Atardecer, Pasión Rosada, Dúo Tropical ($4.00 c/u), Piñada ($5.00), Strawberry Crush ($4.00).

### Modo Cero
Michelada cero — $5.00 — receta: 1 unidad Corona Cero 330ml.

### Zona Refrescante (unidad)
Gaseosas $1.00, Agua $1.00, Güitig $1.00, Pony malta $1.00, V220 $1.00, Imperial de toronja $1.50.

### Jugos (sin receta trackeada — fruta fresca)
Limonada clásica $3.00, Limonada de fresa $3.75, Limonada de coco $3.75, Mango natural $3.50, Brisa de maracuyá $3.50.

### Helados
Maracuyá con sal $1.00, Mango con sal $1.00, Maracumango con sal $1.00, Ice Prohibido $2.00 (sin receta — es solo un helado, no lleva licor).

### Antojo Rápido — Snacks
| Producto | Precio | Receta |
|---|---|---|
| Doritos | $1.00 | 1 unidad Doritos |
| Ruffles | $1.00 | 1 unidad Ruffles |
| Doritos Preparados | $1.25 | 1 unidad Doritos (chamoy/limón/sal sin trackear) |
| Volquetero | $7.00 | sin receta por el momento |

### Dulces
Chupetes $0.50, Chicles (2 unid.) $0.25.

---

## 3. Notas y supuestos menores (no bloquean la migración)

- **Tamaño de botella de Ron Castillo, Gin Under y Gancia Vermouth**: asumí 750ml (el estándar del resto de tu bar). Si alguno viene en otra presentación, se corrige después en la pantalla de insumos — no bloquea el seed.
- **Corona Sunrise**: asumí que usa Corona 330ml (no lata ni coronita).
- **Fuego Secreto**: queda sin receta hasta que definas qué lleva.
- **Orgasmo, Calimocho, Volquetero**: sin receta por ahora, tal como pediste — no descuentan stock hasta que decidas trackear sus ingredientes.
- **Costo de cada insumo**: no viene en el menú (es precio de venta al cliente). Lo completas tú en la pantalla de insumos, o me pasas la lista de costos y la incorporo.
- **Stock_actual inicial**: debe salir de un conteo físico real del bar — no lo voy a inventar, queda en 0 hasta que lo cargues.
