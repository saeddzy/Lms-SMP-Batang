/**
 * Nama kelas untuk tampilan: dari school_class langsung atau lewat class_subject.
 */
export function materialClassName(material) {
    if (!material) return null;
    return (
        material.school_class?.name ??
        material.schoolClass?.name ??
        material.class_subject?.school_class?.name ??
        material.classSubject?.schoolClass?.name ??
        null
    );
}
