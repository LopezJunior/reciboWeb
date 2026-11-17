import { useEffect, useMemo, useState } from "react";
import { api, mensagemErro } from "./api.ts";
import type { ReciboResumo } from "./api.ts";
import { dataCurta, moeda } from "./format.ts";

export default function Recibos() {
  const [recibos, setRecibos] = useState<ReciboResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    api
      .listarRecibos()
      .then(setRecibos)
      .catch((e) => setErro(mensagemErro(e)))
      .finally(() => setCarregando(false));
  }, []);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return recibos;
    return recibos.filter((r) =>
      [String(r.numero), r.emitente_nome, r.destinatario_nome, r.referente].some((campo) => campo.toLowerCase().includes(termo)),
    );
  }, [recibos, busca]);

  return (
    <>
      <div className="titulo-linha">
        <h1>Recibos emitidos</h1>
        <a className="btn" href="#/recibos/novo">Novo recibo</a>
      </div>

      <input
        className="busca"
        type="search"
        placeholder="Buscar por número, emitente, destinatário ou descrição"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      {erro && <p className="erro" role="alert">{erro}</p>}

      {carregando ? (
        <p className="suave">Carregando…</p>
      ) : filtrados.length === 0 ? (
        <p className="suave">{recibos.length === 0 ? "Nenhum recibo emitido ainda." : "Nenhum recibo encontrado."}</p>
      ) : (
        <div className="tabela-rolagem">
          <table>
            <thead>
              <tr><th>Nº</th><th>Data</th><th>Emitente</th><th>Destinatário</th><th className="direita">Valor</th><th /></tr>
            </thead>
            <tbody>
              {filtrados.map((r) => (
                <tr key={r.id}>
                  <td className="nowrap">{String(r.numero).padStart(4, "0")}</td>
                  <td className="nowrap">{dataCurta(r.data)}</td>
                  <td>{r.emitente_nome}</td>
                  <td>{r.destinatario_nome}</td>
                  <td className="nowrap direita">{moeda(r.valor_centavos)}</td>
                  <td className="nowrap direita"><a href={`#/recibos/${r.id}`}>Abrir</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
