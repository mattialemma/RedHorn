type ValidationResult = string;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const textPattern = /^[\p{L}\p{N}\s.,'&()/-]+$/u;
const alphanumericPattern = /^[a-zA-Z0-9]+$/;

function hasValue(value: string) {
  return value.trim().length > 0;
}

function hasLetterOrNumber(value: string) {
  return /[\p{L}\p{N}]/u.test(value);
}

export function validateRequiredText(value: string, label: string, min = 3, max = 80): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return `${label} e obbligatorio.`;
  if (trimmed.length < min) return `${label} deve avere almeno ${min} caratteri.`;
  if (trimmed.length > max) return `${label} non puo superare ${max} caratteri.`;
  if (!hasLetterOrNumber(trimmed) || !textPattern.test(trimmed)) return `${label} contiene caratteri non validi.`;
  return "";
}

export function validateOptionalText(value: string, label: string, min = 3, max = 80): ValidationResult {
  if (!hasValue(value)) return "";
  return validateRequiredText(value, label, min, max);
}

export function validateOptionalEmail(value: string, label: string): ValidationResult {
  if (!hasValue(value)) return "";
  const trimmed = value.trim();
  if (trimmed.length > 120) return `${label} e troppo lunga.`;
  if (!emailPattern.test(trimmed)) return `${label} non e valida.`;
  return "";
}

export function validateOptionalAlphanumeric(value: string, label: string, min = 3, max = 20): ValidationResult {
  if (!hasValue(value)) return "";
  const trimmed = value.trim();
  if (trimmed.length < min) return `${label} deve avere almeno ${min} caratteri.`;
  if (trimmed.length > max) return `${label} non puo superare ${max} caratteri.`;
  if (!alphanumericPattern.test(trimmed)) return `${label} puo contenere solo lettere e numeri.`;
  return "";
}

export function validateOptionalDigits(value: string, label: string, min = 3, max = 15): ValidationResult {
  if (!hasValue(value)) return "";
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return `${label} puo contenere solo numeri.`;
  if (trimmed.length < min) return `${label} deve avere almeno ${min} cifre.`;
  if (trimmed.length > max) return `${label} non puo superare ${max} cifre.`;
  return "";
}

export function sanitizeDigits(value: string, maxLength: number) {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

