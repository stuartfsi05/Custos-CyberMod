export interface GcodeParsedData {
    weightG: number | null;
    printHours: number;
    printMinutes: number;
    totalMinutes: number;
    slicerName?: string;
    suggestedProjectName?: string;
}

const STANDARD_175MM_GRAMS_PER_METER = 2.98;

function sumNumericList(raw: string): number {
    return raw
        .split(/[,;\s]+/)
        .map(token => parseFloat(token.replace(/[^\d.]/g, '')))
        .filter(val => Number.isFinite(val) && val > 0)
        .reduce((sum, val) => sum + val, 0);
}

function parseTimeStringToSeconds(raw: string): number {
    const trimmed = raw.trim();

    // Matches formats like "1d 2h 15m 30s", "1h 17m", "45m 10s", "2h30m"
    const unitRegex = /(\d+(?:\.\d+)?)\s*(d|h|hr|hrs|m|min|mins|s|sec|secs)\b/gi;
    let totalSeconds = 0;
    let matchedUnits = false;

    for (const match of trimmed.matchAll(unitRegex)) {
        matchedUnits = true;
        const value = parseFloat(match[1]);
        const unit = match[2].toLowerCase();
        if (unit.startsWith('d')) {
            totalSeconds += value * 86400;
        } else if (unit.startsWith('h')) {
            totalSeconds += value * 3600;
        } else if (unit.startsWith('m')) {
            totalSeconds += value * 60;
        } else {
            totalSeconds += value;
        }
    }

    if (matchedUnits) {
        return totalSeconds;
    }

    // Matches numeric seconds (e.g. Cura ";TIME:4620")
    const numericOnly = parseFloat(trimmed);
    if (Number.isFinite(numericOnly) && numericOnly > 0) {
        return numericOnly;
    }

    return 0;
}

function detectSlicer(content: string): string | undefined {
    if (/BambuStudio|Bambu Studio/i.test(content)) return 'Bambu Studio';
    if (/OrcaSlicer/i.test(content)) return 'OrcaSlicer';
    if (/PrusaSlicer/i.test(content)) return 'PrusaSlicer';
    if (/SuperSlicer/i.test(content)) return 'SuperSlicer';
    if (/Cura_SteamEngine|ULTIMAKER CURA/i.test(content)) return 'Cura';
    if (/Snapmaker Luban/i.test(content)) return 'Snapmaker Luban';
    return undefined;
}

function cleanFileNameToProjectName(fileName?: string): string | undefined {
    if (!fileName) return undefined;
    const base = fileName.replace(/\.(gcode|gco|g)$/i, '').replace(/[_-]+/g, ' ').trim();
    return base || undefined;
}

/**
 * Extrai peso (em gramas) e tempo total de impressão dos comentários de metadata de um arquivo .gcode.
 * Suporta Bambu Studio, OrcaSlicer, PrusaSlicer, SuperSlicer, Ultimaker Cura e Snapmaker Luban.
 */
export function parseGcodeMetadata(content: string, fileName?: string): GcodeParsedData {
    let weightG: number | null = null;

    // 1. Peso explícito em gramas (prioriza total_filament_used / filament used [g] / MATERIAL_WEIGHT)
    const gramPatterns = [
        /;\s*total\s+filament\s+used\s*\[g\]\s*=\s*([^\r\n]+)/i,
        /;\s*total\s+filament\s+weight\s*\[g\]\s*[:=]\s*([^\r\n]+)/i,
        /;\s*filament\s+used\s*\[g\]\s*=\s*([^\r\n]+)/i,
        /;\s*filament_used_g\s*[:=]\s*([^\r\n]+)/i,
        /;\s*MATERIAL_WEIGHT\s*[:=]\s*([^\r\n]+)/i,
        /;\s*Filament weight\s*[:=]\s*([^\r\n]+)/i
    ];

    for (const pattern of gramPatterns) {
        const match = content.match(pattern);
        if (match?.[1]) {
            const parsed = sumNumericList(match[1]);
            if (parsed > 0) {
                weightG = Math.round(parsed * 100) / 100;
                break;
            }
        }
    }

    // Fallback para Cura/Luban quando informa metros: ";Filament used: 5.39m" ou ";Filament used: 16.06g"
    if (weightG === null) {
        const curaFilamentMatch = content.match(/;\s*Filament used\s*:\s*([^\r\n]+)/i);
        if (curaFilamentMatch?.[1]) {
            const valStr = curaFilamentMatch[1].trim();
            if (/g\b/i.test(valStr)) {
                const parsedG = sumNumericList(valStr);
                if (parsedG > 0) weightG = Math.round(parsedG * 100) / 100;
            } else if (/m\b/i.test(valStr)) {
                const meters = sumNumericList(valStr);
                if (meters > 0) {
                    weightG = Math.round(meters * STANDARD_175MM_GRAMS_PER_METER * 100) / 100;
                }
            }
        }
    }

    // 2. Tempo total de impressão em segundos
    let totalSeconds = 0;

    // Bambu / Orca / Prusa / SuperSlicer formats
    const formattedTimePatterns = [
        /;\s*total estimated time\s*:\s*([^\r\n;]+)/i,
        /;\s*estimated printing time\s*\(normal mode\)\s*=\s*([^\r\n]+)/i,
        /;\s*estimated printing time\s*=\s*([^\r\n]+)/i,
        /;\s*model printing time\s*:\s*([^\r\n;]+)/i,
        /;\s*TIME\s*:\s*(\d+(?:\.\d+)?)/i,
        /;\s*total_time\s*[:=]\s*(\d+(?:\.\d+)?)/i,
        /;\s*estimated_time\(s\)\s*[:=]\s*(\d+(?:\.\d+)?)/i
    ];

    for (const pattern of formattedTimePatterns) {
        const match = content.match(pattern);
        if (match?.[1]) {
            const seconds = parseTimeStringToSeconds(match[1]);
            if (seconds > 0) {
                totalSeconds = seconds;
                break;
            }
        }
    }

    const totalMinutes = totalSeconds > 0 ? Math.max(1, Math.round(totalSeconds / 60)) : 0;
    const printHours = Math.floor(totalMinutes / 60);
    const printMinutes = totalMinutes % 60;

    return {
        weightG,
        printHours,
        printMinutes,
        totalMinutes,
        slicerName: detectSlicer(content),
        suggestedProjectName: cleanFileNameToProjectName(fileName)
    };
}

/**
 * Lê apenas início e fim de um arquivo .gcode (máx 128 KB no total) para extrair metadata instantaneamente
 * mesmo em arquivos grandes (50+ MB).
 */
export async function readAndParseGcodeFile(file: File): Promise<GcodeParsedData> {
    const sliceSize = 65536; // 64 KB
    let combinedText = '';

    if (file.size <= sliceSize * 2) {
        combinedText = await file.text();
    } else {
        const head = await file.slice(0, sliceSize).text();
        const tail = await file.slice(file.size - sliceSize, file.size).text();
        combinedText = `${head}\n${tail}`;
    }

    return parseGcodeMetadata(combinedText, file.name);
}
