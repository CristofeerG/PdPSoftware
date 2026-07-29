--
-- PostgreSQL database dump
--

\restrict 24PRpLQIwKGv4yYdPIocdfjiByC34cM2Kf2jxnWIaYrdOUONGD7NgbGzZPcjtsF

-- Dumped from database version 17.9
-- Dumped by pg_dump version 17.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS pdp_db;
--
-- Name: pdp_db; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE pdp_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Spanish_Spain.1252';


ALTER DATABASE pdp_db OWNER TO postgres;

\unrestrict 24PRpLQIwKGv4yYdPIocdfjiByC34cM2Kf2jxnWIaYrdOUONGD7NgbGzZPcjtsF
\connect pdp_db
\restrict 24PRpLQIwKGv4yYdPIocdfjiByC34cM2Kf2jxnWIaYrdOUONGD7NgbGzZPcjtsF

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: estado_cuenta; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_cuenta AS ENUM (
    'ABIERTA',
    'CERRADA'
);


ALTER TYPE public.estado_cuenta OWNER TO postgres;

--
-- Name: estado_mesa; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_mesa AS ENUM (
    'LIBRE',
    'OCUPADA',
    'POR_COBRAR'
);


ALTER TYPE public.estado_mesa OWNER TO postgres;

--
-- Name: metodo_pago; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.metodo_pago AS ENUM (
    'EFECTIVO',
    'TARJETA',
    'TRANSFERENCIA'
);


ALTER TYPE public.metodo_pago OWNER TO postgres;

--
-- Name: rol_usuario; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.rol_usuario AS ENUM (
    'ADMIN',
    'MESERO'
);


ALTER TYPE public.rol_usuario OWNER TO postgres;

--
-- Name: tipo_movimiento; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_movimiento AS ENUM (
    'ENTRADA',
    'SALIDA',
    'AJUSTE'
);


ALTER TYPE public.tipo_movimiento OWNER TO postgres;

--
-- Name: unidad_medida; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.unidad_medida AS ENUM (
    'ML',
    'UNIDAD'
);


ALTER TYPE public.unidad_medida OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: categorias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categorias (
    id integer NOT NULL,
    nombre text NOT NULL
);


ALTER TABLE public.categorias OWNER TO postgres;

--
-- Name: categorias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categorias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categorias_id_seq OWNER TO postgres;

--
-- Name: categorias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categorias_id_seq OWNED BY public.categorias.id;


