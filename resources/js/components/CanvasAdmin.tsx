import React, { useState, useEffect } from 'react';
import router from '@inertiajs/react'; // O puedes usar axios si lo prefieres

interface Gondola {
    id: number;
    nombre: string;
    posicion_x: number;
    posicion_y: number;
    ancho: number;
    alto: number;
}

export default function CanvasAdmin() {
    const [gondolas, setGondolas] = useState<Gondola[]>([]);
    const [gondolaActiva, setGondolaActiva] = useState<number | null>(null);

    const TAMANO_GRILLA = 100; // Grilla virtual de 100x100 unidades

    // Simulamos la carga inicial. En tu vista real pasarías esto como props desde Laravel o mediante un fetch
    useEffect(() => {
        // Haces una petición para cargar las góndolas existentes
        fetch('/admin/gondolas')
            .then(res => res.json())
            .then((data: Gondola[]) => setGondolas(data));
    }, []);

    const iniciarArrastre = (id: number) => {
        setGondolaActiva(id);
    };

    const mouseMoviendose = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
        if (gondolaActiva === null) return;

        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();

        // Calculamos la posición del mouse relativa al SVG en pixeles
        const xPixel = e.clientX - rect.left;
        const yPixel = e.clientY - rect.top;

        // Convertimos esos pixeles a nuestras unidades de la grilla (0 a 100)
        // Usamos Math.round para obligar al bloque a "encajar" (Snap) en números enteros
        const nuevaX = Math.round((xPixel / rect.width) * TAMANO_GRILLA);
        const nuevaY = Math.round((yPixel / rect.height) * TAMANO_GRILLA);

        // Limitamos el movimiento dentro del mapa para que no se salga del lienzo
        const xForzada = Math.max(0, Math.min(TAMANO_GRILLA, nuevaX));
        const yForzada = Math.max(0, Math.min(TAMANO_GRILLA, nuevaY));

        // Actualizamos visualmente el estado en React en tiempo real (UI fluida)
        setGondolas(prev =>
            prev.map(g => (g.id === gondolaActiva ? { ...g, posicion_x: xForzada, posicion_y: yForzada } : g))
        );
    };

    const finalizarArrastre = (id: number, xFinal: number, yFinal: number) => {
        if (gondolaActiva === null) return;
        setGondolaActiva(null);

        // Mandamos las coordenadas finales redondeadas a Laravel para guardarlas en MySQL
        fetch(`/admin/gondolas/${id}/posicion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
            },
            body: JSON.stringify({
                posicion_x: xFinal,
                posicion_y: yFinal
            })
        })
        .then(res => res.json())
        .then(data => console.log("Guardado:", data.message))
        .catch(err => console.error("Error al guardar", err));
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Diseñador del Layout Comercial</h2>
            <p className="text-sm text-gray-500 mb-4">Haz clic y mantén presionado sobre una góndola gris para moverla. Se alineará automáticamente a la cuadrícula.</p>

            <div className="border-4 border-gray-200 rounded-xl bg-gray-50 overflow-hidden shadow-inner aspect-square w-full max-w-xl mx-auto">
                {/* Lienzo SVG interactivo */}
                <svg
                    viewBox={`0 0 ${TAMANO_GRILLA} ${TAMANO_GRILLA}`}
                    className="w-full h-full select-none"
                    onMouseMove={mouseMoviendose}
                    onMouseUp={() => {
                        const activa = gondolas.find(g => g.id === gondolaActiva);
                        if (activa) finalizarArrastre(activa.id, activa.posicion_x, activa.posicion_y);
                    }}
                    onMouseLeave={() => {
                        const activa = gondolas.find(g => g.id === gondolaActiva);
                        if (activa) finalizarArrastre(activa.id, activa.posicion_x, activa.posicion_y);
                    }}
                >
                    {/* Renderizado de las góndolas guardadas */}
                    {gondolas.map((gondola) => (
                        <g key={gondola.id}>
                            <rect
                                x={gondola.posicion_x}
                                y={gondola.posicion_y}
                                width={gondola.ancho}
                                height={gondola.alto}
                                rx="1"
                                fill={gondolaActiva === gondola.id ? '#93c5fd' : '#e2e8f0'}
                                stroke={gondolaActiva === gondola.id ? '#3b82f6' : '#94a3b8'}
                                strokeWidth="0.5"
                                className="cursor-move transition-colors duration-150"
                                onMouseDown={() => iniciarArrastre(gondola.id)}
                            />
                            <text
                                x={gondola.posicion_x + 1}
                                y={gondola.posicion_y + 3}
                                fontSize="2.5"
                                fill="#475569"
                                className="pointer-events-none select-none font-medium"
                            >
                                {gondola.nombre}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    );
}