import { digitOnly } from './formatters.js';

export const isEmail = (value) =>
  /^(?:[\w!#$%&'*+/=?^`{|}~-]+(?:\.[\w!#$%&'*+/=?^`{|}~-]+)*)@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/i.test(
    String(value).trim()
  );

export const validators = {
  email: isEmail,
  password: (value) => typeof value === 'string' && value.length >= 6,
  loginIdentifier: (value) => {
    const trimmed = String(value ?? '').trim();
    if (!trimmed) return false;
    if (isEmail(trimmed)) return true;
    const digits = digitOnly(trimmed);
    return digits.length === 11 || digits.length === 10;
  }
};
