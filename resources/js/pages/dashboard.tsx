import { Head, Link } from '@inertiajs/react';
import { Layers, Map, Package } from 'lucide-react';
import MapaPreview from '@/components/MapaPreview';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';

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
    stats: {
        productos: number;
        gondolas: number;
        mapas: number;
    };
    gondolas: Gondola[];
}

export default function Dashboard({ stats, gondolas }: Props) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardDescription>Productos</CardDescription>
                                <Package className="size-4 text-muted-foreground" />
                            </div>
                            <CardTitle className="text-3xl tabular-nums">
                                {stats.productos}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                Referencias cargadas en el catálogo
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardDescription>Góndolas</CardDescription>
                                <Map className="size-4 text-muted-foreground" />
                            </div>
                            <CardTitle className="text-3xl tabular-nums">
                                {stats.gondolas}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                Elementos diseñados en el mapa actual
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardDescription>Mapas</CardDescription>
                                <Layers className="size-4 text-muted-foreground" />
                            </div>
                            <CardTitle className="text-3xl tabular-nums">
                                {stats.mapas}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                Mapa activo · próximamente: guardar y activar varios
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="flex min-h-[420px] flex-1 flex-col">
                    <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                        <div>
                            <CardTitle>Mapa actual</CardTitle>
                            <CardDescription>
                                Vista de solo lectura. Podés mover y hacer zoom para explorar.
                            </CardDescription>
                        </div>
                        <Link
                            href="/admin/gondolas"
                            className="shrink-0 text-sm font-medium text-primary hover:underline"
                        >
                            Editar mapa →
                        </Link>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col">
                        <MapaPreview gondolas={gondolas} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};