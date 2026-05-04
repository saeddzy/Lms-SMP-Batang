/**
 * Identifier untuk login / header: NIS, NIP, atau email.
 */
export function userCompactLogin(user) {
    if (!user) {
        return "";
    }
    return user.nis || user.nip || user.email || "";
}

/** Label dropdown: "Nama (NIS/NIP/email)" */
export function formatUserOptionLabel(user) {
    if (!user) {
        return "";
    }
    const id = userCompactLogin(user);
    return id ? `${user.name} (${id})` : user.name;
}

/**
 * Label sekunder untuk daftar user.
 */
export function userSecondaryLabel(user) {
    if (!user) {
        return "";
    }
    if (user.nis) {
        return `NIS: ${user.nis}`;
    }
    if (user.nip) {
        return `NIP: ${user.nip}`;
    }
    if (user.email) {
        return user.email;
    }
    return "";
}
