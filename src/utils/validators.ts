export const cleanRut = (rut: string): string => {
    return typeof rut === 'string' ? rut.replace(/[^0-9kK]+/g, '').toUpperCase() : '';
};

export const validateRut = (rut: string): boolean => {
    const clean = cleanRut(rut);
    if (clean.length < 2) return false;

    const body = clean.slice(0, -1);
    const dv = clean.slice(-1);

    if (!/^[0-9]+$/.test(body)) return false;

    let sum = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body.charAt(i)) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const mod = 11 - (sum % 11);
    let expectedDv = '';

    if (mod === 11) expectedDv = '0';
    else if (mod === 10) expectedDv = 'K';
    else expectedDv = mod.toString();

    return dv === expectedDv;
};

export const formatRut = (rut: string): string => {
    const clean = cleanRut(rut);
    if (clean.length <= 1) return clean;

    const body = clean.slice(0, -1);
    const dv = clean.slice(-1);

    let formattedBody = '';
    for (let i = body.length - 1, j = 0; i >= 0; i--, j++) {
        if (j > 0 && j % 3 === 0) formattedBody = '.' + formattedBody;
        formattedBody = body.charAt(i) + formattedBody;
    }

    return `${formattedBody}-${dv}`;
};
