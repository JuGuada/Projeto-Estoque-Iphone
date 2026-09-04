export function converterPrecoParaNumero(valor) {
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : 0;

  const texto = String(valor ?? '')
    .replace(/R\$\s?/gi, '')
    .replace(/\s/g, '')
    .replace(/[^\d,.-]/g, '')
    .trim();
  if (!texto) return 0;

  const temVirgula = texto.includes(',');
  const temPonto = texto.includes('.');
  let normalizado = texto;

  if (temVirgula) {
    normalizado = texto.replace(/\./g, '').replace(',', '.');
  } else if (temPonto) {
    const casasDepoisDoUltimoPonto = texto.length - texto.lastIndexOf('.') - 1;
    normalizado = casasDepoisDoUltimoPonto === 2
      ? texto
      : texto.replace(/\./g, '');
  }

  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : 0;
}

export function formatarPrecoProduto(valor) {
  return converterPrecoParaNumero(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}
