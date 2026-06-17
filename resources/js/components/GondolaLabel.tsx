const LABEL_FONT_BASE = 3;
const LABEL_LINE_HEIGHT = 1.15;
const LABEL_CHAR_WIDTH = 0.55;
const LABEL_PADDING = 1;

function wrapLabelText(text: string, maxWidth: number, fontSize: number): string[] {
    if (!text.trim()) return [''];

    const maxChars = Math.max(1, Math.floor(maxWidth / (fontSize * LABEL_CHAR_WIDTH)));
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        const candidate = currentLine ? `${currentLine} ${word}` : word;

        if (candidate.length <= maxChars) {
            currentLine = candidate;
            continue;
        }

        if (currentLine) {
            lines.push(currentLine);
            currentLine = '';
        }

        if (word.length <= maxChars) {
            currentLine = word;
            continue;
        }

        for (let i = 0; i < word.length; i += maxChars) {
            lines.push(word.slice(i, i + maxChars));
        }
    }

    if (currentLine) lines.push(currentLine);

    return lines.length > 0 ? lines : [''];
}

function fitLabelText(text: string, width: number, height: number) {
    let fontSize = LABEL_FONT_BASE;

    while (fontSize >= 1.4) {
        const lines = wrapLabelText(text, width, fontSize);
        const blockHeight = lines.length * fontSize * LABEL_LINE_HEIGHT;

        if (blockHeight <= height) {
            return { lines, fontSize };
        }

        fontSize -= 0.2;
    }

    return {
        lines: wrapLabelText(text, width, 1.4),
        fontSize: 1.4,
    };
}

interface GondolaLabelProps {
    nombre: string;
    x: number;
    y: number;
    ancho: number;
    alto: number;
    fill?: string;
}

export default function GondolaLabel({
    nombre,
    x,
    y,
    ancho,
    alto,
    fill = '#ffffff',
}: GondolaLabelProps) {
    const isVertical = alto > ancho;
    const centerX = x + ancho / 2;
    const centerY = y + alto / 2;
    const wrapWidth = (isVertical ? alto : ancho) - LABEL_PADDING * 2;
    const wrapHeight = (isVertical ? ancho : alto) - LABEL_PADDING * 2;
    const { lines, fontSize } = fitLabelText(nombre, wrapWidth, wrapHeight);
    const lineHeight = fontSize * LABEL_LINE_HEIGHT;
    const blockHeight = lines.length * lineHeight;
    const startY = -blockHeight / 2 + fontSize * 0.8;

    return (
        <g transform={`translate(${centerX}, ${centerY})${isVertical ? ' rotate(-90)' : ''}`}>
            <text
                textAnchor="middle"
                fontSize={fontSize}
                fill={fill}
                fontWeight={600}
                className="pointer-events-none select-none"
            >
                {lines.map((line, index) => (
                    <tspan key={index} x={0} dy={index === 0 ? startY : lineHeight}>
                        {line}
                    </tspan>
                ))}
            </text>
        </g>
    );
}