import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useApi } from "../../hooks/useApi";
import { ApiError } from "../../lib/api";
import { METODO_PAGO_LABEL, type CierreCaja } from "../../types/reportes";
import { METODOS_PAGO, type MetodoPago } from "../../types/mesas";
import { CATEGORIAS_GASTO, CATEGORIA_GASTO_LABEL, type CategoriaGasto, type Gasto, type CierreDeCaja } from "../../types/caja";
import { Card } from "../../components/ui/Card";
import { Input, Select } from "../../components/ui/Input";
import { Field } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { ConfirmButton } from "../../components/ui/ConfirmButton";

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function CierreCajaReporte() {
  const api = useApi();
  const [fecha, setFecha] = useState(hoyISO());

  // Ventas del dia (reporte existente).
  const [datos, setDatos] = useState<CierreCaja | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gastos del dia.
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [cargandoGastos, setCargandoGastos] = useState(true);
  const [errorGastos, setErrorGastos] = useState<string | null>(null);
  const [mostrarFormGasto, setMostrarFormGasto] = useState(false);
  const [conceptoGasto, setConceptoGasto] = useState("");
  const [categoriaGasto, setCategoriaGasto] = useState<CategoriaGasto>("OTRO");
  const [montoGasto, setMontoGasto] = useState("");
  const [metodoGasto, setMetodoGasto] = useState<MetodoPago>("EFECTIVO");
  const [guardandoGasto, setGuardandoGasto] = useState(false);

  // Cuadre de caja (cierre) del dia.
  const [cierre, setCierre] = useState<CierreDeCaja | null>(null);
  const [cargandoCierre, setCargandoCierre] = useState(true);
  const [errorCierre, setErrorCierre] = useState<string | null>(null);
  const [montoContado, setMontoContado] = useState("");
  const [notasCierre, setNotasCierre] = useState("");
  const [guardandoCierre, setGuardandoCierre] = useState(false);
  const [editandoCierre, setEditandoCierre] = useState(false);

  const cargarGastos = useCallback(async () => {
    setCargandoGastos(true);
    setErrorGastos(null);
    try {
      setGastos(await api<Gasto[]>(`/gastos?fecha=${fecha}`));
    } catch (err) {
      setErrorGastos(err instanceof ApiError ? err.message : "No se pudieron cargar los gastos");
    } finally {
      setCargandoGastos(false);
    }
  }, [api, fecha]);

  const cargarCierre = useCallback(async () => {
    setCargandoCierre(true);
    setErrorCierre(null);
    try {
      const data = await api<CierreDeCaja>(`/cierres-caja/preview?fecha=${fecha}`);
      setCierre(data);
      setMontoContado(data.montoContado ?? "");
      setNotasCierre(data.notas ?? "");
      setEditandoCierre(!data.cerrado);
    } catch (err) {
      setErrorCierre(err instanceof ApiError ? err.message : "No se pudo cargar el cuadre de caja");
    } finally {
      setCargandoCierre(false);
    }
  }, [api, fecha]);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(null);

    api<CierreCaja>(`/reportes/cierre-caja?fecha=${fecha}`)
      .then((data) => activo && setDatos(data))
      .catch((err) => activo && setError(err instanceof ApiError ? err.message : "No se pudo cargar el cierre de caja"))
      .finally(() => activo && setCargando(false));

    return () => {
      activo = false;
    };
  }, [api, fecha]);

  useEffect(() => {
    cargarGastos();
  }, [cargarGastos]);

  useEffect(() => {
    cargarCierre();
  }, [cargarCierre]);

  async function agregarGasto(event: FormEvent) {
    event.preventDefault();
    const monto = Number(montoGasto);
    if (!conceptoGasto.trim() || !(monto > 0)) return;

    setGuardandoGasto(true);
    setErrorGastos(null);
    try {
      await api("/gastos", {
        method: "POST",
        body: { concepto: conceptoGasto.trim(), categoria: categoriaGasto, monto, metodoPago: metodoGasto, fecha },
      });
      setConceptoGasto("");
      setMontoGasto("");
      setCategoriaGasto("OTRO");
      setMetodoGasto("EFECTIVO");
      setMostrarFormGasto(false);
      await Promise.all([cargarGastos(), cargarCierre()]);
    } catch (err) {
      setErrorGastos(err instanceof ApiError ? err.message : "No se pudo guardar el gasto");
    } finally {
      setGuardandoGasto(false);
    }
  }

  async function eliminarGasto(id: number) {
    try {
      await api(`/gastos/${id}`, { method: "DELETE" });
      await Promise.all([cargarGastos(), cargarCierre()]);
    } catch (err) {
      setErrorGastos(err instanceof ApiError ? err.message : "No se pudo eliminar el gasto");
    }
  }

  async function guardarCierre(event: FormEvent) {
    event.preventDefault();
    const monto = Number(montoContado);
    if (!(monto >= 0)) return;

    setGuardandoCierre(true);
    setErrorCierre(null);
    try {
      const data = await api<CierreDeCaja>("/cierres-caja", {
        method: "POST",
        body: { fecha, montoContado: monto, notas: notasCierre.trim() || undefined },
      });
      setCierre(data);
      setEditandoCierre(false);
    } catch (err) {
      setErrorCierre(err instanceof ApiError ? err.message : "No se pudo guardar el cierre de caja");
    } finally {
      setGuardandoCierre(false);
    }
  }

  const totalGastosDelDia = gastos.reduce((acc, g) => acc + Number(g.monto), 0);

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-texto">Total de ventas diario</h2>
          <Input type="date" value={fecha} max={hoyISO()} onChange={(event) => setFecha(event.target.value)} />
        </div>

        {error && <p className="text-sm text-rojo">{error}</p>}

        {cargando ? (
          <p className="text-sm text-texto-secundario">Cargando…</p>
        ) : datos ? (
          <>
            <div className="flex flex-col items-center gap-1 rounded-md bg-black/20 py-6 text-center">
              <span className="text-4xl font-bold text-dorado">${Number(datos.totalVendido).toFixed(2)}</span>
              <span className="text-sm text-texto-secundario">
                {datos.cantidadCuentas} cuenta{datos.cantidadCuentas === 1 ? "" : "s"} cerrada
                {datos.cantidadCuentas === 1 ? "" : "s"}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {datos.desglosePorMetodoPago.map((fila) => (
                <div key={fila.metodoPago} className="rounded-md bg-black/20 p-4">
                  <p className="text-sm text-texto-secundario">{METODO_PAGO_LABEL[fila.metodoPago]}</p>
                  <p className="text-xl font-semibold text-texto">${Number(fila.total).toFixed(2)}</p>
                  <p className="text-xs text-texto-secundario">
                    {fila.cantidadPagos} pago{fila.cantidadPagos === 1 ? "" : "s"}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </Card>

      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-texto">Gastos del día</h2>
          <Button type="button" variant="secondary" onClick={() => setMostrarFormGasto((v) => !v)}>
            {mostrarFormGasto ? "Cancelar" : "+ Agregar gasto"}
          </Button>
        </div>

        {errorGastos && <p className="text-sm text-rojo">{errorGastos}</p>}

        {mostrarFormGasto && (
          <form onSubmit={agregarGasto} className="grid gap-3 rounded-md bg-black/20 p-4 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <Field label="Concepto" htmlFor="gasto-concepto">
                <Input
                  id="gasto-concepto"
                  value={conceptoGasto}
                  onChange={(event) => setConceptoGasto(event.target.value)}
                  placeholder="Ej. sueldo mesero, hielo comprado de urgencia..."
                  required
                />
              </Field>
            </div>
            <Field label="Categoría" htmlFor="gasto-categoria">
              <Select
                id="gasto-categoria"
                value={categoriaGasto}
                onChange={(event) => setCategoriaGasto(event.target.value as CategoriaGasto)}
              >
                {CATEGORIAS_GASTO.map((c) => (
                  <option key={c.valor} value={c.valor}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Monto" htmlFor="gasto-monto">
              <Input
                id="gasto-monto"
                type="number"
                min="0.01"
                step="0.01"
                value={montoGasto}
                onChange={(event) => setMontoGasto(event.target.value)}
                required
              />
            </Field>
            <Field label="Método" htmlFor="gasto-metodo">
              <Select
                id="gasto-metodo"
                value={metodoGasto}
                onChange={(event) => setMetodoGasto(event.target.value as MetodoPago)}
              >
                {METODOS_PAGO.map((m) => (
                  <option key={m.valor} value={m.valor}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="sm:col-span-4">
              <Button type="submit" disabled={guardandoGasto}>
                {guardandoGasto ? "Guardando…" : "Guardar gasto"}
              </Button>
            </div>
          </form>
        )}

        {cargandoGastos ? (
          <p className="text-sm text-texto-secundario">Cargando…</p>
        ) : gastos.length === 0 ? (
          <p className="text-sm text-texto-secundario">No hay gastos registrados este día.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {gastos.map((g) => (
              <div key={g.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-black/20 p-3">
                <div>
                  <p className="text-sm font-medium text-texto">{g.concepto}</p>
                  <p className="text-xs text-texto-secundario">
                    {CATEGORIA_GASTO_LABEL[g.categoria]} · {METODO_PAGO_LABEL[g.metodoPago]}
                    {g.usuario ? ` · ${g.usuario.nombre}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-rojo">-${Number(g.monto).toFixed(2)}</span>
                  <ConfirmButton onConfirm={() => eliminarGasto(g.id)} label="Eliminar" />
                </div>
              </div>
            ))}
            <div className="flex justify-end pt-2 text-sm font-semibold text-texto">
              Total gastado: ${totalGastosDelDia.toFixed(2)}
            </div>
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-texto">Cuadre de caja</h2>

        {errorCierre && <p className="text-sm text-rojo">{errorCierre}</p>}

        {cargandoCierre ? (
          <p className="text-sm text-texto-secundario">Cargando…</p>
        ) : cierre ? (
          <>
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-md bg-black/20 p-3">
                <p className="text-xs text-texto-secundario">Monto inicial (caja anterior)</p>
                <p className="text-lg font-semibold text-texto">${Number(cierre.montoInicial).toFixed(2)}</p>
              </div>
              <div className="rounded-md bg-black/20 p-3">
                <p className="text-xs text-texto-secundario">Ventas en efectivo</p>
                <p className="text-lg font-semibold text-texto">${Number(cierre.ventasEfectivo).toFixed(2)}</p>
              </div>
              <div className="rounded-md bg-black/20 p-3">
                <p className="text-xs text-texto-secundario">Gastos en efectivo</p>
                <p className="text-lg font-semibold text-rojo">-${Number(cierre.gastosEfectivo).toFixed(2)}</p>
              </div>
              <div className="rounded-md bg-black/20 p-3">
                <p className="text-xs text-texto-secundario">Efectivo esperado en caja</p>
                <p className="text-lg font-semibold text-dorado">${Number(cierre.montoEsperado).toFixed(2)}</p>
              </div>
            </div>

            {cierre.cerrado && !editandoCierre ? (
              <div className="flex flex-col items-center gap-3 rounded-lg bg-black/20 p-6 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs uppercase tracking-wide text-texto-secundario">Contado en caja</span>
                  <span className="text-3xl font-bold text-texto">${Number(cierre.montoContado).toFixed(2)}</span>
                </div>

                <span
                  className={`inline-flex items-center rounded-full px-4 py-1 text-sm font-semibold ${
                    Number(cierre.diferencia) === 0
                      ? "bg-white/10 text-texto-secundario"
                      : Number(cierre.diferencia) < 0
                        ? "bg-rojo/15 text-rojo"
                        : "bg-dorado/15 text-dorado"
                  }`}
                >
                  {Number(cierre.diferencia) > 0 ? "+" : ""}
                  ${Number(cierre.diferencia).toFixed(2)}
                  {Number(cierre.diferencia) < 0 ? " · falta" : Number(cierre.diferencia) > 0 ? " · sobra" : " · cuadrado"}
                </span>

                {(cierre.notas || cierre.usuario) && (
                  <div className="flex flex-col items-center gap-0.5 text-xs text-texto-secundario">
                    {cierre.notas && <p>Notas: {cierre.notas}</p>}
                    {cierre.usuario && <p>Cerrado por {cierre.usuario.nombre}</p>}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setEditandoCierre(true)}
                  className="mt-1 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-sm font-medium text-texto backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  Corregir cierre
                </button>
              </div>
            ) : (
              <form onSubmit={guardarCierre} className="grid gap-3 sm:grid-cols-3">
                <Field label="Efectivo contado en caja" htmlFor="cierre-contado">
                  <Input
                    id="cierre-contado"
                    type="number"
                    min="0"
                    step="0.01"
                    value={montoContado}
                    onChange={(event) => setMontoContado(event.target.value)}
                    required
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Notas (opcional)" htmlFor="cierre-notas">
                    <Input
                      id="cierre-notas"
                      value={notasCierre}
                      onChange={(event) => setNotasCierre(event.target.value)}
                      //placeholder="Ej. faltaron $5, se le prestó a un mesero..."
                    />
                  </Field>
                </div>
                <div className="flex items-center gap-2 sm:col-span-3">
                  <Button type="submit" disabled={guardandoCierre}>
                    {guardandoCierre ? "Guardando…" : cierre.cerrado ? "Guardar corrección" : "Cerrar caja del día"}
                  </Button>
                  {cierre.cerrado && (
                    <Button type="button" variant="ghost" onClick={() => setEditandoCierre(false)}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            )}
          </>
        ) : null}
      </Card>
    </div>
  );
}
