export function required(value, label) {
  if (!value || !value.trim()) return `${label} es obligatorio`;
  return '';
}

export function email(value) {
  if (!value || !value.trim()) return '';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(value) ? '' : 'Correo inválido';
}

export function phone(value, label = 'Teléfono') {
  if (!value || !value.trim()) return `${label} es obligatorio`;
  const digits = value.replace(/\D/g, '');
  if (digits.length < 9) return `${label} debe tener al menos 9 dígitos`;
  return '';
}

export function minLength(value, min, label) {
  if (!value || !value.trim()) return `${label} es obligatorio`;
  if (value.trim().length < min) return `${label} debe tener al menos ${min} caracteres`;
  return '';
}
