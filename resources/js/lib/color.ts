const TEXT_LIGHT = '#ffffff';
const TEXT_DARK = '#1c1917';

function normalizeHex(color: string): string {
    const value = color.trim().toLowerCase();

    if (/^#[0-9a-f]{6}$/.test(value)) {
        return value;
    }

    if (/^#[0-9a-f]{3}$/.test(value)) {
        return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
    }

    return '#475569';
}

export function getContrastTextColor(backgroundColor: string): string {
    const hex = normalizeHex(backgroundColor);
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness >= 140 ? TEXT_DARK : TEXT_LIGHT;
}