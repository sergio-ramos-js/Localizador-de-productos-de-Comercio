import { Head } from '@inertiajs/react';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import GondolaLabel from '@/components/GondolaLabel';
import { formatearLista } from '@/lib/format';

interface Gondola {
    id: number;
    nombre: string;
    color: string;
    posicion_x: number;
    posicion_y: number;
    ancho: number;
    alto: number;
}

interface Producto {
    id: number;
    nombre: string;
    gondola_ids?: number[];
}

interface Props {
    gondolas: Gondola[];
    productos: Producto[];
}

export default function Buscador({ gondolas = [], productos = [] }: Props) {
    const [busqueda, setBusqueda] = useState('');
    const [productoSeleccionadoId, setProductoSeleccionadoId] = useState<number | null>(null);

    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const startPan = useRef({ x: 0, y: 0 });
    const svgRef = useRef<SVGSVGElement>(null);
    const TAMANO_GRILLA = 100;

    const productoSeleccionado = useMemo(
        () => productos.find((p) => p.id === productoSeleccionadoId) ?? null,
        [productos, productoSeleccionadoId],
    );

    const gondolasDestacadas = useMemo(() => {
        if (!productoSeleccionado?.gondola_ids?.length) return new Set<number>();

        return new Set(productoSeleccionado.gondola_ids.map((id) => Number(id)));
    }, [productoSeleccionado]);

    const nombresGondolasUbicacion = useMemo(() => {
        if (!productoSeleccionado?.gondola_ids?.length) return [];

        return productoSeleccionado.gondola_ids
            .map((id) => gondolas.find((g) => Number(g.id) === Number(id))?.nombre)
            .filter((nombre): nombre is string => Boolean(nombre));
    }, [productoSeleccionado, gondolas]);

    const sugerenciasFiltradas = useMemo(() => {
        if (!busqueda.trim()) return [];
        return productos.filter(p =>
            p.nombre.toLowerCase().includes(busqueda.toLowerCase())
        ).slice(0, 5);
    }, [busqueda, productos]);

    const seleccionarProducto = (prod: Producto) => {
        setProductoSeleccionadoId(prod.id);
        setBusqueda('');
    };

    const limpiarFiltro = () => {
        setProductoSeleccionadoId(null);
        resetearVista();
    };

    const resetearVista = () => {
        setScale(1);
        setOffset({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        startPan.current = { x: e.clientX, y: e.clientY };
    };

    const FACTOR_SENSIBILIDAD = 0.3;

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;

        const deltaX = e.clientX - startPan.current.x;
        const deltaY = e.clientY - startPan.current.y;

        startPan.current = { x: e.clientX, y: e.clientY };

        setOffset(prev => ({
            x: prev.x + deltaX * FACTOR_SENSIBILIDAD,
            y: prev.y + deltaY * FACTOR_SENSIBILIDAD
        }));
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            setIsDragging(true);
            const touch = e.touches[0];
            startPan.current = { x: touch.clientX, y: touch.clientY };
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || e.touches.length !== 1) return;
        const touch = e.touches[0];

        const deltaX = touch.clientX - startPan.current.x;
        const deltaY = touch.clientY - startPan.current.y;

        startPan.current = { x: touch.clientX, y: touch.clientY };

        setOffset(prev => ({
            x: prev.x + deltaX * FACTOR_SENSIBILIDAD,
            y: prev.y + deltaY * FACTOR_SENSIBILIDAD
        }));
    };

    const handleStopDragging = () => setIsDragging(false);

    useEffect(() => {
        if (!svgRef.current || gondolas.length === 0) return;

        const ajustarVistaGeneral = () => {
            if (!svgRef.current) return;

            const rect = svgRef.current.getBoundingClientRect();
            const anchoContenedor = rect.width;
            const altoContenedor = rect.height;

            if (anchoContenedor === 0 || altoContenedor === 0) return;

            const minX = Math.min(...gondolas.map(g => Number(g.posicion_x)));
            const maxX = Math.max(...gondolas.map(g => Number(g.posicion_x) + (Number(g.ancho) || 20)));
            const minY = Math.min(...gondolas.map(g => Number(g.posicion_y)));
            const maxY = Math.max(...gondolas.map(g => Number(g.posicion_y) + (Number(g.alto) || 8)));

            const centroMapaX = (minX + maxX) / 2;
            const centroMapaY = (minY + maxY) / 2;

            const anchoMapaReal = maxX - minX;
            const altoMapaReal = maxY - minY;

            const relacionEscalaX = TAMANO_GRILLA / (anchoMapaReal || 1);
            const relacionEscalaY = TAMANO_GRILLA / (altoMapaReal || 1);

            const escalaInicial = Math.min(relacionEscalaX, relacionEscalaY) * 0.75;
            const escalaFinal = Math.max(0.6, Math.min(escalaInicial, 2.2));

            const nuevoX = (TAMANO_GRILLA / 2) - (centroMapaX * escalaFinal);
            const nuevoY = (TAMANO_GRILLA / 2) - (centroMapaY * escalaFinal);

            setScale(escalaFinal);
            setOffset({ x: nuevoX, y: nuevoY });
        };

        const resizeObserver = new ResizeObserver(() => {
            ajustarVistaGeneral();
        });

        resizeObserver.observe(svgRef.current);
        ajustarVistaGeneral();

        return () => {
            resizeObserver.disconnect();
        };
    }, [gondolas]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 selection:bg-sky-500/30 overflow-x-hidden">
            <Head title="Buscador de Productos" />

            <style>{`
                @keyframes pulse-highlight {
                    0%, 100% { fill: #fde047; }
                    50% { fill: #f59e0b; }
                }
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.35; }
                    50% { opacity: 0.75; }
                }
                .gondola-activa {
                    animation: pulse-highlight 1.1s ease-in-out infinite;
                }
                .gondola-pulse-glow {
                    animation: pulse-glow 1.1s ease-in-out infinite;
                    pointer-events: none;
                }
            `}</style>

            <header className="w-full max-w-md text-center mt-2 mb-4">
                <h1 className="text-2xl font-black tracking-tight text-white flex justify-center items-center gap-2">
                    🛒 GPS Local
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">Busca tu artículo y sigue el mapa interactivo</p>
            </header>

            <main className="w-full max-w-md flex flex-col gap-3 relative">

                <div className="relative">
                    <div className="flex gap-2 bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-xl focus-within:border-sky-500 transition-colors">
                        <span className="text-slate-400">🔍</span>
                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="¿Qué buscas? (Ej: Arroz, Harina)"
                            className="w-full bg-transparent border-none text-white text-base p-0 focus:outline-none focus:ring-0"
                        />
                        {productoSeleccionado && (
                            <button onClick={limpiarFiltro} className="text-xs text-slate-400 hover:text-white px-1">
                                Limpiar
                            </button>
                        )}
                    </div>

                    {sugerenciasFiltradas.length > 0 && (
                        <div className="absolute left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800/60">
                            {sugerenciasFiltradas.map((prod) => (
                                <button
                                    key={prod.id}
                                    onClick={() => seleccionarProducto(prod)}
                                    className="w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-slate-800 transition-colors flex justify-between items-center"
                                >
                                    <span className="font-medium">{prod.nombre}</span>
                                    <span className="text-xs text-sky-400 font-semibold">Ubicar 📍</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {productoSeleccionado && (
                    <div className="bg-sky-950/40 border border-sky-900/50 px-3 py-2.5 rounded-xl">
                        {nombresGondolasUbicacion.length > 0 ? (
                            <p className="text-xs text-slate-100 leading-relaxed">
                                <span className="font-bold text-white mr-1">{productoSeleccionado.nombre}</span>
                                {' '}se encuentra en:{' '}
                                <span className="font-semibold text-sky-300 ml-1">
                                    {formatearLista(nombresGondolasUbicacion)}
                                </span>
                                .
                            </p>
                        ) : (
                            <p className="text-xs text-amber-300 leading-relaxed">
                                <span className="font-bold text-white">{productoSeleccionado.nombre}</span>
                                {' '}no tiene ubicaciones asignadas en el mapa.
                            </p>
                        )}
                    </div>
                )}

                <div className="w-full aspect-square bg-slate-900 border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden relative touch-none">

                    <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 z-10">
                        <button
                            onClick={() => setScale(s => Math.min(s + 0.3, 4))}
                            className="w-8 h-8 bg-slate-800/90 text-white rounded-lg font-bold border border-slate-700 shadow flex items-center justify-center active:scale-95 transition-transform"
                        >
                            ＋
                        </button>
                        <button
                            onClick={() => setScale(s => Math.max(s - 0.3, 0.8))}
                            className="w-8 h-8 bg-slate-800/90 text-white rounded-lg font-bold border border-slate-700 shadow flex items-center justify-center active:scale-95 transition-transform"
                        >
                            －
                        </button>
                        <button
                            onClick={resetearVista}
                            className="w-8 h-8 bg-slate-800/90 text-xs text-slate-300 rounded-lg border border-slate-700 shadow flex items-center justify-center active:scale-95 transition-transform"
                        >
                            🔄
                        </button>
                    </div>

                    <svg
                        ref={svgRef}
                        viewBox={`0 0 ${TAMANO_GRILLA} ${TAMANO_GRILLA}`}
                        className={`w-full h-full select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleStopDragging}
                        onMouseLeave={handleStopDragging}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleStopDragging}
                    >
                        <g transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}>

                            <defs>
                                <pattern id="client-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1e293b" strokeWidth="0.15" />
                                </pattern>
                                <filter id="gondola-glow" x="-80%" y="-80%" width="260%" height="260%">
                                    <feGaussianBlur stdDeviation="1.4" result="blur" />
                                    <feMerge>
                                        <feMergeNode in="blur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            <rect x="-200" y="-200" width="500" height="500" fill="url(#client-grid)" pointerEvents="none" />

                            {gondolas.map((gondola) => {
                                const colorBase = gondola.color || '#475569';
                                const esLaBuscada = gondolasDestacadas.has(Number(gondola.id));

                                const gAncho = gondola.ancho || 20;
                                const gAlto = gondola.alto || 8;

                                return (
                                    <g key={gondola.id}>
                                        {esLaBuscada && (
                                            <rect
                                                x={gondola.posicion_x - 2.5}
                                                y={gondola.posicion_y - 2.5}
                                                width={gAncho + 5}
                                                height={gAlto + 5}
                                                rx="2"
                                                fill="#facc15"
                                                className="gondola-pulse-glow"
                                            />
                                        )}
                                        <rect
                                            x={gondola.posicion_x}
                                            y={gondola.posicion_y}
                                            width={gAncho}
                                            height={gAlto}
                                            rx="1"
                                            fill={esLaBuscada ? '#fde047' : colorBase}
                                            stroke={esLaBuscada ? 'none' : colorBase}
                                            strokeWidth={esLaBuscada ? 0 : 0.5}
                                            className={esLaBuscada ? 'gondola-activa' : ''}
                                            filter={esLaBuscada ? 'url(#gondola-glow)' : undefined}
                                            style={{ WebkitTapHighlightColor: 'transparent' }}
                                        />
                                        <GondolaLabel
                                            nombre={gondola.nombre}
                                            x={gondola.posicion_x}
                                            y={gondola.posicion_y}
                                            ancho={gAncho}
                                            alto={gAlto}
                                            backgroundColor={esLaBuscada ? '#fde047' : colorBase}
                                        />
                                    </g>
                                );
                            })}
                        </g>
                    </svg>

                    {!productoSeleccionado && (
                        <div className="absolute inset-x-0 top-1/16 -translate-y-1/2 pointer-events-none flex items-center justify-center p-6 text-center">
                            <span className="bg-slate-950/80 border border-slate-800 text-slate-400 text-xs px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm">
                                👆 Puedes arrastrar o hacer zoom en el mapa
                            </span>
                        </div>
                    )}
                </div>
                <div className="mt-4 text-center text-amber-400 text-xs bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3">
                    ⚠️ Si no encontrás el producto, es posible que haya sido reubicado recientemente.<br />
                    <span className="text-amber-300">buscá en góndolas cercanas o consultá con un empleado..</span>
                </div>
            </main>

            <footer className="mt-auto pt-6 text-[10px] text-slate-600 tracking-wider">
                MAP ENGINE V1.2 • MYSQL REALTIME INDEX
            </footer>
        </div>
    );
}