--
-- Name: cuentas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuentas (
    id integer NOT NULL,
    mesa_id integer NOT NULL,
    usuario_id integer,
    fecha_apertura timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_cierre timestamp(3) without time zone,
    estado public.estado_cuenta DEFAULT 'ABIERTA'::public.estado_cuenta NOT NULL,
    total numeric(10,2) DEFAULT 0 NOT NULL,
    metodo_pago public.metodo_pago,
    descuento numeric(10,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.cuentas OWNER TO postgres;

--
-- Name: cuentas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cuentas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cuentas_id_seq OWNER TO postgres;

--
-- Name: cuentas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cuentas_id_seq OWNED BY public.cuentas.id;


--
-- Name: insumos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.insumos (
    id integer NOT NULL,
    nombre text NOT NULL,
    categoria_id integer NOT NULL,
    unidad public.unidad_medida NOT NULL,
    costo numeric(10,2) NOT NULL,
    stock_actual numeric(10,2) DEFAULT 0 NOT NULL,
    stock_minimo numeric(10,2) DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.insumos OWNER TO postgres;

--
-- Name: insumos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.insumos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.insumos_id_seq OWNER TO postgres;

--
-- Name: insumos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.insumos_id_seq OWNED BY public.insumos.id;


--
-- Name: items_consumo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items_consumo (
    id integer NOT NULL,
    cuenta_id integer NOT NULL,
    producto_venta_id integer NOT NULL,
    cantidad integer NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL
);


ALTER TABLE public.items_consumo OWNER TO postgres;

--
-- Name: items_consumo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.items_consumo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.items_consumo_id_seq OWNER TO postgres;

--
-- Name: items_consumo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.items_consumo_id_seq OWNED BY public.items_consumo.id;


--
-- Name: mesas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mesas (
    id integer NOT NULL,
    numero integer NOT NULL,
    estado public.estado_mesa DEFAULT 'LIBRE'::public.estado_mesa NOT NULL
);


ALTER TABLE public.mesas OWNER TO postgres;

--
-- Name: mesas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mesas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mesas_id_seq OWNER TO postgres;

--
-- Name: mesas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mesas_id_seq OWNED BY public.mesas.id;


--
-- Name: movimientos_inventario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movimientos_inventario (
    id integer NOT NULL,
    insumo_id integer NOT NULL,
    tipo public.tipo_movimiento NOT NULL,
    cantidad numeric(10,2) NOT NULL,
    motivo text,
    fecha timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usuario_id integer NOT NULL,
    costo numeric(10,2),
    proveedor text
);


ALTER TABLE public.movimientos_inventario OWNER TO postgres;

--
-- Name: movimientos_inventario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.movimientos_inventario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.movimientos_inventario_id_seq OWNER TO postgres;

--
-- Name: movimientos_inventario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.movimientos_inventario_id_seq OWNED BY public.movimientos_inventario.id;


--
-- Name: productos_venta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.productos_venta (
    id integer NOT NULL,
    nombre text NOT NULL,
    categoria_id integer NOT NULL,
    precio_venta numeric(10,2) NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.productos_venta OWNER TO postgres;

--
-- Name: productos_venta_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.productos_venta_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.productos_venta_id_seq OWNER TO postgres;

--
-- Name: productos_venta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.productos_venta_id_seq OWNED BY public.productos_venta.id;


--
-- Name: receta_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.receta_items (
    id integer NOT NULL,
    producto_venta_id integer NOT NULL,
    insumo_id integer NOT NULL,
    cantidad numeric(10,2) NOT NULL
);


ALTER TABLE public.receta_items OWNER TO postgres;

--
-- Name: receta_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.receta_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.receta_items_id_seq OWNER TO postgres;

--
-- Name: receta_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.receta_items_id_seq OWNED BY public.receta_items.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre text NOT NULL,
    usuario text NOT NULL,
    password_hash text NOT NULL,
    rol public.rol_usuario NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    activo boolean DEFAULT true NOT NULL
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: categorias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias ALTER COLUMN id SET DEFAULT nextval('public.categorias_id_seq'::regclass);


--
-- Name: cuentas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas ALTER COLUMN id SET DEFAULT nextval('public.cuentas_id_seq'::regclass);


--
-- Name: insumos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insumos ALTER COLUMN id SET DEFAULT nextval('public.insumos_id_seq'::regclass);


--
-- Name: items_consumo id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items_consumo ALTER COLUMN id SET DEFAULT nextval('public.items_consumo_id_seq'::regclass);


--
-- Name: mesas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mesas ALTER COLUMN id SET DEFAULT nextval('public.mesas_id_seq'::regclass);


--
-- Name: movimientos_inventario id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_inventario ALTER COLUMN id SET DEFAULT nextval('public.movimientos_inventario_id_seq'::regclass);


--
-- Name: productos_venta id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos_venta ALTER COLUMN id SET DEFAULT nextval('public.productos_venta_id_seq'::regclass);


--
-- Name: receta_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receta_items ALTER COLUMN id SET DEFAULT nextval('public.receta_items_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
758f04c4-d548-4b60-9d4d-e857af6fd10e	405769e352c9b08cb6b29106358ad4414777ffadfb226ad52b18027e58ac0f9f	2026-07-24 01:11:10.113728-05	20260724061109_init	\N	\N	2026-07-24 01:11:10.002129-05	1
450056a7-595c-41b4-b18d-bc190eece4bc	e5ef290d65b9dd968edd35f55d6ec3ac728de070823bb230d35a0d11e1ddc985	2026-07-24 14:55:23.27302-05	20260724195523_add_usuario_activo	\N	\N	2026-07-24 14:55:23.230325-05	1
ff951d39-49fd-4954-9d20-1ce7de7a0dae	a0750f96232672aa6f70c21ac8f73255332bc51315c72c26538a3461e6aa1038	2026-07-24 15:32:18.580568-05	20260724203218_entradas_costo_proveedor_cuenta_descuento	\N	\N	2026-07-24 15:32:18.547074-05	1
\.


--
-- Data for Name: categorias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categorias (id, nombre) FROM stdin;
1	Cervezas
2	Licores
9	Snacks y refrescos
10	Combos
11	Licores a las rocas
12	Botellas
13	Shots
14	Shots preparados
15	Cócteles Suaves & Refrescantes
16	Cócteles Tropicales
17	Cócteles Clásicos de Siempre
18	Cócteles Intensos
19	Micheladas
20	Mocktails
21	Modo Cero
22	Zona Refrescante
23	Jugos
24	Helados
25	Antojo Rápido — Snacks
26	Dulces
\.


--
-- Data for Name: cuentas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cuentas (id, mesa_id, usuario_id, fecha_apertura, fecha_cierre, estado, total, metodo_pago, descuento) FROM stdin;
26	1	7	2026-07-27 06:29:46.177	2026-07-27 06:29:58.662	CERRADA	0.50	EFECTIVO	0.00
17	2	7	2026-07-26 21:13:06.629	2026-07-26 21:27:17.54	CERRADA	35.00	EFECTIVO	0.00
18	1	7	2026-07-26 22:53:43.376	2026-07-26 22:53:55.696	CERRADA	0.00	EFECTIVO	0.00
19	1	7	2026-07-27 05:41:33.205	2026-07-27 05:42:15.828	CERRADA	2.00	EFECTIVO	0.00
20	1	8	2026-07-27 05:44:14.299	2026-07-27 05:45:26.294	CERRADA	3.00	EFECTIVO	0.00
21	1	8	2026-07-27 05:45:38.306	2026-07-27 05:45:46.558	CERRADA	0.00	EFECTIVO	0.00
22	1	7	2026-07-27 05:50:15.881	2026-07-27 05:50:44.919	CERRADA	10.75	EFECTIVO	0.00
23	4	7	2026-07-27 06:17:13.889	2026-07-27 06:18:05.775	CERRADA	15.75	EFECTIVO	0.00
24	3	7	2026-07-27 06:27:19.68	2026-07-27 06:27:56.357	CERRADA	18.50	EFECTIVO	0.00
25	5	7	2026-07-27 06:28:07.951	2026-07-27 06:28:27.27	CERRADA	6.00	EFECTIVO	0.00
\.


--
-- Data for Name: insumos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.insumos (id, nombre, categoria_id, unidad, costo, stock_actual, stock_minimo, created_at) FROM stdin;
19	Buchanan's Deluxe	2	ML	0.03	2000.00	180.00	2026-07-26 21:07:29.902
33	Gaseosa (genérica)	9	UNIDAD	0.25	0.00	5.00	2026-07-26 21:07:29.924
34	Agua	9	UNIDAD	0.45	20.00	5.00	2026-07-26 21:07:29.926
5	Club 850ml	1	UNIDAD	2.30	90.00	10.00	2026-07-26 21:07:29.855
23	Antioqueño	2	ML	0.02	630.00	180.00	2026-07-26 21:07:29.908
32	Chicles (paq. 2)	9	UNIDAD	0.05	96.00	30.00	2026-07-26 21:07:29.923
6	Club 550ml	1	UNIDAD	0.00	0.00	0.00	2026-07-26 21:07:29.881
7	Club 330ml	1	UNIDAD	0.00	0.00	0.00	2026-07-26 21:07:29.882
8	Pilsener 1000ml	1	UNIDAD	0.00	0.00	0.00	2026-07-26 21:07:29.884
9	Pilsener 600ml	1	UNIDAD	0.00	0.00	0.00	2026-07-26 21:07:29.886
10	Corona 330ml	1	UNIDAD	0.00	0.00	0.00	2026-07-26 21:07:29.888
11	Corona en lata	1	UNIDAD	0.00	0.00	0.00	2026-07-26 21:07:29.89
12	Coronita 210ml	1	UNIDAD	0.00	0.00	0.00	2026-07-26 21:07:29.891
13	Corona Cero 330ml	1	UNIDAD	0.00	0.00	0.00	2026-07-26 21:07:29.894
14	Jägermeister	2	ML	0.00	0.00	0.00	2026-07-26 21:07:29.895
15	Something Special	2	ML	0.00	0.00	0.00	2026-07-26 21:07:29.897
16	Johnnie Walker Rojo	2	ML	0.00	0.00	0.00	2026-07-26 21:07:29.898
17	Johnnie Walker Negro	2	ML	0.00	0.00	0.00	2026-07-26 21:07:29.899
18	Old Parr	2	ML	0.00	0.00	0.00	2026-07-26 21:07:29.901
20	Buchanan's Master	2	ML	0.00	0.00	0.00	2026-07-26 21:07:29.903
21	Double Black	2	ML	0.00	0.00	0.00	2026-07-26 21:07:29.905
22	Chivas Aged 12 Years	2	ML	0.00	0.00	0.00	2026-07-26 21:07:29.907
24	Tequila	2	ML	0.00	0.00	0.00	2026-07-26 21:07:29.911
25	Vodka	2	ML	0.00	0.00	0.00	2026-07-26 21:07:29.912
26	Ron Castillo	2	ML	0.00	0.00	0.00	2026-07-26 21:07:29.914
27	Gin Under	2	ML	0.00	0.00	0.00	2026-07-26 21:07:29.916
28	Gancia Vermouth Extra Dry	2	ML	0.00	0.00	0.00	2026-07-26 21:07:29.917
29	Doritos	9	UNIDAD	0.00	0.00	0.00	2026-07-26 21:07:29.918
30	Ruffles	9	UNIDAD	0.00	0.00	0.00	2026-07-26 21:07:29.92
31	Chupetes	9	UNIDAD	0.00	0.00	0.00	2026-07-26 21:07:29.922
35	Güitig	9	UNIDAD	0.00	0.00	0.00	2026-07-26 21:07:29.927
36	Pony malta	9	UNIDAD	0.00	0.00	0.00	2026-07-26 21:07:29.929
37	V220	9	UNIDAD	0.00	0.00	0.00	2026-07-26 21:07:29.93
38	Imperial de toronja	9	UNIDAD	0.00	0.00	0.00	2026-07-26 21:07:29.931
\.


--
-- Data for Name: items_consumo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.items_consumo (id, cuenta_id, producto_venta_id, cantidad, precio_unitario, subtotal) FROM stdin;
28	24	15	1	10.75	10.75
29	24	102	4	1.00	4.00
30	24	7	1	3.75	3.75
31	25	42	2	3.00	6.00
32	26	121	2	0.25	0.50
21	17	102	5	1.00	5.00
22	17	30	1	30.00	30.00
23	19	102	2	1.00	2.00
24	20	102	3	1.00	3.00
25	22	15	1	10.75	10.75
26	23	15	1	10.75	10.75
27	23	102	5	1.00	5.00
\.


--
-- Data for Name: mesas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mesas (id, numero, estado) FROM stdin;
6	6	LIBRE
4	4	LIBRE
3	3	LIBRE
5	5	LIBRE
1	1	LIBRE
2	2	LIBRE
\.


--
-- Data for Name: movimientos_inventario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.movimientos_inventario (id, insumo_id, tipo, cantidad, motivo, fecha, usuario_id, costo, proveedor) FROM stdin;
34	23	SALIDA	750.00	Venta: Antioqueño Botella x1 (cuenta #17)	2026-07-26 21:27:05.26	7	\N	\N
35	5	SALIDA	3.00	Venta: 3 Club 850ml x1 (cuenta #22)	2026-07-27 05:50:24.767	7	\N	\N
36	5	SALIDA	3.00	Venta: 3 Club 850ml x1 (edicion item #25, cuenta #22)	2026-07-27 05:50:27.869	7	\N	\N
37	5	SALIDA	3.00	Venta: 3 Club 850ml x1 (edicion item #25, cuenta #22)	2026-07-27 05:50:28.732	7	\N	\N
38	5	SALIDA	3.00	Venta: 3 Club 850ml x1 (edicion item #25, cuenta #22)	2026-07-27 05:50:29.802	7	\N	\N
39	5	SALIDA	3.00	Venta: 3 Club 850ml x1 (edicion item #25, cuenta #22)	2026-07-27 05:50:30.756	7	\N	\N
40	5	AJUSTE	3.00	Reversion por edicion de item #25 (cuenta #22)	2026-07-27 05:50:36.99	7	\N	\N
41	5	AJUSTE	3.00	Reversion por edicion de item #25 (cuenta #22)	2026-07-27 05:50:37.387	7	\N	\N
42	5	AJUSTE	3.00	Reversion por edicion de item #25 (cuenta #22)	2026-07-27 05:50:37.815	7	\N	\N
43	5	AJUSTE	3.00	Reversion por edicion de item #25 (cuenta #22)	2026-07-27 05:50:38.122	7	\N	\N
44	5	SALIDA	3.00	Venta: 3 Club 850ml x1 (cuenta #23)	2026-07-27 06:17:20.18	7	\N	\N
45	5	SALIDA	3.00	Venta: 3 Club 850ml x1 (cuenta #24)	2026-07-27 06:27:28	7	\N	\N
46	34	SALIDA	1.00	Venta: Agua x1 (cuenta #24)	2026-07-27 06:27:34.915	7	\N	\N
47	34	SALIDA	1.00	Venta: Agua x1 (edicion item #29, cuenta #24)	2026-07-27 06:27:35.799	7	\N	\N
48	34	SALIDA	1.00	Venta: Agua x1 (edicion item #29, cuenta #24)	2026-07-27 06:27:36.021	7	\N	\N
49	34	SALIDA	1.00	Venta: Agua x1 (edicion item #29, cuenta #24)	2026-07-27 06:27:36.205	7	\N	\N
50	5	SALIDA	1.00	Venta: Club 850ml x1 (cuenta #24)	2026-07-27 06:27:46.836	7	\N	\N
51	23	SALIDA	60.00	Venta: Antioqueño Shot x1 (cuenta #25)	2026-07-27 06:28:11.311	7	\N	\N
52	23	SALIDA	60.00	Venta: Antioqueño Shot x1 (edicion item #31, cuenta #25)	2026-07-27 06:28:13.719	7	\N	\N
53	32	SALIDA	2.00	Venta: Chicles (2 unid.) x1 (cuenta #26)	2026-07-27 06:29:52.783	7	\N	\N
54	32	SALIDA	2.00	Venta: Chicles (2 unid.) x1 (edicion item #32, cuenta #26)	2026-07-27 06:29:54.078	7	\N	\N
\.


--
-- Data for Name: productos_venta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productos_venta (id, nombre, categoria_id, precio_venta, created_at) FROM stdin;
100	Michelada cero	21	5.00	2026-07-26 21:07:30.148
101	Gaseosas	22	1.00	2026-07-26 21:07:30.15
102	Agua	22	1.00	2026-07-26 21:07:30.151
103	Güitig	22	1.00	2026-07-26 21:07:30.152
7	Club 850ml	1	3.75	2026-07-26 21:07:29.934
8	Club 550ml	1	3.00	2026-07-26 21:07:29.942
9	Pilsener 1000ml	1	3.25	2026-07-26 21:07:29.945
10	Pilsener 600ml	1	2.50	2026-07-26 21:07:29.948
11	Corona 330ml	1	3.50	2026-07-26 21:07:29.951
12	Corona en lata	1	2.50	2026-07-26 21:07:29.953
13	Coronita 210ml	1	2.00	2026-07-26 21:07:29.956
14	Corona Cero 330ml	1	3.00	2026-07-26 21:07:29.959
15	3 Club 850ml	10	10.75	2026-07-26 21:07:29.961
16	3 Club 550ml	10	8.50	2026-07-26 21:07:29.964
17	3 Pilsener 1000ml	10	9.25	2026-07-26 21:07:29.966
18	3 Pilsener 600ml	10	7.00	2026-07-26 21:07:29.968
19	3 Coronas 330ml	10	10.00	2026-07-26 21:07:29.97
20	4 Coronas en lata	10	9.50	2026-07-26 21:07:29.972
21	Jägermeister Rocas	11	5.00	2026-07-26 21:07:29.974
22	Something Special Rocas	11	5.00	2026-07-26 21:07:29.976
23	Johnnie Rojo Rocas	11	6.00	2026-07-26 21:07:29.978
24	Johnnie Negro Rocas	11	8.00	2026-07-26 21:07:29.981
25	Old Parr Rocas	11	8.00	2026-07-26 21:07:29.984
26	Buchanan's Deluxe Rocas	11	8.00	2026-07-26 21:07:29.987
27	Buchanan's Master Rocas	11	9.00	2026-07-26 21:07:29.989
28	Double Black Rocas	11	9.00	2026-07-26 21:07:29.992
29	Chivas Aged 12 Years Rocas	11	9.00	2026-07-26 21:07:29.995
30	Antioqueño Botella	12	30.00	2026-07-26 21:07:29.997
31	Tequila Botella	12	35.00	2026-07-26 21:07:30
32	Jägermeister Botella	12	60.00	2026-07-26 21:07:30.002
33	Something Special Botella	12	50.00	2026-07-26 21:07:30.005
34	Johnnie Rojo Botella	12	65.00	2026-07-26 21:07:30.007
35	Johnnie Negro Botella	12	90.00	2026-07-26 21:07:30.009
36	Old Parr Botella	12	90.00	2026-07-26 21:07:30.012
37	Buchanan's Deluxe Botella	12	90.00	2026-07-26 21:07:30.015
38	Buchanan's Master Botella	12	100.00	2026-07-26 21:07:30.017
39	Double Black Botella	12	100.00	2026-07-26 21:07:30.02
40	Chivas Aged 12 Years Botella	12	100.00	2026-07-26 21:07:30.022
41	Tequila Shot	13	3.00	2026-07-26 21:07:30.024
42	Antioqueño Shot	13	3.00	2026-07-26 21:07:30.027
43	Vodka Shot	13	3.00	2026-07-26 21:07:30.029
44	Jägermeister Shot	13	4.00	2026-07-26 21:07:30.032
45	Vodka picante	14	4.00	2026-07-26 21:07:30.034
46	Tentación Roja	14	4.00	2026-07-26 21:07:30.036
47	Pecado Tropical	14	4.00	2026-07-26 21:07:30.039
48	Deseo Oscuro	14	4.00	2026-07-26 21:07:30.041
49	Beso de Maracuyá	14	4.00	2026-07-26 21:07:30.044
50	Luna de Mango	14	4.00	2026-07-26 21:07:30.046
51	Fuego Secreto	14	4.00	2026-07-26 21:07:30.049
52	La Última y Nos Vamos	14	4.00	2026-07-26 21:07:30.05
53	Piña Colada	15	5.00	2026-07-26 21:07:30.053
54	Paloma	15	5.00	2026-07-26 21:07:30.055
55	Paloma de Fresa	15	6.00	2026-07-26 21:07:30.057
56	Blue Lady	15	5.00	2026-07-26 21:07:30.059
57	Mojito Blue	15	6.00	2026-07-26 21:07:30.062
58	Mojito Maracuyá	15	6.00	2026-07-26 21:07:30.064
59	Mojito Fresa	15	6.00	2026-07-26 21:07:30.067
60	Mojito Mango	15	6.00	2026-07-26 21:07:30.069
61	Mojito Frutos Rojos	15	6.00	2026-07-26 21:07:30.071
62	Caipiroska de Limón	15	5.00	2026-07-26 21:07:30.074
63	Caipiroska de Fresa	15	6.00	2026-07-26 21:07:30.076
64	Daiquiri de Fresa	15	5.00	2026-07-26 21:07:30.078
65	Corona Sunrise	15	6.00	2026-07-26 21:07:30.08
66	Barbie	16	6.00	2026-07-26 21:07:30.084
67	Coco Sunset	16	5.00	2026-07-26 21:07:30.086
68	Blue Hawaii	16	6.00	2026-07-26 21:07:30.089
69	Sex on the Beach	16	6.00	2026-07-26 21:07:30.091
70	Margarita Blue	16	6.00	2026-07-26 21:07:30.094
71	Margarita Mango	16	6.00	2026-07-26 21:07:30.096
72	Valentina Frozen	16	5.00	2026-07-26 21:07:30.098
73	Margarita	17	5.00	2026-07-26 21:07:30.1
74	Cuba	17	5.00	2026-07-26 21:07:30.102
75	Mojito Clásico	17	6.00	2026-07-26 21:07:30.104
76	Tequila Sunrise	17	5.00	2026-07-26 21:07:30.105
77	Calimocho	17	5.00	2026-07-26 21:07:30.107
78	Padrino	18	8.00	2026-07-26 21:07:30.109
79	El Padrino Gold (Buchanan's Deluxe)	18	10.00	2026-07-26 21:07:30.111
80	El Padrino Gold (Johnnie Negro)	18	10.00	2026-07-26 21:07:30.113
81	El Padrino Gold (Old Parr)	18	10.00	2026-07-26 21:07:30.115
82	Whisky Tropical	18	8.00	2026-07-26 21:07:30.117
83	Orgasmo	18	7.00	2026-07-26 21:07:30.119
84	Jäger Recargado	18	6.00	2026-07-26 21:07:30.12
85	Margarita Corona	18	7.00	2026-07-26 21:07:30.122
86	Valentina Corona	18	7.00	2026-07-26 21:07:30.125
87	Martini	18	7.00	2026-07-26 21:07:30.127
88	Espresso Martini	18	8.00	2026-07-26 21:07:30.13
89	Michelada de limón	19	5.00	2026-07-26 21:07:30.132
90	Michelada de maracuyá	19	6.00	2026-07-26 21:07:30.134
91	Michelada de mango	19	6.00	2026-07-26 21:07:30.136
92	Michelada de maracumango	19	6.00	2026-07-26 21:07:30.138
93	Michelada Corona	19	7.00	2026-07-26 21:07:30.139
94	Mango Mint	20	4.00	2026-07-26 21:07:30.141
95	Atardecer	20	4.00	2026-07-26 21:07:30.142
96	Pasión Rosada	20	4.00	2026-07-26 21:07:30.144
97	Dúo Tropical	20	4.00	2026-07-26 21:07:30.145
98	Piñada	20	5.00	2026-07-26 21:07:30.146
99	Strawberry Crush	20	4.00	2026-07-26 21:07:30.147
104	Pony malta	22	1.00	2026-07-26 21:07:30.153
105	V220	22	1.00	2026-07-26 21:07:30.154
106	Imperial de toronja	22	1.50	2026-07-26 21:07:30.156
107	Limonada clásica	23	3.00	2026-07-26 21:07:30.157
108	Limonada de fresa	23	3.75	2026-07-26 21:07:30.158
109	Limonada de coco	23	3.75	2026-07-26 21:07:30.159
110	Mango natural	23	3.50	2026-07-26 21:07:30.16
111	Brisa de maracuyá	23	3.50	2026-07-26 21:07:30.161
112	Maracuyá con sal	24	1.00	2026-07-26 21:07:30.162
113	Mango con sal	24	1.00	2026-07-26 21:07:30.164
114	Maracumango con sal	24	1.00	2026-07-26 21:07:30.166
115	Ice Prohibido	24	2.00	2026-07-26 21:07:30.167
116	Doritos	25	1.00	2026-07-26 21:07:30.168
117	Ruffles	25	1.00	2026-07-26 21:07:30.17
118	Doritos Preparados	25	1.25	2026-07-26 21:07:30.173
119	Volquetero	25	7.00	2026-07-26 21:07:30.175
120	Chupetes	26	0.50	2026-07-26 21:07:30.177
121	Chicles (2 unid.)	26	0.25	2026-07-26 21:07:30.182
\.


--
-- Data for Name: receta_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.receta_items (id, producto_venta_id, insumo_id, cantidad) FROM stdin;
11	7	5	1.00
12	8	6	1.00
13	9	8	1.00
14	10	9	1.00
15	11	10	1.00
16	12	11	1.00
17	13	12	1.00
18	14	13	1.00
19	15	5	3.00
20	16	6	3.00
21	17	8	3.00
22	18	9	3.00
23	19	10	3.00
24	20	11	4.00
25	21	14	60.00
26	22	15	60.00
27	23	16	60.00
28	24	17	60.00
29	25	18	60.00
30	26	19	60.00
31	27	20	60.00
32	28	21	60.00
33	29	22	60.00
34	30	23	750.00
35	31	24	750.00
36	32	14	700.00
37	33	15	750.00
38	34	16	750.00
39	35	17	750.00
40	36	18	750.00
41	37	19	750.00
42	38	20	750.00
43	39	21	750.00
44	40	22	750.00
45	41	24	60.00
46	42	23	60.00
47	43	25	60.00
48	44	14	60.00
49	45	25	30.00
50	46	25	30.00
51	47	25	30.00
52	48	25	30.00
53	49	25	30.00
54	50	25	30.00
55	52	14	30.00
56	53	26	60.00
57	54	24	60.00
58	55	24	60.00
59	56	27	60.00
60	57	26	60.00
61	58	26	60.00
62	59	26	60.00
63	60	26	60.00
64	61	26	60.00
65	62	25	60.00
66	63	25	60.00
67	64	26	60.00
68	65	24	60.00
69	65	10	1.00
70	66	25	60.00
71	67	26	60.00
72	68	26	60.00
73	69	25	60.00
74	70	24	60.00
75	71	24	60.00
76	72	24	60.00
77	73	24	60.00
78	74	26	60.00
79	75	26	60.00
80	76	24	60.00
81	78	15	60.00
82	79	19	60.00
83	80	17	60.00
84	81	18	60.00
85	82	15	60.00
86	84	14	60.00
87	85	24	60.00
88	85	12	1.00
89	86	24	60.00
90	86	12	1.00
91	87	27	60.00
92	87	28	15.00
93	88	25	60.00
94	89	7	1.00
95	90	7	1.00
96	91	7	1.00
97	92	7	1.00
98	93	10	1.00
99	100	13	1.00
100	116	29	1.00
101	117	30	1.00
102	118	29	1.00
103	102	34	1.00
104	103	35	1.00
105	104	36	1.00
106	105	37	1.00
107	106	38	1.00
108	120	31	1.00
109	121	32	2.00
110	101	33	1.00
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, nombre, usuario, password_hash, rol, created_at, activo) FROM stdin;
7	Cristofeer	Cristofeer	$2b$10$jQiMlTiNrmb8Bar3vTlSo.NQtjl0wk2oI0Fz3LCf1ApPT0s6cQxQ.	ADMIN	2026-07-25 06:51:34.245	t
8	BarPosada	Palomo	$2b$10$IKyVIYNo5UgX6xfuEGVkMukp0b2g2bxfFkmWb41dM84rfvK1lzojm	MESERO	2026-07-25 06:57:40.281	t
\.


--
-- Name: categorias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categorias_id_seq', 26, true);


--
-- Name: cuentas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cuentas_id_seq', 26, true);


--
-- Name: insumos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.insumos_id_seq', 38, true);


--
-- Name: items_consumo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.items_consumo_id_seq', 32, true);


--
-- Name: mesas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mesas_id_seq', 6, true);


--
-- Name: movimientos_inventario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.movimientos_inventario_id_seq', 54, true);


--
-- Name: productos_venta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.productos_venta_id_seq', 121, true);


--
-- Name: receta_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.receta_items_id_seq', 110, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 8, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id);


--
-- Name: cuentas cuentas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas
    ADD CONSTRAINT cuentas_pkey PRIMARY KEY (id);


--
-- Name: insumos insumos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insumos
    ADD CONSTRAINT insumos_pkey PRIMARY KEY (id);


--
-- Name: items_consumo items_consumo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items_consumo
    ADD CONSTRAINT items_consumo_pkey PRIMARY KEY (id);


--
-- Name: mesas mesas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mesas
    ADD CONSTRAINT mesas_pkey PRIMARY KEY (id);


--
-- Name: movimientos_inventario movimientos_inventario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_inventario
    ADD CONSTRAINT movimientos_inventario_pkey PRIMARY KEY (id);


--
-- Name: productos_venta productos_venta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos_venta
    ADD CONSTRAINT productos_venta_pkey PRIMARY KEY (id);


--
-- Name: receta_items receta_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receta_items
    ADD CONSTRAINT receta_items_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: categorias_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX categorias_nombre_key ON public.categorias USING btree (nombre);


--
-- Name: mesas_numero_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX mesas_numero_key ON public.mesas USING btree (numero);


--
-- Name: receta_items_producto_venta_id_insumo_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX receta_items_producto_venta_id_insumo_id_key ON public.receta_items USING btree (producto_venta_id, insumo_id);


--
-- Name: usuarios_usuario_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX usuarios_usuario_key ON public.usuarios USING btree (usuario);


--
-- Name: cuentas cuentas_mesa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas
    ADD CONSTRAINT cuentas_mesa_id_fkey FOREIGN KEY (mesa_id) REFERENCES public.mesas(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cuentas cuentas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas
    ADD CONSTRAINT cuentas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: insumos insumos_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insumos
    ADD CONSTRAINT insumos_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: items_consumo items_consumo_cuenta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items_consumo
    ADD CONSTRAINT items_consumo_cuenta_id_fkey FOREIGN KEY (cuenta_id) REFERENCES public.cuentas(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: items_consumo items_consumo_producto_venta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items_consumo
    ADD CONSTRAINT items_consumo_producto_venta_id_fkey FOREIGN KEY (producto_venta_id) REFERENCES public.productos_venta(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: movimientos_inventario movimientos_inventario_insumo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_inventario
    ADD CONSTRAINT movimientos_inventario_insumo_id_fkey FOREIGN KEY (insumo_id) REFERENCES public.insumos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: movimientos_inventario movimientos_inventario_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_inventario
    ADD CONSTRAINT movimientos_inventario_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: productos_venta productos_venta_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos_venta
    ADD CONSTRAINT productos_venta_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: receta_items receta_items_insumo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receta_items
    ADD CONSTRAINT receta_items_insumo_id_fkey FOREIGN KEY (insumo_id) REFERENCES public.insumos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: receta_items receta_items_producto_venta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receta_items
    ADD CONSTRAINT receta_items_producto_venta_id_fkey FOREIGN KEY (producto_venta_id) REFERENCES public.productos_venta(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 24PRpLQIwKGv4yYdPIocdfjiByC34cM2Kf2jxnWIaYrdOUONGD7NgbGzZPcjtsF

