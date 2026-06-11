import { Head, router } from '@inertiajs/react';
import React, { useState } from 'react';

interface Gondola {
    id: number;
    nombre: string;
}

interface Producto {
    id: number;
    nombre: string;
    codigo_barras?: string | null;
    gondola_id?: number | null;
    gondola?: Gondola | null;
}

interface Props {
    productos: Producto[];
    gondolas: Gondola[];
}

export default function ProductosManager({ productos, gondolas }: Props) {
    const [nombre, setNombre] = useState('');
    const [codigoBarras, setCodigoBarras] = useState('');
    const [gondolaId, setGondolaId] = useState('');

    const guardarProducto = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim()) return;

        router.post('/admin/productos', {
            nombre: nombre,
            codigo_barras: codigoBarras || null,
            gondola_id: gondolaId || null
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setNombre('');
                setCodigoBarras('');
                setGondolaId('');
            }
        });
    };

    const eliminarProducto = (id: number) => {
        if (confirm('¿Deseas eliminar este artículo permanentemente?')) {
            router.delete(`/admin/productos/${id}`, {
                preserveScroll: true
            });
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-6 flex flex-col items-center">
            <Head title="Panel de Inventario" />

            <div className="w-full max-w-4xl bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700 flex flex-col md:flex-row gap-6">
                
                {/* Formulario Izquierdo */}
                <div className="w-full md:w-1/3 bg-slate-850 p-4 rounded-xl border border-slate-700 flex flex-col justify-between">
                    <form onSubmit={guardarProducto}>
                        <h2 className="text-xl font-bold text-white mb-4">Cargar Artículo</h2>

                        {/* Input Nombre */}
                        <div className="mb-3">
                            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                                Nombre
                            </label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Ej: Fideos Tallarín 500g"
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                            />
                        </div>

                        {/* Input Código de Barras */}
                        <div className="mb-3">
                            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                                Código de Barras (Opcional)
                            </label>
                            <input
                                type="text"
                                value={codigoBarras}
                                onChange={(e) => setCodigoBarras(e.target.value)}
                                placeholder="Ej: 779123456789"
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                            />
                        </div>

                        {/* Selector Pasillo */}
                        <div className="mb-5">
                            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                                Ubicación (Góndola)
                            </label>
                            <select
                                value={gondolaId}
                                onChange={(e) => setGondolaId(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                            >
                                <option value="">-- Sin asignar / En depósito --</option>
                                {gondolas.map((g) => (
                                    <option key={g.id} value={g.id} className="bg-slate-850">
                                        {g.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm rounded-lg transition-colors"
                        >
                            ➕ Registrar Producto
                        </button>
                    </form>
                    
                    <div className="text-xs text-slate-500 text-center pt-3 border-t border-slate-700 mt-4">
                        Motor MySQL • Estructura Indexada
                    </div>
                </div>

                {/* Listado de Artículos Derecho */}
                <div className="flex-1 bg-slate-850 p-4 rounded-xl border border-slate-700">
                    <h2 className="text-xl font-bold text-white mb-4">Stock Registrado ({productos.length})</h2>

                    {productos.length === 0 ? (
                        <p className="text-sm text-slate-500 italic py-8 text-center">No hay productos cargados en el sistema.</p>
                    ) : (
                        <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2">
                            {productos.map((prod) => (
                                <div 
                                    key={prod.id} 
                                    className="flex justify-between items-center p-3 bg-slate-900 rounded-lg border border-slate-700 hover:border-slate-600 transition-all"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-white">{prod.nombre}</p>
                                        <div className="flex gap-2 mt-1 items-center">
                                            <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-sky-400 border border-sky-900/40 rounded-full font-medium">
                                                📍 {prod.gondola?.nombre || 'Sin góndola / Depósito'}
                                            </span>
                                            {prod.codigo_barras && (
                                                <span className="text-[10px] text-slate-400 italic">
                                                    🆔 {prod.codigo_barras}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => eliminarProducto(prod.id)}
                                        className="text-slate-500 hover:text-rose-400 p-1 text-sm transition-colors"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}