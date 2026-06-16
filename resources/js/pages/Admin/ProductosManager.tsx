import { Head, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { dashboard } from '@/routes';
// import Dashboard from '../dashboard';


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

    // 🔍 NUEVO: Estado para el buscador en tiempo real
    const [filtro, setFiltro] = useState('');

    // 🔄 Estado para controlar si estamos editando un producto existente
    const [editandoId, setEditandoId] = useState<number | null>(null);

    // 🔄 Cambiar al modo edición rellenando el formulario de la izquierda
    const activarEdicion = (prod: Producto) => {
        setEditandoId(prod.id);
        setNombre(prod.nombre);
        setCodigoBarras(prod.codigo_barras || '');
        setGondolaId(prod.gondola_id ? String(prod.gondola_id) : '');
    };

    // 🔄 Limpiar formulario y salir del modo edición
    const limpiarFormulario = () => {
        setNombre('');
        setCodigoBarras('');
        setGondolaId('');
        setEditandoId(null);
    };

    const guardarProducto = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim()) return;

        const payload = {
            nombre: nombre,
            codigo_barras: codigoBarras || null,
            gondola_id: gondolaId || null
        };

        if (editandoId) {
            // 🔄 Si hay un ID en memoria, hacemos un PUT para ACTUALIZAR
            router.put(`/admin/productos/${editandoId}`, payload, {
                preserveScroll: true,
                onSuccess: () => limpiarFormulario()
            });
        } else { // 👈 Corregido: Se agregó el 'else' que faltaba aquí
            // Si no estamos editando, se comporta como un POST tradicional (Crear)
            router.post('/admin/productos', payload, {
                preserveScroll: true,
                onSuccess: () => limpiarFormulario()
            });
        }
    };

    const eliminarProducto = (id: number) => {
        if (confirm('¿Deseas eliminar este artículo permanentemente?')) {
            router.delete(`/admin/productos/${id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    // Si justo borran el que se estaba editando, limpiamos el panel
                    if (editandoId === id) limpiarFormulario();
                }
            });
        }
    };

    // 🔍 Filtrado inteligente (Ignora mayúsculas, minúsculas y ESPACIOS de más)
    const productosFiltrados = productos.filter((prod) => {
        // .trim() borra los espacios fantasma del principio y del final antes de buscar
        const busquedaLower = filtro.trim().toLowerCase();

        // Si el usuario solo escribió espacios, mostramos toda la lista
        if (!busquedaLower) return true;

        const coincideNombre = prod.nombre.toLowerCase().includes(busquedaLower);
        const coincideCodigo = prod.codigo_barras?.toLowerCase().includes(busquedaLower) || false;

        return coincideNombre || coincideCodigo;
    });

    return (

        <>
            {/* <PageHeader title=''/> */}
            <div className="min-h-screen bg-slate-900 text-slate-100 p-6 flex flex-col items-center">
                <Head title="Panel de Inventario" />

                <div className="w-full max-w-4xl bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700 flex flex-col md:flex-row gap-6">

                    {/* Formulario Izquierdo (Mutación Dinámica) */}
                    <div className="w-full md:w-1/3 bg-slate-850 p-4 rounded-xl border border-slate-700 flex flex-col justify-between">
                        <form onSubmit={guardarProducto}>
                            {/* 🔄 Título reactivo según el modo */}
                            <h2 className="text-xl font-bold text-white mb-4">
                                {editandoId ? '📝 Editar Artículo' : 'Cargar Artículo'}
                            </h2>

                            {/* Input Nombre */}
                            <div className="mb-3">
                                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder="Ej: Fideos"
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                                />
                            </div>

                            {/* Selector Pasillo */}
                            <div className="mb-5">
                                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                                    Ubicación (Góndola / sector)
                                </label>
                                <select
                                    value={gondolaId}
                                    onChange={(e) => setGondolaId(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                                >
                                    <option value="">-- Sin asignar --</option>
                                    {gondolas.map((g) => (
                                        <option key={g.id} value={g.id} className="bg-slate-850">
                                            {g.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                {/* 🔄 Botón de acción principal con color e icono dinámico */}
                                <button
                                    type="submit"
                                    className={`cursor-pointer w-full py-2 text-white font-bold text-sm rounded-lg transition-colors ${editandoId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-sky-600 hover:bg-sky-500'
                                        }`}
                                >
                                    {editandoId ? '💾 Guardar Cambios' : '➕ Registrar Producto'}
                                </button>

                                {/* 🔄 Botón condicional para salir de la edición */}
                                {editandoId && (
                                    <button
                                        type="button"
                                        onClick={limpiarFormulario}
                                        className="w-full py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                                    >
                                        Cancelar Edición
                                    </button>
                                )}
                            </div>
                        </form>

                        <div className="text-xs text-slate-500 text-center pt-3 border-t border-slate-700 mt-4">
                            Motor MySQL • Estructura Indexada
                        </div>
                    </div>

                    {/* Listado de Artículos Derecho */}
                    <div className="flex-1 bg-slate-850 p-4 rounded-xl border border-slate-700 flex flex-col">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                            <h2 className="text-xl font-bold text-white">Stock Registrado ({productos.length})</h2>

                            {/* 🔍 NUEVO: Input del Buscador */}
                            <div className="relative w-full sm:w-64">
                                <input
                                    type="text"
                                    value={filtro}
                                    onChange={(e) => setFiltro(e.target.value)}
                                    placeholder="🔍 Buscar por nombre o ID..."
                                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                                />
                                {filtro && (
                                    <button
                                        onClick={() => setFiltro('')}
                                        className="cursor-pointer absolute right-2 top-2 text-xs text-slate-500 hover:text-slate-300"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>

                        {productos.length === 0 ? (
                            <p className="text-sm text-slate-500 italic py-8 text-center">No hay productos cargados en el sistema.</p>
                        ) : productosFiltrados.length === 0 ? (
                            // 🔍 NUEVO: Estado alternativo por si la búsqueda no arroja resultados
                            <p className="text-sm text-slate-500 italic py-8 text-center">
                                No se encontraron productos que coincidan con "{filtro}".
                            </p>
                        ) : (
                            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2">
                                {/* 🔍 AHORA MAPEAMOS LA LISTA FILTRADA */}
                                {productosFiltrados.map((prod) => (
                                    <div
                                        key={prod.id}
                                        className={`flex justify-between items-center p-3 bg-slate-900 rounded-lg border transition-all ${editandoId === prod.id ? 'border-amber-500 shadow-md shadow-amber-500/10' : 'border-slate-700 hover:border-slate-600'
                                            }`}
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

                                        {/* 🔄 Contenedor de acciones (Editar y Eliminar) */}
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => activarEdicion(prod)}
                                                title="Editar producto"
                                                className={`cursor-pointer p-1.5 text-xs rounded transition-colors ${editandoId === prod.id ? 'text-amber-400 bg-slate-800' : 'text-slate-400 hover:text-amber-400'
                                                    }`}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => eliminarProducto(prod.id)}
                                                title="Eliminar producto"
                                                className="cursor-pointer text-slate-500 hover:text-rose-400 p-1.5 text-xs transition-colors"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
}


// ❌ No importás ninguna función de rutas

ProductosManager.layout = {
    breadcrumbs: [
        {
            title: 'Gestor de Productos',
            href: '/admin/productos', // 👈 Ponés la URL exacta que definiste en Laravel (web.php)
        },
    ],
};