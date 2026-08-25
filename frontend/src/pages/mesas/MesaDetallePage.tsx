import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { ApiError } from "../../lib/api";
import { getSocket } from "../../lib/socket";
import { ds } from "../../lib/designSystem";
import type { ProductoVenta } from "../../types/inventario";
import { ESTADO_MESA_LABEL, METODOS_PAGO, nombreMesa, type ItemConsumo, type Mesa, type MetodoPago } from "../../types/mesas";

type Accion = null | "cerrar" | "dividir" | "unir";

interface FilaPago {
  metodoPago: MetodoPago | "";
  monto: string;
}

const badgeTonePorEstado: Record<Mesa["estado"], "free" | "occupied" | "warning"> = {
  LIBRE: "free",
  OCUPADA: "occupied",
  POR_COBRAR: "warning",
};

export function MesaDetallePage() {
  const { id } = useParams();
  const mesaId = Number(id);
  const api = useApi();
  const { Card, Button, Input, Select, Tabs, Modal, MenuItemRow, Badge } = ds();

  const [mesa, setMesa] = useState<Mesa | null>(null);
  const [otrasMesas, setOtrasMesas] = useState<Mesa[]>([]);
  const [productos, setProductos] = useState<ProductoVenta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [accion, setAccion] = useState<Accion>(null);
  const [procesando, setProcesando] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [entregandoId, setEntregandoId] = useState<number | null>(null);
  const [pagandoId, setPagandoId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [descuento, setDescuento] = useState("");
  const [pagosCierre, setPagosCierre] = useState<FilaPago[]>([{ metodoPago: "", monto: "" }]);
  const [itemParaPagar, setItemParaPagar] = useState<ItemConsumo | null>(null);
  const [itemsSeleccionados, setItemsSeleccionados] = useState<Set<number>>(new Set());
  const [mesaDestino, setMesaDestino] = useState("");
  const [mesaOrigen, setMesaOrigen] = useState("");

  async function cargarMesa() {
    try {
      const data = await api<Mesa>(`/mesas/${mesaId}`);
      setMesa(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cargar la mesa");
    } finally {
      setCargando(false);
    }
  }

  async function cargarOtrasMesas() {
    try {
      const data = await api<Mesa[]>("/mesas");
      setOtrasMesas(data.filter((m) => m.id !== mesaId));
    } catch {
      // no bloquea la pantalla principal si esto falla
    }
  }

  useEffect(() => {
    setCargando(true);
    cargarMesa();
    cargarOtrasMesas();
    api<ProductoVenta[]>("/productos-venta")
      .then(setProductos)
      .catch(() => undefined);

    const socket = getSocket();
    socket.emit("mesa:unirse", mesaId);

    const refrescar = () => {
      cargarMesa();
      cargarOtrasMesas();
    };
    const onMesaActualizada = (payload: { id: number }) => {
      if (payload.id === mesaId) cargarMesa();
      cargarOtrasMesas();
    };

    socket.on("cuenta:abierta", refrescar);
    socket.on("cuenta:item-agregado", refrescar);
    socket.on("cuenta:item-editado", refrescar);
    socket.on("cuenta:item-eliminado", refrescar);
    socket.on("cuenta:item-entregado", refrescar);
    socket.on("cuenta:item-pagado", refrescar);
    socket.on("cuenta:cerrada", refrescar);
    socket.on("mesa:actualizada", onMesaActualizada);

    return () => {
      socket.emit("mesa:salir", mesaId);
      socket.off("cuenta:abierta", refrescar);
      socket.off("cuenta:item-agregado", refrescar);
      socket.off("cuenta:item-editado", refrescar);
      socket.off("cuenta:item-eliminado", refrescar);
      socket.off("cuenta:item-entregado", refrescar);
      socket.off("cuenta:item-pagado", refrescar);
      socket.off("cuenta:cerrada", refrescar);
      socket.off("mesa:actualizada", onMesaActualizada);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesaId]);

  function cerrarPanel() {
    setAccion(null);
    setErrorAccion(null);
    setDescuento("");
    setPagosCierre([{ metodoPago: "", monto: "" }]);
    setItemsSeleccionados(new Set());
    setMesaDestino("");
    setMesaOrigen("");
  }

  function actualizarFilaPago(index: number, cambios: Partial<FilaPago>) {
    setPagosCierre((prev) => prev.map((fila, i) => (i === index ? { ...fila, ...cambios } : fila)));
  }

  function agregarFilaPago() {
    setPagosCierre((prev) => [...prev, { metodoPago: "", monto: "" }]);
  }

  function quitarFilaPago(index: number) {
    setPagosCierre((prev) => prev.filter((_, i) => i !== index));
  }

  async function abrirMesa() {
    setProcesando(true);
    setErrorAccion(null);
    try {
      await api(`/mesas/${mesaId}/abrir`, { method: "POST", body: {} });
      await cargarMesa();
      await cargarOtrasMesas();
    } catch (err) {
      setErrorAccion(err instanceof ApiError ? err.message : "No se pudo abrir la mesa");
    } finally {
      setProcesando(false);
    }
  }

  async function agregarProducto(producto: ProductoVenta) {
    const cuenta = mesa?.cuentaAbierta;
    if (!cuenta) return;
    setErrorAccion(null);
    const existente = cuenta.itemsConsumo.find((item) => item.productoVentaId === producto.id);
    try {
      if (existente) {
        await api(`/cuentas/${cuenta.id}/items/${existente.id}`, {
          method: "PUT",
          body: { cantidad: existente.cantidad + 1 },
        });
      } else {
        await api(`/cuentas/${cuenta.id}/items`, {
          method: "POST",
          body: { productoVentaId: producto.id, cantidad: 1 },
        });
      }
      await cargarMesa();
    } catch (err) {
      setErrorAccion(err instanceof ApiError ? err.message : "No se pudo agregar el producto");
    }
  }

  async function fijarCantidad(item: ItemConsumo, nuevaCantidad: number) {
    const cuenta = mesa?.cuentaAbierta;
    if (!cuenta) return;
    setErrorAccion(null);
    try {
      if (nuevaCantidad <= 0) {
        await api(`/cuentas/${cuenta.id}/items/${item.id}`, { method: "DELETE" });
      } else {
        await api(`/cuentas/${cuenta.id}/items/${item.id}`, { method: "PUT", body: { cantidad: nuevaCantidad } });
      }
      await cargarMesa();
    } catch (err) {
      setErrorAccion(err instanceof ApiError ? err.message : "No se pudo actualizar la cantidad");
    }
  }

  async function marcarEntregado(item: ItemConsumo) {
    setErrorAccion(null);
    setEntregandoId(item.id);
    try {
      await api(`/items-consumo/${item.id}/entregar`, { method: "PATCH" });
      await cargarMesa();
    } catch (err) {
      setErrorAccion(err instanceof ApiError ? err.message : "No se pudo marcar la entrega");
    } finally {
      setEntregandoId(null);
    }
  }

  async function marcarPagado(item: ItemConsumo, metodoPago: MetodoPago) {
    setErrorAccion(null);
    setPagandoId(item.id);
    try {
      await api(`/items-consumo/${item.id}/pagar`, { method: "PATCH", body: { metodoPago } });
      await cargarMesa();
      setItemParaPagar(null);
    } catch (err) {
      setErrorAccion(err instanceof ApiError ? err.message : "No se pudo marcar el pago");
    } finally {
      setPagandoId(null);
    }
  }

  async function deshacerEntrega(item: ItemConsumo) {
    setErrorAccion(null);
    setEntregandoId(item.id);
    try {
      await api(`/items-consumo/${item.id}/deshacer-entrega`, { method: "PATCH" });
      await cargarMesa();
    } catch (err) {
      setErrorAccion(err instanceof ApiError ? err.message : "No se pudo deshacer la entrega");
    } finally {
      setEntregandoId(null);
    }
  }

  async function deshacerPago(item: ItemConsumo) {
    setErrorAccion(null);
    setPagandoId(item.id);
    try {
      await api(`/items-consumo/${item.id}/deshacer-pago`, { method: "PATCH" });
      await cargarMesa();
    } catch (err) {
      setErrorAccion(err instanceof ApiError ? err.message : "No se pudo deshacer el pago");
    } finally {
      setPagandoId(null);
    }
  }

  async function confirmarCierre() {
    const cuenta = mesa?.cuentaAbierta;
    if (!cuenta) return;
    const descuentoNum = descuento ? Number(descuento) : 0;
    if (Number.isNaN(descuentoNum) || descuentoNum < 0) {
      setErrorAccion("El descuento debe ser un número mayor o igual a 0");
      return;
    }
    const pendiente = Number(cuenta.total) - cuenta.itemsConsumo.reduce(
      (acc, item) => acc + item.cantidadPagada * Number(item.precioUnitario),
      0,
    );
    if (descuentoNum > pendiente) {
      setErrorAccion("El descuento no puede ser mayor al monto pendiente de cobro");
      return;
    }
    const montoACobrar = pendiente - descuentoNum;
    const pagos = pagosCierre
      .filter((fila) => fila.metodoPago !== "" && fila.monto !== "")
      .map((fila) => ({ metodoPago: fila.metodoPago as MetodoPago, monto: Number(fila.monto) }));
    // Si ya se pago todo (o el descuento cubre el resto) no hace falta
    // ningun pago nuevo para cerrar.
    if (montoACobrar > 0.01) {
      if (pagos.length === 0 || pagos.some((p) => !(p.monto > 0))) {
        setErrorAccion("Agregá al menos un pago con método y monto mayor a 0");
        return;
      }
      const sumaPagos = pagos.reduce((acc, p) => acc + p.monto, 0);
      if (Math.abs(sumaPagos - montoACobrar) > 0.01) {
        setErrorAccion(
          `La suma de los pagos ($${sumaPagos.toFixed(2)}) debe ser igual al monto a cobrar ($${montoACobrar.toFixed(2)})`,
        );
        return;
      }
    }
    setProcesando(true);
    setErrorAccion(null);
    try {
      await api(`/cuentas/${cuenta.id}/cerrar`, {
        method: "POST",
        body: { pagos, descuento: descuentoNum || undefined },
      });
      cerrarPanel();
      await cargarMesa();
      await cargarOtrasMesas();
    } catch (err) {
      setErrorAccion(err instanceof ApiError ? err.message : "No se pudo cerrar la cuenta");
    } finally {
      setProcesando(false);
    }
  }

  async function confirmarDivision() {
    const cuenta = mesa?.cuentaAbierta;
    if (!cuenta || !mesaDestino || itemsSeleccionados.size === 0) return;
    setProcesando(true);
    setErrorAccion(null);
    try {
      await api(`/cuentas/${cuenta.id}/dividir`, {
        method: "POST",
        body: { mesaDestinoId: Number(mesaDestino), itemIds: Array.from(itemsSeleccionados) },
      });
      cerrarPanel();
      await cargarMesa();
      await cargarOtrasMesas();
    } catch (err) {
      setErrorAccion(err instanceof ApiError ? err.message : "No se pudo dividir la cuenta");
    } finally {
      setProcesando(false);
    }
  }

  async function confirmarUnion() {
    if (!mesaOrigen) return;
    setProcesando(true);
    setErrorAccion(null);
    try {
      await api(`/mesas/${mesaId}/unir`, { method: "POST", body: { mesaOrigenId: Number(mesaOrigen) } });
      cerrarPanel();
      await cargarMesa();
      await cargarOtrasMesas();
    } catch (err) {
      setErrorAccion(err instanceof ApiError ? err.message : "No se pudo unir la mesa");
    } finally {
      setProcesando(false);
    }
  }

  function alternarAccion(nueva: Exclude<Accion, null>) {
    setAccion(nueva);
    setErrorAccion(null);
  }

  function alternarSeleccion(itemId: number) {
    setItemsSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  const categorias = useMemo(() => {
    const nombres = new Set(productos.map((p) => p.categoria?.nombre ?? "Otros"));
    return ["todas", ...Array.from(nombres)];
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    const buscando = search.trim().length > 0;
    if (buscando) {
      const q = search.trim().toLowerCase();
      return productos.filter((p) => p.nombre.toLowerCase().includes(q));
    }
    if (categoria === "todas") return productos;
    return productos.filter((p) => (p.categoria?.nombre ?? "Otros") === categoria);
  }, [productos, search, categoria]);

  if (cargando) return <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Cargando…</p>;
  if (error || !mesa) return <p style={{ color: "var(--status-danger)", fontSize: 14 }}>{error ?? "Mesa no encontrada"}</p>;

  const cuenta = mesa.cuentaAbierta;
  const mesasConCuenta = otrasMesas.filter((m) => m.cuentaAbierta);
  const totalFixed = cuenta ? Number(cuenta.total).toFixed(2) : "0.00";
  const montoPagado = cuenta
    ? cuenta.itemsConsumo.reduce((acc, item) => acc + item.cantidadPagada * Number(item.precioUnitario), 0)
    : 0;
  const montoPendiente = cuenta ? Number(cuenta.total) - montoPagado : 0;
  const montoPendienteFixed = montoPendiente.toFixed(2);
  const descuentoCierreNum = descuento ? Number(descuento) : 0;
  const montoACobrar = montoPendiente - (Number.isFinite(descuentoCierreNum) ? descuentoCierreNum : 0);
  const faltaCobrar = montoACobrar > 0.01;
  const pagosCierreSuma = pagosCierre.reduce((acc, fila) => acc + (Number(fila.monto) || 0), 0);
  const pagosCierreCompletos = !faltaCobrar || pagosCierre.every((fila) => fila.metodoPago !== "" && Number(fila.monto) > 0);
  const pagosCierreSumaCoincide = !faltaCobrar || Math.abs(pagosCierreSuma - montoACobrar) < 0.01;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/mesas" style={{ color: "var(--text-secondary)", fontSize: 14, textDecoration: "none" }}>
          ← Volver a mesas
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 20, color: "var(--text-primary)" }}>
            {nombreMesa(mesa).toUpperCase()}
          </span>
          <Badge tone={badgeTonePorEstado[mesa.estado]}>{ESTADO_MESA_LABEL[mesa.estado]}</Badge>
        </div>
      </div>

      {!cuenta ? (
        <>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "16px 0", textAlign: "center" }}>
              <p style={{ color: "var(--text-secondary)", margin: 0 }}>Esta mesa está libre.</p>
              <Button variant="primary" size="l" onClick={abrirMesa} disabled={procesando}>
                {procesando ? "Abriendo…" : "Abrir mesa"}
              </Button>
            </div>
          </Card>

          {mesasConCuenta.length > 0 && (
            <Card>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "var(--tracking-caps)" }}>
                  Traer cuenta de otra mesa
                </div>
                <Select
                  value={mesaOrigen}
                  onChange={(event) => setMesaOrigen(event.target.value)}
                  options={[
                    { value: "", label: "Elegir mesa…" },
                    ...mesasConCuenta.map((m) => ({
                      value: String(m.id),
                      label: `${nombreMesa(m)} ($${Number(m.cuentaAbierta!.total).toFixed(2)})`,
                    })),
                  ]}
                />
                <Button variant="outline" disabled={!mesaOrigen || procesando} onClick={confirmarUnion}>
                  Traer aquí
                </Button>
                {errorAccion && <p style={{ color: "var(--status-danger)", fontSize: 13 }}>{errorAccion}</p>}
              </div>
            </Card>
          )}
        </>
      ) : (
        <div style={{ display: "flex", gap: 24, height: "100%", minHeight: 0, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 360px", minWidth: 0, display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
            <div style={{ marginBottom: 14, maxWidth: 360 }}>
              <Input
                label="Buscar producto"
                placeholder="Ej. cerveza, alitas, hora karaoke"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            {search.trim().length === 0 && (
              <div style={{ marginBottom: 14, overflowX: "auto" }}>
                <Tabs
                  items={categorias.map((c) => ({ value: c, label: c === "todas" ? "Todas" : c }))}
                  active={categoria}
                  onChange={setCategoria}
                />
              </div>
            )}

            <div style={{ flex: 1, overflowY: "auto", minHeight: 0, paddingRight: 4 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                {productosFiltrados.map((producto) => (
                  <button
                    key={producto.id}
                    onClick={() => agregarProducto(producto)}
                    style={{
                      textAlign: "left",
                      padding: "18px 16px",
                      borderRadius: "var(--radius-m)",
                      background: "var(--surface-2)",
                      border: "1px solid var(--border-subtle)",
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                      minHeight: 80,
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: 8 }}>
                      {producto.nombre}
                    </div>
                    <div style={{ color: "var(--color-gold)", fontWeight: 800, fontSize: 15 }}>
                      ${Number(producto.precioVenta).toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ flex: "0 1 340px", minWidth: 300 }}>
            <Card style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--text-primary)", marginBottom: 4, fontSize: 18 }}>
                Cuenta actual
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 12 }}>{nombreMesa(mesa)}</div>

              {errorAccion && accion === null && (
                <p style={{ color: "var(--status-danger)", fontSize: 13, marginBottom: 8 }}>{errorAccion}</p>
              )}

              <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                {cuenta.itemsConsumo.length === 0 ? (
                  <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "20px 0", textAlign: "center" }}>
                    Aún no hay productos agregados.
                  </div>
                ) : (
                  cuenta.itemsConsumo.map((item, index) => {
                    const totalEntregable = item.cantidad * item.productoVenta.unidadesPorEntrega;
                    const completoEntrega = item.cantidadEntregada >= totalEntregable;
                    const completoPago = item.cantidadPagada >= item.cantidad;
                    const unidadPago = item.productoVenta.categoria.nombre.toLowerCase();
                    return (
                      <div
                        key={item.id}
                        style={
                          index > 0
                            ? { borderTop: "1px solid var(--border-subtle)", marginTop: 8, paddingTop: 8 }
                            : undefined
                        }
                      >
                        <div className="item-consumo-row">
                          <MenuItemRow
                            name={item.productoVenta.nombre}
                            price={Number(item.precioUnitario)}
                            qty={item.cantidad}
                            onQtyChange={(nuevaCantidad) => fijarCantidad(item, nuevaCantidad)}
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 8,
                            padding: "0 4px 4px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: completoEntrega ? "var(--status-success)" : "var(--text-muted)",
                            }}
                          >
                            {completoEntrega ? "✓ Entregado" : `${item.cantidadEntregada} de ${totalEntregable} entregadas`}
                          </span>
                          <div style={{ display: "flex", gap: 6 }}>
                            <Button
                              variant="ghost"
                              size="s"
                              disabled={item.cantidadEntregada <= 0 || entregandoId === item.id}
                              onClick={() => deshacerEntrega(item)}
                            >
                              -1
                            </Button>
                            <Button
                              variant="ghost"
                              size="s"
                              disabled={completoEntrega || entregandoId === item.id}
                              onClick={() => marcarEntregado(item)}
                            >
                              {entregandoId === item.id ? "…" : "+1 entregada"}
                            </Button>
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 8,
                            padding: "0 4px 12px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: completoPago ? "var(--status-success)" : "var(--text-muted)",
                            }}
                          >
                            {completoPago ? "✓ Pagado" : `${item.cantidadPagada} de ${item.cantidad} ${unidadPago} pagados`}
                          </span>
                          <div style={{ display: "flex", gap: 6 }}>
                            <Button
                              variant="ghost"
                              size="s"
                              disabled={item.cantidadPagada <= 0 || pagandoId === item.id}
                              onClick={() => deshacerPago(item)}
                            >
                              -1
                            </Button>
                            <Button
                              variant="ghost"
                              size="s"
                              disabled={completoPago || pagandoId === item.id}
                              onClick={() => setItemParaPagar(item)}
                            >
                              {pagandoId === item.id ? "…" : "+1 pagado"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", marginTop: 8, paddingTop: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-muted)" }}>
                  <span>Total consumido</span>
                  <span>${totalFixed}</span>
                </div>
                {montoPagado > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--status-success)" }}>
                    <span>Ya pagado</span>
                    <span>-${montoPagado.toFixed(2)}</span>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 0 0",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    fontSize: 17,
                  }}
                >
                  <span>{montoPagado > 0 ? "Pendiente por cobrar" : "Total"}</span>
                  <span>${montoPendienteFixed}</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Button variant="ghost" size="l" onClick={() => alternarAccion("dividir")} disabled={cuenta.itemsConsumo.length === 0}>
                  Dividir cuenta
                </Button>
                <Button variant="ghost" size="l" onClick={() => alternarAccion("unir")}>
                  Unir mesas
                </Button>
                <Button
                  variant="primary"
                  size="l"
                  onClick={() => {
                    setPagosCierre([{ metodoPago: "", monto: montoPendienteFixed }]);
                    alternarAccion("cerrar");
                  }}
                >
                  Cerrar cuenta
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      <Modal open={accion === "cerrar"} title="Cerrar cuenta" onClose={cerrarPanel}>
        {cuenta && (
          <div style={{ minWidth: 320 }}>
            <div style={{ color: "var(--text-secondary)", marginBottom: 16 }}>
              Cobrar ${montoPendienteFixed} de {nombreMesa(mesa)} y liberar la mesa.
              {montoPagado > 0 && (
                <>
                  {" "}
                  (Total ${totalFixed}, ya se pagaron ${montoPagado.toFixed(2)} de la cuenta.)
                </>
              )}
            </div>

            {faltaCobrar && (
              <div style={{ marginBottom: 10, display: "flex", flexDirection: "column", gap: 10 }}>
                {pagosCierre.map((fila, index) => (
                  <div key={index} style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                    <div style={{ flex: 1 }}>
                      <Select
                        label={index === 0 ? "Método" : undefined}
                        value={fila.metodoPago}
                        onChange={(event) => actualizarFilaPago(index, { metodoPago: event.target.value as MetodoPago })}
                        options={[
                          { value: "", label: "Elegir…" },
                          ...METODOS_PAGO.map((m) => ({ value: m.valor, label: m.label })),
                        ]}
                      />
                    </div>
                    <div style={{ width: 110 }}>
                      <Input
                        label={index === 0 ? "Monto" : undefined}
                        type="number"
                        value={fila.monto}
                        onChange={(event) => actualizarFilaPago(index, { monto: event.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    {pagosCierre.length > 1 && (
                      <Button variant="ghost" size="s" onClick={() => quitarFilaPago(index)}>
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="ghost" size="s" onClick={agregarFilaPago}>
                  + Agregar otro método (pago mixto)
                </Button>
                <div style={{ fontSize: 12, color: pagosCierreSumaCoincide ? "var(--status-success)" : "var(--text-muted)" }}>
                  Asignado ${pagosCierreSuma.toFixed(2)} de ${montoACobrar.toFixed(2)} a cobrar
                </div>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <Input
                label="Descuento (opcional)"
                type="number"
                value={descuento}
                onChange={(event) => {
                  const value = event.target.value;
                  setDescuento(value);
                  setPagosCierre((prev) => {
                    if (prev.length !== 1) return prev;
                    const nuevoDescuento = value ? Number(value) : 0;
                    const nuevoMonto = montoPendiente - (Number.isFinite(nuevoDescuento) ? nuevoDescuento : 0);
                    return [{ ...prev[0], monto: nuevoMonto.toFixed(2) }];
                  });
                }}
                placeholder="0.00"
              />
            </div>

            {errorAccion && <p style={{ color: "var(--status-danger)", fontSize: 13, marginBottom: 12 }}>{errorAccion}</p>}

            <div style={{ display: "flex", gap: 10 }}>
              <Button
                variant="primary"
                disabled={!pagosCierreCompletos || !pagosCierreSumaCoincide || procesando}
                onClick={confirmarCierre}
              >
                {procesando ? "Cerrando…" : "Confirmar"}
              </Button>
              <Button variant="ghost" onClick={cerrarPanel}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={itemParaPagar !== null} title="Confirmar pago" onClose={() => setItemParaPagar(null)}>
        {itemParaPagar && (
          <div style={{ minWidth: 280 }}>
            <div style={{ color: "var(--text-secondary)", marginBottom: 16 }}>
              ¿Cómo se pagó "{itemParaPagar.productoVenta.nombre}"? (${Number(itemParaPagar.precioUnitario).toFixed(2)})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
              {METODOS_PAGO.map((m) => (
                <Button
                  key={m.valor}
                  variant="secondary"
                  size="l"
                  disabled={pagandoId === itemParaPagar.id}
                  onClick={() => marcarPagado(itemParaPagar, m.valor)}
                >
                  {pagandoId === itemParaPagar.id ? "…" : m.label}
                </Button>
              ))}
            </div>
            <Button variant="ghost" onClick={() => setItemParaPagar(null)}>
              Cancelar
            </Button>
          </div>
        )}
      </Modal>

      <Modal open={accion === "dividir"} title="Dividir cuenta" onClose={cerrarPanel}>
        {cuenta && (
          <div style={{ minWidth: 320, maxWidth: 400 }}>
            <div style={{ color: "var(--text-secondary)", marginBottom: 12 }}>Elegí los productos a mover:</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto", marginBottom: 16 }}>
              {cuenta.itemsConsumo.map((item) => (
                <label key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--text-primary)" }}>
                  <input
                    type="checkbox"
                    checked={itemsSeleccionados.has(item.id)}
                    onChange={() => alternarSeleccion(item.id)}
                  />
                  {item.productoVenta.nombre} × {item.cantidad} (${Number(item.subtotal).toFixed(2)})
                </label>
              ))}
            </div>
            <div style={{ marginBottom: 16 }}>
              <Select
                label="Mesa destino"
                value={mesaDestino}
                onChange={(event) => setMesaDestino(event.target.value)}
                options={[
                  { value: "", label: "Mesa destino…" },
                  ...otrasMesas.map((m) => ({
                    value: String(m.id),
                    label: `${nombreMesa(m)} (${m.cuentaAbierta ? `ocupada, $${Number(m.cuentaAbierta.total).toFixed(2)}` : "libre"})`,
                  })),
                ]}
              />
            </div>
            {errorAccion && <p style={{ color: "var(--status-danger)", fontSize: 13, marginBottom: 12 }}>{errorAccion}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <Button variant="primary" disabled={!mesaDestino || itemsSeleccionados.size === 0 || procesando} onClick={confirmarDivision}>
                {procesando ? "Moviendo…" : "Mover seleccionados"}
              </Button>
              <Button variant="ghost" onClick={cerrarPanel}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={accion === "unir"} title="Unir mesas" onClose={cerrarPanel}>
        <div style={{ minWidth: 320 }}>
          <div style={{ color: "var(--text-secondary)", marginBottom: 12 }}>Traer cuenta de otra mesa:</div>
          {mesasConCuenta.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>No hay otra mesa ocupada para unir.</p>
          ) : (
            <>
              <div style={{ marginBottom: 16 }}>
                <Select
                  value={mesaOrigen}
                  onChange={(event) => setMesaOrigen(event.target.value)}
                  options={[
                    { value: "", label: "Elegir mesa…" },
                    ...mesasConCuenta.map((m) => ({
                      value: String(m.id),
                      label: `${nombreMesa(m)} ($${Number(m.cuentaAbierta!.total).toFixed(2)})`,
                    })),
                  ]}
                />
              </div>
              {errorAccion && <p style={{ color: "var(--status-danger)", fontSize: 13, marginBottom: 12 }}>{errorAccion}</p>}
              <div style={{ display: "flex", gap: 10 }}>
                <Button variant="primary" disabled={!mesaOrigen || procesando} onClick={confirmarUnion}>
                  {procesando ? "Uniendo…" : "Unir aquí"}
                </Button>
                <Button variant="ghost" onClick={cerrarPanel}>
                  Cancelar
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
