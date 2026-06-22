export function formatearLista(items: string[]): string {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} y ${items[1]}`;

    return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}