export function formatCLP(amount) {
  return `$ ${amount.toLocaleString('es-CL')}`;
}

export function formatUFEstimate(amount, ufRate) {
  if (!ufRate) return null;
  const uf = amount / ufRate;
  if (uf >= 1000) {
    return `≈ UF ${Math.round(uf).toLocaleString('es-CL')}`;
  }
  return `≈ UF ${uf.toFixed(1).replace('.', ',')}`;
}
