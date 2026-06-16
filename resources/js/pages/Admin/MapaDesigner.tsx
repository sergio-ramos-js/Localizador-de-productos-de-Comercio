/* eslint-disable @stylistic/brace-style */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @stylistic/padding-line-between-statements */
/* eslint-disable curly */
import { Head, router } from '@inertiajs/react';
import React, { useState, useEffect, useRef } from 'react';
import { useCallback } from 'react';

interface Gondola {
    id: number;
    nombre: string;
    posicion_x: number;
    posicion_y: number;
    ancho: number;
    alto: number;
}

interface Props {
    gondolasIniciales: Gondola[];
}

export default function MapaDesigner({ gondolasIniciales }: Props) {
    const [gondolas, setGondolas] = useState<Gondola[]>(gondolasIniciales);
    const [gondolaActiva, setGondolaActiva] = useState<number | null>(null);
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [nuevoColor, setNuevoColor] = useState('#475569'); // 🚀 Gris por defecto
    const [modoEliminar, setModoEliminar] = useState(false);

    // 🚀 NUEVOS ESTADOS: Control de navegación del mapa completo
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDraggingLienzo, setIsDraggingLienzo] = useState(false);

    // REFERENCIAS: para tama;os ubicaciones y calculos matematicos para el mapa
    const startTouchPan = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const isDraggingLienzoTouch = useRef<boolean>(false);
    const distInicialTouch = useRef<number | null>(null);
    const centroInicialTouch = useRef<{ x: number; y: number } | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const startPan = useRef({ x: 0, y: 0 });
    const MAX_ZOOM = 4;
    const MIN_ZOOM = 0.5;


    // USE EFFECTS 
    useEffect(() => {
        setGondolas(gondolasIniciales);
    }, [gondolasIniciales]);

    const finalizarArrastre = useCallback(() => {
        setIsDraggingLienzo(false);

        if (gondolaActiva === null) return;

        // Buscamos la góndola en la lista actual
        const gondolaGuardar = gondolas.find(g => g.id === gondolaActiva);
        setGondolaActiva(null);

        if (!gondolaGuardar) return;

        // Tu petición de Inertia original
        router.post(`/admin/gondolas/${gondolaGuardar.id}/posicion`, {
            posicion_x: gondolaGuardar.posicion_x,
            posicion_y: gondolaGuardar.posicion_y
        }, {
            preserveScroll: true,
            preserveState: true,
        });
        // 🚀 En las dependencias del useCallback pasamos las variables externas que usa adentro
    }, [gondolaActiva, gondolas]);

    useEffect(() => {
        const svgElement = svgRef.current;
        if (!svgElement) return;

        // --- PC: Rueda de mouse ---
        const handleStrictWheel = (e: WheelEvent) => {
            e.preventDefault();
            const rect = svgElement.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;

            setZoom(prevZoom => {
                const nuevoZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prevZoom * factor));
                setOffset(prevOffset => ({
                    x: mouseX - (mouseX - prevOffset.x) * (nuevoZoom / prevZoom),
                    y: mouseY - (mouseY - prevOffset.y) * (nuevoZoom / prevZoom)
                }));
                return nuevoZoom;
            });
        };

        // --- MOBILE: Inicio del toque ---
        const handleTouchStart = (e: TouchEvent) => {
            // CASO A: Zoom con dos dedos (Pinch)
            if (e.touches.length === 2) {
                isDraggingLienzoTouch.current = false;
                const t1 = e.touches[0];
                const t2 = e.touches[1];
                distInicialTouch.current = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

                const rect = svgElement.getBoundingClientRect();
                centroInicialTouch.current = {
                    x: ((t1.clientX + t2.clientX) / 2) - rect.left,
                    y: ((t1.clientY + t2.clientY) / 2) - rect.top
                };
            }
            // CASO B: Un solo dedo en el FONDO (Paneo del mapa)
            // Solo se activa si no estamos tocando una góndola (gondolaActiva === null)
            else if (e.touches.length === 1 && gondolaActiva === null) {
                const t = e.touches[0];
                isDraggingLienzoTouch.current = true;
                startTouchPan.current = { x: t.clientX - offset.x, y: t.clientY - offset.y };
            }
        };

        // --- MOBILE: Movimiento del dedo ---
        const handleTouchMove = (e: TouchEvent) => {
            // 🛑 Súper importante: Frenamos el scroll elástico del navegador siempre
            e.preventDefault();

            // CASO A: Zoom con dos dedos
            if (e.touches.length === 2 && distInicialTouch.current && centroInicialTouch.current) {
                const t1 = e.touches[0];
                const t2 = e.touches[1];
                const distActual = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
                const factor = distActual / distInicialTouch.current;

                const mouseX = centroInicialTouch.current.x;
                const mouseY = centroInicialTouch.current.y;

                setZoom(prevZoom => {
                    const nuevoZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prevZoom * factor));
                    setOffset(prevOffset => ({
                        x: mouseX - (mouseX - prevOffset.x) * (nuevoZoom / prevZoom),
                        y: mouseY - (mouseY - prevOffset.y) * (nuevoZoom / prevZoom)
                    }));
                    return nuevoZoom;
                });
                distInicialTouch.current = distActual;
            }
            // CASO B: Arrastre del mapa con un dedo (Fondo)
            else if (e.touches.length === 1 && isDraggingLienzoTouch.current && gondolaActiva === null) {
                const t = e.touches[0];
                setOffset({
                    x: t.clientX - startTouchPan.current.x,
                    y: t.clientY - startTouchPan.current.y
                });
            }
            // CASO C: 🚀 ¡NUEVO! Mover una góndola con el dedo en el celular
            else if (e.touches.length === 1 && gondolaActiva !== null) {
                const t = e.touches[0];
                const rect = svgElement.getBoundingClientRect();

                // Traducimos la posición del dedo en la pantalla al mundo infinito de nuestro SVG
                const xMundo = (t.clientX - rect.left - offset.x) / zoom;
                const yMundo = (t.clientY - rect.top - offset.y) / zoom;

                // Mantenemos el Snap to Grid (Atracción magnética de celdas)
                const TAMANO_CELDA = 2;
                const xForzada = Math.round(xMundo / TAMANO_CELDA) * TAMANO_CELDA;
                const yForzada = Math.round(yMundo / TAMANO_CELDA) * TAMANO_CELDA;

                setGondolas(prev =>
                    prev.map(g => (g.id === gondolaActiva ? { ...g, posicion_x: xForzada, posicion_y: yForzada } : g))
                );
            }
        };

        const handleTouchEnd = () => {
            // Si el usuario estaba moviendo una góndola en el celular y levantó el dedo,
            // disparamos automáticamente tu función 'finalizarArrastre' para que guarde en la BD mediante Inertia
            if (gondolaActiva !== null) {
                finalizarArrastre();
            }
            distInicialTouch.current = null;
            centroInicialTouch.current = null;
            isDraggingLienzoTouch.current = false;
        };

        svgElement.addEventListener('wheel', handleStrictWheel, { passive: false });
        svgElement.addEventListener('touchstart', handleTouchStart, { passive: false });
        svgElement.addEventListener('touchmove', handleTouchMove, { passive: false });
        svgElement.addEventListener('touchend', handleTouchEnd);

        return () => {
            svgElement.removeEventListener('wheel', handleStrictWheel);
            svgElement.removeEventListener('touchstart', handleTouchStart);
            svgElement.removeEventListener('touchmove', handleTouchMove);
            svgElement.removeEventListener('touchend', handleTouchEnd);
        };
        // Agregamos finalizarArrastre al array de dependencias para que capture el estado de Inertia actualizado
    }, [zoom, offset, gondolaActiva, finalizarArrastre]);// Agregamos gondolaActiva a las dependencias

    useEffect(() => {
        // Si ya terminaron de cargar tus elementos desde el backend y hay al menos uno, ajustamos
        if (gondolas.length > 0) {
            // Le damos un brevísimo delay con setTimeout para asegurar que el navegador 
            // ya renderizó y calculó las dimensiones correctas (.getBoundingClientRect()) del SVG
            const timer = setTimeout(() => {
                autoAjustarMapa();
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [gondolas.length]); // 🚀 Se ejecuta automáticamente en cuanto la lista de góndolas deje de estar vacía


    // FUNCIONES
    const iniciarArrastre = (id: number, e: React.MouseEvent) => {
        e.stopPropagation(); // 🚀 EVITA que el fondo del mapa crea que estamos arrastrando el lienzo entero

        if (modoEliminar) {
            if (confirm('¿Seguro que deseas eliminar este pasillo?')) {
                router.delete(`/admin/gondolas/${id}`, {
                    preserveScroll: true
                });
            }
            return;
        }
        setGondolaActiva(id);
    };

    // 🚀 NUEVO: Iniciar el arrastre del fondo (Paneo de la tienda)
    const iniciarPaneoLienzo = (e: React.MouseEvent) => {
        if (gondolaActiva !== null) return;
        if (e.button !== 0) return; // Solo click izquierdo en PC

        setIsDraggingLienzo(true);
        startPan.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    };

    const mouseMoviendose = (e: React.MouseEvent) => {
        // Manejo exclusivo de PC cuando arrastramos el lienzo con el mouse
        if (isDraggingLienzo && gondolaActiva === null) {
            setOffset({
                x: e.clientX - startPan.current.x,
                y: e.clientY - startPan.current.y
            });
            return;
        }

        if (gondolaActiva === null) return;

        // (Tu lógica actual de mover góndolas en PC se queda igual aquí...)
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const xMundo = (e.clientX - rect.left - offset.x) / zoom;
        const yMundo = (e.clientY - rect.top - offset.y) / zoom;
        const TAMANO_CELDA = 2;
        const xForzada = Math.round(xMundo / TAMANO_CELDA) * TAMANO_CELDA;
        const yForzada = Math.round(yMundo / TAMANO_CELDA) * TAMANO_CELDA;

        setGondolas(prev =>
            prev.map(g => (g.id === gondolaActiva ? { ...g, posicion_x: xForzada, posicion_y: yForzada } : g))
        );
    };

    const autoAjustarMapa = () => {
        const svgElement = svgRef.current;
        if (!svgElement || gondolas.length === 0) return;

        // 1. Obtener las dimensiones físicas en píxeles del contenedor visual SVG actual
        const rectSvg = svgElement.getBoundingClientRect();
        const anchoContenedor = rectSvg.width;
        const altoContenedor = rectSvg.height;

        // 2. Encontrar los extremos (mínimos y máximos) de todo tu conjunto de elementos
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        gondolas.forEach((g) => {
            const anchoGondola = g.ancho || 20; // Tamaño base o predeterminado
            const altoGondola = g.alto || 8;

            if (g.posicion_x < minX) minX = g.posicion_x;
            if (g.posicion_x + anchoGondola > maxX) maxX = g.posicion_x + anchoGondola;
            if (g.posicion_y < minY) minY = g.posicion_y;
            if (g.posicion_y + altoGondola > maxY) maxY = g.posicion_y + altoGondola;
        });

        // 3. Calcular el tamaño total que ocupa la tienda en el plano de coordenadas
        const anchoTienda = maxX - minX;
        const altoTienda = maxY - minY;

        // Margen de seguridad (en píxeles) para que las góndolas no toquen los bordes de la pantalla
        const PADDING = 40;

        // 4. Calcular el zoom ideal para que todo quepa perfectamente a lo ancho y a lo alto
        const zoomX = (anchoContenedor - PADDING * 2) / anchoTienda;
        const zoomY = (altoContenedor - PADDING * 2) / altoTienda;

        // Elegimos el zoom más pequeño para asegurarnos de que nada quede fuera de la pantalla
        let zoomIdeal = Math.min(zoomX, zoomY);

        // Limitamos el zoom ideal respetando tus constantes MAX_ZOOM y MIN_ZOOM
        zoomIdeal = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomIdeal));

        // 5. Calcular el desfase (offset) matemático para centrar la tienda exactamente en el medio
        const centroTiendaX = minX + anchoTienda / 2;
        const centroTiendaY = minY + altoTienda / 2;

        const centroPantallaX = anchoContenedor / 2;
        const centroPantallaY = altoContenedor / 2;

        const offsetXIdeal = centroPantallaX - centroTiendaX * zoomIdeal;
        const offsetYIdeal = centroPantallaY - centroTiendaY * zoomIdeal;

        // 6. Aplicamos los nuevos valores al estado
        setZoom(zoomIdeal);
        setOffset({ x: offsetXIdeal, y: offsetYIdeal });
    };

    const agregarGondola = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoNombre.trim()) return;

        router.post('/admin/gondolas', {
            nombre: nuevoNombre,
            color: nuevoColor // 🚀 Enviamos el color elegido a Laravel
        }, {
            onSuccess: () => {
                setNuevoNombre('');
                // 💡 QUITAMOS el reset de color para mantener en memoria el último usado.
                // Si creás muchas seguidas, ya se quedan con el mismo tono.
            },
            preserveScroll: true
        });
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-6 flex flex-col items-center">
            <Head title="Diseñador Avanzado" />

            <div className="w-full max-w-4xl bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700 flex flex-col md:flex-row gap-6">

                {/* Panel de Controles Izquierdo */}
                <div className="w-full md:w-1/3 flex flex-col justify-between bg-slate-850 p-4 rounded-xl border border-slate-700">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">Herramientas</h2>

                        {/* Formulario de creación */}
                        <form onSubmit={agregarGondola} className="mb-6">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                Nueva Góndola / Sector
                            </label>
                            <div className="flex gap-2 items-stretch mb-3"> {/* items-stretch para que todos tengan la misma altura */}
                                <input
                                    type="text"
                                    value={nuevoNombre}
                                    onChange={(e) => setNuevoNombre(e.target.value)}
                                    placeholder="Ej: Góndola 1, Salida, Baño etc.."
                                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                                />

                                {/* 🎨 Selector de color integrado y estilizado para modo oscuro */}
                                <div className="flex items-center px-1.5 bg-slate-900 border border-slate-600 rounded-lg focus-within:border-sky-500">
                                    <input
                                        type="color"
                                        value={nuevoColor}
                                        onChange={(e) => setNuevoColor(e.target.value)}
                                        className="w-7 h-7 cursor-pointer border-0 rounded bg-transparent outline-none"
                                        title="Elegir color personalizado"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center"
                                >
                                    +
                                </button>
                            </div>

                            {/* 🎯 Paleta de colores rápidos con los tonos de tu sistema */}
                            <div className="flex items-center gap-2 px-1">
                                <span className="text-[11px] text-slate-500 font-medium">Colores rápidos:</span>
                                <div className="flex gap-1.5">
                                    {[
                                        { hex: '#475569', label: 'Góndola' },
                                        { hex: '#3fc23d', label: 'Entrada' },
                                        { hex: '#c91d25', label: 'Salida' },
                                        { hex: '#1b62c5', label: 'Cajas' },
                                        { hex: '#bcb134', label: 'Baño' }
                                    ].map((preset) => (
                                        <button
                                            key={preset.hex}
                                            type="button"
                                            onClick={() => setNuevoColor(preset.hex)}
                                            title={preset.label}
                                            className={`w-5 h-5 rounded-full border transition-all ${nuevoColor.toLowerCase() === preset.hex.toLowerCase()
                                                    ? 'border-white scale-110 shadow-lg shadow-black/50'
                                                    : 'border-slate-700 hover:scale-105'
                                                }`}
                                            style={{ backgroundColor: preset.hex }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </form>

                        <hr className="border-slate-700 mb-6" />

                        {/* Botón de borrado */}
                        <div className="mb-4">
                            <button
                                onClick={() => setModoEliminar(!modoEliminar)}
                                className={`w-full py-2 px-4 rounded-lg text-sm font-semibold border transition-all ${modoEliminar
                                    ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700'
                                    }`}
                            >
                                {modoEliminar ? '🛑 Cancelar Eliminación' : '🗑️ Modo Eliminar'}
                            </button>
                            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                                {modoEliminar
                                    ? 'Haz clic sobre cualquier pasillo en el mapa para borrarlo definitivamente.'
                                    : 'Activa este modo si deseas remover componentes del mapa.'}
                            </p>
                        </div>
                    </div>

                    <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-700">
                        Grilla Activa 100x100 • MySQL Engine
                    </div>
                </div>

                {/* Lienzo del Mapa Derecho */}
                <div className="flex-1 relative">

                    {/* 🚀 NUEVO: Botones flotantes indicadores de Zoom y Paneo */}
                    <div className="absolute top-3 right-3 flex items-center gap-2 bg-slate-900/90 border border-slate-700 backdrop-blur-sm px-3 py-1.5 rounded-xl z-10 text-xs shadow-lg">
                        <button
                            onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}
                            className="text-slate-400 hover:text-white mr-1"
                            title="Resetear Vista"
                        >
                            🔄
                        </button>
                        <span className="text-slate-300 font-mono">{Math.round(zoom * 100)}%</span>
                    </div>

                    <div className="relative w-full aspect-square border-2 border-slate-600 rounded-xl bg-slate-950 overflow-hidden shadow-inner relative">
                        <svg
                            ref={svgRef}
                            className={`w-full h-full select-none ${isDraggingLienzo ? 'cursor-grabbing' : 'cursor-grab'}`}
                            style={{
                                WebkitTapHighlightColor: 'transparent', // 📱 Evita destellos amarillos/azules raros al arrastrar en celular
                                touchAction: 'none'                     // Control táctil limpio para móviles
                            }}
                            onMouseDown={iniciarPaneoLienzo}
                            onMouseMove={mouseMoviendose}
                            onMouseUp={finalizarArrastre}
                            onMouseLeave={finalizarArrastre}
                        >
                            <defs>
                                {/* 🚀 Cambiamos patternUnits a 'userSpaceOnUse' y fijamos el tamaño visual de cada cuadradito (ej: 10x10 píxeles base) */}
                                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#334155" strokeWidth="0.2" />
                                </pattern>
                            </defs>

                            {/* 🚀 GRUPO MAESTRO: Maneja el paneo y zoom de todo el universo de la tienda */}
                            <g transform={`translate(${offset.x}, ${offset.y}) scale(${zoom})`}>

                                {/* 🚀 Fondo gigante para que la cuadrícula nunca se corte al arrastrar hacia los lados */}
                                <rect
                                    x="-10000"
                                    y="-10000"
                                    width="20000"
                                    height="20000"
                                    fill="url(#grid)"
                                    className="pointer-events-all"
                                />

                                {gondolas.map((gondola) => {
                                    // 🎨 1. Si la góndola no tiene un color guardado en la BD, usamos tu gris por defecto '#475569'
                                    const colorBase = gondola.color || '#475569';

                                    // 🎨 2. Determinamos los colores finales respetando los estados de "Eliminar" o "Seleccionada"
                                    let colorFill = colorBase;
                                    let colorStroke = colorBase;

                                    if (modoEliminar) {
                                        colorFill = '#f43f5e';  // Rojo/Rosa de advertencia
                                        colorStroke = '#e11d48';
                                    } else if (gondolaActiva === gondola.id) {
                                        colorFill = '#38bdf8';  // Celeste brillante de activo
                                        colorStroke = '#0ea5e9';
                                    }

                                    return (
                                        <g key={gondola.id}>
                                            <rect
                                                x={gondola.posicion_x}
                                                y={gondola.posicion_y}
                                                width={gondola.ancho || 20}
                                                height={gondola.alto || 8}
                                                rx="1"
                                                fill={colorFill}
                                                stroke={colorStroke}
                                                strokeWidth="0.5"
                                                style={{
                                                    WebkitTapHighlightColor: 'transparent', // 📱 Desactiva el amarillo en el elemento individual
                                                    // 🚀 TRUCO: Si no está activo ni para eliminar, oscurece el borde un 15% automáticamente para que tenga relieve gráfico profesional
                                                    filter: (modoEliminar || gondolaActiva === gondola.id) ? 'none' : 'brightness(0.85)'
                                                }}
                                                className={`transition-colors duration-100 ${modoEliminar ? 'cursor-pointer hover:fill-rose-700' : 'cursor-move'}`}
                                                // 💻 Para PC:
                                                onMouseDown={(e) => iniciarArrastre(gondola.id, e)}
                                                // 📱 Para Celular: Activamos la góndola y detenemos la propagación para que el fondo no se entere
                                                onTouchStart={(e) => {
                                                    e.stopPropagation(); // 🚀 Evita que el fondo crea que queremos arrastrar el mapa
                                                    if (!modoEliminar) {
                                                        setGondolaActiva(gondola.id);
                                                    } else {
                                                        // Si estás en modo eliminar, ejecutas tu función de borrado
                                                        // handleEliminar(gondola.id); 
                                                    }
                                                }}
                                            />
                                            <text
                                                x={gondola.posicion_x + 1}
                                                // Centrado dinámico basado en la altura del elemento
                                                y={gondola.posicion_y + (gondola.alto ? gondola.alto / 1.5 : 5)}
                                                fontSize="3"
                                                className="fill-white font-semibold pointer-events-none select-none"
                                            >
                                                {gondola.nombre}
                                            </text>
                                        </g>
                                    );
                                })}
                            </g>
                        </svg>
                        {/* 🎯 BOTÓN FLOTANTE CENTRAR VISTA */}
                        <button
                            onClick={autoAjustarMapa}
                            className="absolute bottom-4 right-4 bg-slate-800 hover:bg-slate-700 text-white p-2.5 rounded-lg shadow-lg border border-slate-600 transition-all active:scale-95 flex items-center justify-center gap-2 text-xs font-medium z-10"
                            title="Centrar mapa automáticamente"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" />
                            </svg>
                            Centrar Vista
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

MapaDesigner.layout = {
    breadcrumbs: [
        {
            title: 'Diseñador de Mapa',
            href: '/admin/mapa', // 👈 La URL de tu ruta del mapa
        },
    ],
};