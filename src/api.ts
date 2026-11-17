export interface Sessao {
  token: string;
  usuario: string;
  escritorio: string;
}

export interface Pessoa {
  id: number;
  nome: string;
  documento: string;
  endereco: string;
}
export type DadosPessoa = Omit<Pessoa, "id">;
export type TipoPessoa = "emitentes" | "destinatarios";

export interface ReciboResumo {
  id: number;
  numero: number;
  data: string;
  valor_centavos: number;
  referente: string;
  emitente_nome: string;
  destinatario_nome: string;
}

export interface ReciboCompleto extends ReciboResumo {
  escritorio_nome: string;
  emitente_documento: string;
  emitente_endereco: string;
  destinatario_documento: string;
  destinatario_endereco: string;
}

export interface NovoReciboDados {
  emitente_id: number;
  destinatario_id: number;
  valor_centavos: number;
  referente: string;
  data: string;
}

const CHAVE = "recibos.sessao";

export function lerSessao(): Sessao | null {
  try {
    const bruto = localStorage.getItem(CHAVE);
    return bruto ? (JSON.parse(bruto) as Sessao) : null;
  } catch {
    return null;
  }
}

export function salvarSessao(sessao: Sessao | null): void {
  try {
    if (sessao) localStorage.setItem(CHAVE, JSON.stringify(sessao));
    else localStorage.removeItem(CHAVE);
  } catch {
    // armazenamento bloqueado: segue sem persistir
  }
}

let aoExpirar: () => void = () => {};
export function definirAoExpirar(fn: () => void): void {
  aoExpirar = fn;
}

export function mensagemErro(e: unknown): string {
  return e instanceof Error ? e.message : "Erro inesperado.";
}

async function chamar<T>(metodo: string, caminho: string, corpo?: unknown): Promise<T> {
  const sessao = lerSessao();
  const resposta = await fetch(`/api${caminho}`, {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
      ...(sessao ? { Authorization: `Bearer ${sessao.token}` } : {}),
    },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });

  if (resposta.status === 401 && sessao) {
    salvarSessao(null);
    aoExpirar();
  }
  if (resposta.status === 204) return undefined as T;

  const dados = (await resposta.json().catch(() => ({}))) as { erro?: string };
  if (!resposta.ok) throw new Error(dados.erro ?? "Erro inesperado.");
  return dados as T;
}

export const api = {
  login: (email: string, senha: string) => chamar<Sessao>("POST", "/login", { email, senha }),

  listarPessoas: (tipo: TipoPessoa) => chamar<Pessoa[]>("GET", `/${tipo}`),
  criarPessoa: (tipo: TipoPessoa, dados: DadosPessoa) => chamar<Pessoa>("POST", `/${tipo}`, dados),
  atualizarPessoa: (tipo: TipoPessoa, id: number, dados: DadosPessoa) => chamar<Pessoa>("PUT", `/${tipo}/${id}`, dados),
  excluirPessoa: (tipo: TipoPessoa, id: number) => chamar<void>("DELETE", `/${tipo}/${id}`),

  listarRecibos: () => chamar<ReciboResumo[]>("GET", "/recibos"),
  lerRecibo: (id: number) => chamar<ReciboCompleto>("GET", `/recibos/${id}`),
  emitirRecibo: (dados: NovoReciboDados) => chamar<{ id: number; numero: number }>("POST", "/recibos", dados),
};
