// Valor monetário por extenso em português do Brasil (ex.: 123450 -> "cento e vinte e três reais e cinquenta centavos").

const UNIDADES = [
  "zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez",
  "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove",
];
const DEZENAS = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const CENTENAS = [
  "", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos",
];
const ESCALAS: Array<[string, string]> = [["", ""], ["mil", "mil"], ["milhão", "milhões"], ["bilhão", "bilhões"]];

/** 1..999 */
function ate999(n: number): string {
  if (n === 100) return "cem";
  const c = Math.floor(n / 100);
  const resto = n % 100;
  const partes: string[] = [];
  if (c) partes.push(CENTENAS[c] as string);
  if (resto) {
    if (resto < 20) partes.push(UNIDADES[resto] as string);
    else {
      const d = Math.floor(resto / 10);
      const u = resto % 10;
      partes.push(u ? `${DEZENAS[d]} e ${UNIDADES[u]}` : (DEZENAS[d] as string));
    }
  }
  return partes.join(" e ");
}

function inteiroPorExtenso(n: number): string {
  if (n === 0) return "zero";

  const grupos: number[] = [];
  for (let resto = n; resto > 0; resto = Math.floor(resto / 1000)) grupos.push(resto % 1000);

  const partes: Array<{ texto: string; valor: number }> = [];
  for (let i = grupos.length - 1; i >= 0; i--) {
    const g = grupos[i] as number;
    if (g === 0) continue;
    let texto: string;
    if (i === 0) texto = ate999(g);
    else if (i === 1) texto = g === 1 ? "mil" : `${ate999(g)} mil`;
    else {
      const [singular, plural] = ESCALAS[i] as [string, string];
      texto = `${ate999(g)} ${g === 1 ? singular : plural}`;
    }
    partes.push({ texto, valor: g });
  }

  // "e" antes do último bloco quando ele é menor que 100 ou centena redonda (mil e quinhentos, dois milhões e cem).
  let resultado = (partes[0] as { texto: string }).texto;
  for (let i = 1; i < partes.length; i++) {
    const { texto, valor } = partes[i] as { texto: string; valor: number };
    const ultimo = i === partes.length - 1;
    resultado += ultimo && (valor < 100 || valor % 100 === 0) ? ` e ${texto}` : ` ${texto}`;
  }
  return resultado;
}

export function valorPorExtenso(centavos: number): string {
  const total = Math.round(centavos);
  const reais = Math.floor(total / 100);
  const cent = total % 100;

  const partes: string[] = [];
  if (reais > 0) {
    const moeda = reais === 1 ? "real" : reais % 1_000_000 === 0 ? "de reais" : "reais";
    partes.push(`${inteiroPorExtenso(reais)} ${moeda}`);
  }
  if (cent > 0) partes.push(`${inteiroPorExtenso(cent)} ${cent === 1 ? "centavo" : "centavos"}`);

  return partes.length ? partes.join(" e ") : "zero real";
}
