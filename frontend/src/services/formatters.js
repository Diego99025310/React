const digitOnly = (value = '') => String(value ?? '').replace(/\D+/g, '');

export const maskPhone = (value = '') => {
  const digits = digitOnly(value).slice(0, 11);
  if (!digits.length) return '';
  if (digits.length <= 2) return digits;
  const ddd = digits.slice(0, 2);
  if (digits.length <= 6) return `(${ddd}) ${digits.slice(2)}`;
  const middleLength = digits.length === 11 ? 5 : 4;
  const middle = digits.slice(2, 2 + middleLength);
  const suffix = digits.slice(2 + middleLength);
  return `(${ddd}) ${middle}${suffix ? `-${suffix}` : ''}`;
};

export const createLoginIdentifierMask = () => {
  let mode = 'auto';

  const format = (rawValue) => {
    const stringValue = String(rawValue ?? '');
    if (!stringValue) {
      mode = 'auto';
      return '';
    }

    const normalizedSpaces = stringValue.replace(/\s+/g, ' ');
    const trimmed = normalizedSpaces.trim();
    if (!trimmed) {
      mode = 'auto';
      return '';
    }

    if (/[A-Za-z@]/.test(trimmed)) {
      mode = 'email';
      return trimmed;
    }

    const digits = digitOnly(trimmed);
    if (!digits) {
      mode = 'auto';
      return trimmed;
    }

    if (mode === 'email' && !/[A-Za-z@]/.test(trimmed)) {
      mode = 'auto';
    }

    if (trimmed.startsWith('+')) {
      mode = 'phone';
    }

    if (mode !== 'phone') {
      mode = 'phone';
    }

    return maskPhone(digits);
  };

  format.reset = () => {
    mode = 'auto';
  };

  format.getMode = () => mode;

  return format;
};

export const masks = {
  loginIdentifier: createLoginIdentifierMask
};

export const normalizeLoginIdentifier = (value) => {
  const mask = createLoginIdentifierMask();
  return mask(value);
};

export { digitOnly };
