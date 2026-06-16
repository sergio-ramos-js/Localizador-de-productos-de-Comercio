import { Head } from '@inertiajs/react';
import { Download, Printer, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import React, { useRef } from 'react';

interface Props {
    urlBuscar: string;
}

export default function QrGenerator({ urlBuscar }: Props) {
    const qrRef = useRef<HTMLDivElement>(null);

    // Función para descargar el QR como una imagen PNG
    const descargarQR = () => {
        const svgElement = qrRef.current?.querySelector('svg');
        if (!svgElement) return;

        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const URL = window.URL || window.webkitURL || window;
        const blobURL = URL.createObjectURL(svgBlob);
        
        const image = new Image();
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 500;
            canvas.height = 500;
            const context = canvas.getContext('2d');
            if (context) {
                context.fillStyle = '#FFFFFF';
                context.fillRect(0, 0, 500, 500);
                context.drawImage(image, 50, 50, 400, 400);
                
                const pngRef = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.href = pngRef;
                downloadLink.download = 'QR-GPS-Local-Buscar.png';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            }
        };
        image.src = blobURL;
    };

    // Función para mandar a imprimir solo el cartel del QR de forma prolija
    const imprimirQR = () => {
        window.print();
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <Head title="Generador de Código QR" />

            {/* Encabezado - Oculto al imprimir */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight  flex items-center gap-2">
                        <QrCode className="h-6 w-6 text-sky-500" />
                        Código QR de la Tienda
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Genera, descarga o imprime el código QR para que tus clientes escaneen al ingresar al local.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={descargarQR}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors border border-slate-200"
                    >
                        <Download className="h-4 w-4" />
                        Descargar PNG
                    </button>
                    <button
                        onClick={imprimirQR}
                        className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                    >
                        <Printer className="h-4 w-4" />
                        Imprimir Cartel
                    </button>
                </div>
            </div>

            {/* Bloque Informativo - Oculto al imprimir */}
            <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl text-sm text-sky-800 flex gap-3 print:hidden">
                <span className="text-base">💡</span>
                <div>
                    <span className="font-bold">Dirección del QR:</span> Este código apunta automáticamente a la URL pública de tu buscador:{' '}
                    <code className="bg-sky-100 px-1.5 py-0.5 rounded font-mono text-xs text-sky-900">{urlBuscar}</code>. 
                    Al escanearlo con cualquier teléfono celular se abrirá el buscador interactivo del cliente.
                </div>
            </div>

            {/* Contenedor del Cartel Imprimible */}
            <div className="flex justify-center pt-6">
                <div 
                    ref={qrRef}
                    className="w-full max-w-md bg-white border-2 border-slate-900 rounded-3xl p-8 shadow-xl text-center flex flex-col items-center justify-center space-y-6 print:border-0 print:shadow-none print:my-0 print:mx-auto"
                >
                    {/* Texto superior del cartel */}
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-slate-950 uppercase">
                            🛒 Buscador Digital
                        </h2>
                        <p className="text-sm text-slate-600 font-medium mt-1">
                            ¿No encuentras un producto? ¡Te ayudamos!
                        </p>
                    </div>

                    {/* El Código QR real */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner print:bg-white print:border-0 print:shadow-none">
                        <QRCodeSVG
                            value={urlBuscar}
                            size={260}
                            level="H" // Alta tolerancia a errores (permite arrugas o raspaduras en el papel)
                            includeMargin={false}
                        />
                    </div>

                    {/* Instrucciones de uso para el cliente */}
                    <div className="space-y-2">
                        <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold tracking-wide uppercase">
                            <span>1. Escanea el QR</span>
                            <span>➔</span>
                            <span>2. Busca tu artículo</span>
                        </div>
                        <p className="text-xs text-slate-500 font-semibold pt-1">
                            Abre la cámara de tu celular para desplegar el plano interactivo de góndolas.
                        </p>
                    </div>
                </div>
            </div>

            {/* Estilos CSS específicos para la vista de Impresión */}
            <style>{`
                @media print {
                    body {
                        background-color: white !important;
                        color: black !important;
                    }
                    /* Oculta el Sidebar y el header de la plantilla de administración */
                    header, nav, aside, .print\\:hidden {
                        display: none !important;
                    }
                    /* Centra el cartel exactamente en medio de la hoja A4 a imprimir */
                    main, .p-6 {
                        padding: 0 !important;
                        margin: 0 !important;
                        display: flex !important;
                        justify-content: center !important;
                        align-items: center !important;
                        height: 100vh !important;
                    }
                }
            `}</style>
        </div>
    );
}

QrGenerator.layout = {
    breadcrumbs: [
        {
            title: 'QR para buscador',
            href: '/admin/qr', // 👈 La URL de tu ruta del mapa
        },
    ],
};