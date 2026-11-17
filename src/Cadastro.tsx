import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api, mensagemErro } from "./api.ts";
import type { Pessoa, TipoPessoa } from "./api.ts";
import { formatarDocumento, mascararDocumento } from "./format.ts";

const TEXTOS = {
  emitentes: {
    titulo: "Emitentes",
    ajuda: "Pessoas que assinam o recibo e recebem o valor.",
    docRotulo: "CPF",
    docMax: 11,
    vazio: "Nenhum emitente cadastrado ainda.",
  },
  destinatarios: {
    titulo: "Destinatários",
    ajuda: "Empresas para as quais o recibo é emitido.",
    docRotulo: "CNPJ (ou CPF)",
    docMax: 14,
    vazio: "Nenhum destinatário cadastrado ainda.",
  },
} as const;

interface Formulario {
  id: number | null;
  nome: string;
  documento: string;
  endereco: string;
}
const VAZIO: Formulario = { id: null, nome: "", documento: "", endereco: "" };

export default function Cadastro({ tipo }: { tipo: TipoPessoa }) {
  const t = TEXTOS[tipo];
  const [itens, setItens] = useState<Pessoa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState<Formulario>(VAZIO);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    try {
      setItens(await api.listarPessoas(tipo));
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo]);

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      const dados = { nome: form.nome, documento: form.documento, endereco: form.endereco };
      if (form.id === null) await api.criarPessoa(tipo, dados);
      else await api.atualizarPessoa(tipo, form.id, dados);
      setForm(VAZIO);
      await carregar();
    } catch (err) {
      setErro(mensagemErro(err));
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(p: Pessoa) {
    if (!confirm(`Excluir "${p.nome}"? Recibos já emitidos não são alterados.`)) return;
    try {
      await api.excluirPessoa(tipo, p.id);
      if (form.id === p.id) setForm(VAZIO);
      await carregar();
    } catch (err) {
      setErro(mensagemErro(err));
    }
  }

  function editar(p: Pessoa) {
    setErro("");
    setForm({ id: p.id, nome: p.nome, documento: mascararDocumento(p.documento, t.docMax), endereco: p.endereco });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <h1>{t.titulo}</h1>
      <p className="suave">{t.ajuda}</p>

      <form className="cartao" onSubmit={salvar}>
        <h2>{form.id === null ? "Novo cadastro" : "Editar cadastro"}</h2>
        <div className="grade">
          <label>
            Nome {tipo === "destinatarios" && "/ razão social"}
            <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} maxLength={150} required />
          </label>
          <label>
            {t.docRotulo}
            <input
              value={form.documento}
              onChange={(e) => setForm({ ...form, documento: mascararDocumento(e.target.value, t.docMax) })}
              inputMode="numeric"
              required
            />
          </label>
        </div>
        <label>
          Endereço (opcional)
          <input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} maxLength={250} />
        </label>

        {erro && <p className="erro" role="alert">{erro}</p>}
        <div className="acoes">
          <button className="btn" disabled={salvando}>{salvando ? "Salvando…" : form.id === null ? "Cadastrar" : "Salvar alterações"}</button>
          {form.id !== null && (
            <button type="button" className="btn secundario" onClick={() => { setForm(VAZIO); setErro(""); }}>Cancelar</button>
          )}
        </div>
      </form>

      {carregando ? (
        <p className="suave">Carregando…</p>
      ) : itens.length === 0 ? (
        <p className="suave">{t.vazio}</p>
      ) : (
        <div className="tabela-rolagem">
          <table>
            <thead>
              <tr><th>Nome</th><th>Documento</th><th>Endereço</th><th /></tr>
            </thead>
            <tbody>
              {itens.map((p) => (
                <tr key={p.id}>
                  <td>{p.nome}</td>
                  <td className="nowrap">{formatarDocumento(p.documento)}</td>
                  <td>{p.endereco || "—"}</td>
                  <td className="nowrap direita">
                    <button className="btn-link" onClick={() => editar(p)}>Editar</button>
                    <button className="btn-link perigo" onClick={() => excluir(p)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
