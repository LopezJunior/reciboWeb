const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const moeda = (centavos: number): string => brl.format(centavos / 100);

/** Número sem símbolo, para dentro do campo de valor: 123450 -> "1.234,50" */
export const numeroBr = (centavos: number): string =>
  (centavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Máscara de CPF (até 11 dígitos) ou CNPJ (12 a 14), aplicada enquanto a pessoa digita. */
export function mascararDocumento(valor: string, maxDigitos = 14): string {
  const d = valor.replace(/\D/g, "").slice(0, maxDigitos);
  if (d.length <= 11) {
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

/** Documento guardado só com dígitos -> com máscara, para exibir. */
export const formatarDocumento = (documento: string): string => mascararDocumento(documento);

export const rotuloDocumento =(documento: string): "CPF" | "CNPJ" =>
  documento.replace(/\D/g, "").length === 14 ? "CNPJ" : "CPF";

/** "2026-11-16" -> "16/11/2026" */
export function dataCurta(iso: string): string {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

/** "2026-11-16" -> "16 de novembro de 2026" */
export function dataPorExtenso(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

/** Data de hoje no fuso do navegador, no formato do <input type="date"> */
export function hojeIso(): string {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${agora.getFullYear()}-${mes}-${dia}`;
}
