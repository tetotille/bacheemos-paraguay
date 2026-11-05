import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatGs(monto: number): string {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    maximumFractionDigits: 0
  }).format(monto).replace('PYG', 'Gs.');
}

export function formatNumero(valor: number, decimales = 2): string {
  return new Intl.NumberFormat('es-PY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimales
  }).format(valor);
}

export function formatFechaRelativa(isoString: string): string {
  try {
    const fecha = typeof isoString === 'string' ? parseISO(isoString) : new Date(isoString);
    return `hace ${formatDistanceToNow(fecha, { locale: es })}`;
  } catch {
    return 'hace poco';
  }
}

export function formatFechaCompleta(isoString: string): string {
  try {
    const fecha = typeof isoString === 'string' ? parseISO(isoString) : new Date(isoString);
    return format(fecha, "d MMM yyyy, HH:mm", { locale: es });
  } catch {
    return isoString;
  }
}

export function calcularVolumenM3(areaM2: number, profundidadCm: number): number {
  return Number(((areaM2 * profundidadCm) / 100).toFixed(3));
}

export function calcularAsfaltoKg(volumenM3: number, densidad = 2400): number {
  return Math.round(volumenM3 * densidad);
}
