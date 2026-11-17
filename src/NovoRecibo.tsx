import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { api, mensagemErro } from "./api.ts";
import type { Pessoa } from "./api.ts";
import { valorPorExtenso } from "./extenso.ts";
import { formatarDocumento, hojeIso, numeroBr } from "./format.ts";

const MAX_CENTAVOS = 99_999_999_999;

/** Campo de valor estilo "caixa eletrônico": a pessoa digita só números e a vírgula se ajusta. */
function CampoValor({ centavos, aoMudar }: { centavos: number; aoMudar: (c: number) => void }) {
  function mudou(e: ChangeEvent<HTMLInputElement>) {
    const digitos = e.target.value.replace(/\D/g, "").slice(0, 11);
    aoMudar(Math.min(Number(digitos || "0"), MAX_CENTAVOS));
  }
  return (
    <div className="campo-valor">
      <span>R$</span>
      <input value={numeroBr(centavos)} onChange={mudou} inputMode="numeric" aria-label="Valor em reais" />
    </div>
  );
}

export default function NovoRecibo() {
  const [emitentes, setEmitentes] = useState<Pessoa[]>([]);
  const [destinatarios, setDestinatarios] = useState<Pessoa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const [emitenteId, setEmitenteId] = useState("");
  const [destinatarioId, setDestinatarioId] = useState("");
  const [valor, setValor] = useState(0);
  const [data, setData] = useState(hojeIso);
  const [referente, setReferente] = useState("");

  useEffect(() => {
    Promise.all([api.listarPessoas("emitentes"), api.listarPessoas("destinatarios")])
      .then(([em, de]) => {
        setEmitentes(em);
        setDestinatarios(de);
      })
      .catch((e) => setErro(mensagemErro(e)))
      .finally(() => setCarregando(false));
  }, []);

  async function emitir(e: FormEvent) {
    e.preventDefault();
    setErro("");
    if (!emitenteId || !destinatarioId) return setErro("Escolha o emitente e o destinatário.");
    if (valor <= 0) return setErro("Informe o valor do recibo.");

    setEnviando(true);
    try {
      const { id } = await api.emitirRecibo({
        emitente_id: Number(emitenteId),
        destinatario_id: Number(destinatarioId),
        valor_centavos: valor,
        referente,
        data,
      });
      location.hash = `/recibos/${id}`;
    } catch (err) {
      setErro(mensagemErro(err));
      setEnviando(false);
    }
  }

  if (carregando) return <p className="suave">Carregando…</p>;

  if (emitentes.length === 0 || destinatarios.length === 0) {
    return (
      <>
        <h1>Novo recibo</h1>
        <div className="cartao">
          <p>Antes de emitir um recibo, cadastre pelo menos um emitente e um destinatário.</p>
          <p>
            {emitentes.length === 0 && <a href="#/emitentes">Cadastrar emitente</a>}
            {emitentes.length === 0 && destinatarios.length === 0 && " · "}
            {destinatarios.length === 0 && <a href="#/destinatarios">Cadastrar destinatário</a>}
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <h1>Novo recibo</h1>
      <form className="cartao" onSubmit={emitir}>
        <div className="grade">
          <label>
            Emitente (quem recebe o valor)
            <select value={emitenteId} onChange={(e) => setEmitenteId(e.target.value)} required>
              <option value="">Selecione…</option>
              {emitentes.map((p) => (
                <option key={p.id} value={p.id}>{p.nome} — {formatarDocumento(p.documento)}</option>
              ))}
            </select>
          </label>
          <label>
            Destinatário (empresa que paga)
            <select value={destinatarioId} onChange={(e) => setDestinatarioId(e.target.value)} required>
              <option value="">Selecione…</option>
              {destinatarios.map((p) => (
                <option key={p.id} value={p.id}>{p.nome} — {formatarDocumento(p.documento)}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grade">
          <label>
            Valor
            <CampoValor centavos={valor} aoMudar={setValor} />
            {valor > 0 && <small className="suave extenso">{valorPorExtenso(valor)}</small>}
          </label>
          <label>
            Data
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} required />
          </label>
        </div>

        <label>
          Referente a
          <textarea
            value={referente}
            onChange={(e) => setReferente(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Ex.: prestação de serviços de contabilidade, competência outubro/2026"
            required
          />
        </label>

        {erro && <p className="erro" role="alert">{erro}</p>}
        <div className="acoes">
          <button className="btn" disabled={enviando}>{enviando ? "Emitindo…" : "Emitir recibo"}</button>
          <a className="btn secundario" href="#/recibos">Cancelar</a>
        </div>
      </form>
    </>
  );
}
