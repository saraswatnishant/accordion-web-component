function generateAriaId(prefix = 'aria') {
    return `${prefix}-${crypto.randomUUID()}`;
}