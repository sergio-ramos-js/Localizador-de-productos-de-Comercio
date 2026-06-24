import React, { useEffect, useRef, useState } from 'react';
import GondolaLabel from '@/components/GondolaLabel';

interface Gondola {
    id: number;
    nombre: string;
    color?: string;
    posicion_x: number;
    posicion_y: number;
    ancho: number;
    alto: number;
}

interface Props {
    gondolas: Gondola[];
}

const TAMANO_GRILLA = 100;
const FACTOR_SENSIBILIDAD = 0.3;

export default function MapaPreview({ gondolas }: Props) {
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const startPan = useRef({ x: 0, y: 0 });
    const svgRef = useRef<SVGSVGElement>(null);

    const resetearVista = () => {
        setScale(1);
        setOffset({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        startPan.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;

        const deltaX = e.clientX - startPan.current.x;
        const deltaY = e.clientY - startPan.current.y;

        startPan.current = { x: e.clientX, y: e.clientY };

        setOffset((prev) => ({
            x: prev.x + deltaX * FACTOR_SENSIBILIDAD,
            y: prev.y + deltaY * FACTOR_SENSIBILIDAD,
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

            const minX = Math.min(...gondolas.map((g) => Number(g.posicion_x)));
            const maxX = Math.max(
                ...gondolas.map((g) => Number(g.posicion_x) + (Number(g.ancho) || 20)),
            );
            const minY = Math.min(...gondolas.map((g) => Number(g.posicion_y)));
            const maxY = Math.max(
                ...gondolas.map((g) => Number(g.posicion_y) + (Number(g.alto) || 8)),
            );

            const centroMapaX = (minX + maxX) / 2;
            const centroMapaY = (minY + maxY) / 2;

            const anchoMapaReal = maxX - minX;
            const altoMapaReal = maxY - minY;

            const relacionEscalaX = TAMANO_GRILLA / (anchoMapaReal || 1);
            const relacionEscalaY = TAMANO_GRILLA / (altoMapaReal || 1);

            const escalaInicial = Math.min(relacionEscalaX, relacionEscalaY) * 0.75;
            const escalaFinal = Math.max(0.6, Math.min(escalaInicial, 2.2));

            const nuevoX = TAMANO_GRILLA / 2 - centroMapaX * escalaFinal;
            const nuevoY = TAMANO_GRILLA / 2 - centroMapaY * escalaFinal;

            setScale(escalaFinal);
            setOffset({ x: nuevoX, y: nuevoY });
        };

        ajustarVistaGeneral();

        const observer = new ResizeObserver(ajustarVistaGeneral);
        observer.observe(svgRef.current);

        return () => observer.disconnect();
    }, [gondolas]);

    if (gondolas.length === 0) {
        return (
            <div className="flex min-h-[320px] flex-1 items-center justify-center rounded-lg border border-dashed border-sidebar-border/70 bg-muted/30 p-8 text-center">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        Todavía no hay góndolas en el mapa
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/80">
                        Creá el diseño desde el panel de mapa para ver la vista previa acá.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-[320px] flex-1 overflow-hidden rounded-lg border border-sidebar-border/70 bg-slate-950">
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
                <button
                    type="button"
                    onClick={() => setScale((s) => Math.min(s + 0.3, 4))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/90 text-sm font-bold text-white shadow transition-transform active:scale-95"
                    aria-label="Acercar"
                >
                    ＋
                </button>
                <button
                    type="button"
                    onClick={() => setScale((s) => Math.max(s - 0.3, 0.4))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/90 text-sm font-bold text-white shadow transition-transform active:scale-95"
                    aria-label="Alejar"
                >
                    －
                </button>
                <button
                    type="button"
                    onClick={resetearVista}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/90 text-xs text-slate-300 shadow transition-transform active:scale-95"
                    aria-label="Restablecer vista"
                >
                    ↺
                </button>
            </div>

            <svg
                ref={svgRef}
                viewBox={`0 0 ${TAMANO_GRILLA} ${TAMANO_GRILLA}`}
                className={`h-full min-h-[320px] w-full select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleStopDragging}
                onMouseLeave={handleStopDragging}
            >
                <g transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}>
                    <defs>
                        <pattern
                            id="dashboard-map-grid"
                            width="10"
                            height="10"
                            patternUnits="userSpaceOnUse"
                        >
                            <path
                                d="M 10 0 L 0 0 0 10"
                                fill="none"
                                stroke="#1e293b"
                                strokeWidth="0.15"
                            />
                        </pattern>
                    </defs>
                    <rect
                        x="-200"
                        y="-200"
                        width="500"
                        height="500"
                        fill="url(#dashboard-map-grid)"
                        pointerEvents="none"
                    />

                    {gondolas.map((gondola) => {
                        const colorBase = gondola.color || '#475569';
                        const gAncho = gondola.ancho || 20;
                        const gAlto = gondola.alto || 8;

                        return (
                            <g key={gondola.id} pointerEvents="none">
                                <rect
                                    x={gondola.posicion_x}
                                    y={gondola.posicion_y}
                                    width={gAncho}
                                    height={gAlto}
                                    rx="1"
                                    fill={colorBase}
                                    stroke={colorBase}
                                    strokeWidth="0.5"
                                    style={{ filter: 'brightness(0.85)' }}
                                />
                                <GondolaLabel
                                    nombre={gondola.nombre}
                                    x={gondola.posicion_x}
                                    y={gondola.posicion_y}
                                    ancho={gAncho}
                                    alto={gAlto}
                                    backgroundColor={colorBase}
                                />
                            </g>
                        );
                    })}
                </g>
            </svg>
        </div>
    );
}