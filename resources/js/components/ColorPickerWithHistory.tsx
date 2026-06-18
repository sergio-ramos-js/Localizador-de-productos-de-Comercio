import { useMemo } from 'react';

const STORAGE_KEY = 'mapa-tienda-colores-usados';
const MAX_HISTORY = 14;
const DEFAULT_COLOR = '#475569';

function normalizeHex(color: string): string {
    const value = color.trim().toLowerCase();

    if (/^#[0-9a-f]{6}$/.test(value)) {
        return value;
    }

    if (/^#[0-9a-f]{3}$/.test(value)) {
        return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
    }

    return DEFAULT_COLOR;
}

function readStoredColors(): string[] {
    if (typeof window === 'undefined') return [];

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed
            .filter((color): color is string => typeof color === 'string')
            .map(normalizeHex);
    } catch {
        return [];
    }
}

function writeStoredColors(colors: string[]) {
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(colors.slice(0, MAX_HISTORY)));
}

function mergeColorHistory(mapColors: string[], selectedColor: string): string[] {
    const merged = [
        normalizeHex(selectedColor),
        ...mapColors.map(normalizeHex),
        ...readStoredColors(),
    ];

    return [...new Set(merged)].slice(0, MAX_HISTORY);
}

function rememberColor(color: string) {
    const normalized = normalizeHex(color);
    const history = mergeColorHistory([], normalized).filter((item) => item !== normalized);
    writeStoredColors([normalized, ...history]);
}

interface ColorPickerWithHistoryProps {
    value: string;
    onChange: (color: string) => void;
    mapColors?: string[];
}

export default function ColorPickerWithHistory({
    value,
    onChange,
    mapColors = [],
}: ColorPickerWithHistoryProps) {
    const normalizedValue = normalizeHex(value);

    const colorHistory = useMemo(
        () => mergeColorHistory(mapColors, normalizedValue),
        [mapColors, normalizedValue],
    );

    const handleChange = (color: string) => {
        const normalized = normalizeHex(color);
        onChange(normalized);
        rememberColor(normalized);
    };

    return (
        <div>
            <div className="flex items-center justify-between sm:gap-3 gap-3">
                <div className="flex flex-col sm:w-1/2 min-w-1/5">
                    <label className="block text-[10px] uppercase text-slate-500 mb-1">Color</label>
                    <input
                        type="color"
                        value={normalizedValue}
                        onChange={(e) => handleChange(e.target.value)}
                        className="w-full px-3 py-1 h-10.5 bg-slate-900 border border-slate-600 rounded-lg cursor-pointer"
                    />
                </div>

                {colorHistory.length > 0 && (
                    <div className="">
                        <p className="text-[10px] uppercase text-slate-500 mb-1.5">Colores usados</p>
                        <div className="flex flex-wrap gap-1.5">
                            {colorHistory.map((color) => {
                                const isSelected = color === normalizedValue;

                                return (
                                    <button
                                        key={color}
                                        type="button"
                                        title={color}
                                        aria-label={`Usar color ${color}`}
                                        onClick={() => handleChange(color)}
                                        className={`h-7 w-7 rounded-md border-2 transition-transform hover:scale-105 ${isSelected
                                            ? 'border-white ring-2 ring-sky-400 ring-offset-1 ring-offset-slate-900'
                                            : 'border-slate-600'
                                            }`}
                                        style={{ backgroundColor: color }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}