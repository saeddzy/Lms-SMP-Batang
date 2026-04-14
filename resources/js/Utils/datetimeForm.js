/**
 * Konversi datetime dari API (ISO/string) ke nilai input `datetime-local`
 * memakai jam lokal browser (bukan UTC), agar sesuai yang diatur guru.
 */
export function toDatetimeLocalValue(iso) {
    if (iso == null || iso === "") return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day}T${h}:${min}`;
}

/**
 * Nilai `datetime-local` (YYYY-MM-DDTHH:mm) → string untuk Laravel (Y-m-d H:i:s).
 */
export function datetimeLocalToLaravel(datetimeLocal) {
    if (datetimeLocal == null || datetimeLocal === "") return null;
    const s = String(datetimeLocal).trim();
    if (!s.includes("T")) return null;
    const [datePart, timePartRaw] = s.split("T");
    if (!datePart || timePartRaw == null || timePartRaw === "") return null;
    const timePart = timePartRaw.slice(0, 8);
    const time =
        timePart.length === 5 ? `${timePart}:00` : timePart.padEnd(8, "0");
    return `${datePart} ${time}`;
}
