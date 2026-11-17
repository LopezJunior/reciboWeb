import { useEffect, useState } from "react";
import { api, mensagemErro } from "./api.ts";
import type { ReciboCompleto } from "./api.ts";
import { valorPorExtenso } from "./extenso.ts";
import { dataPorExtenso, formatarDocumento, moeda, rotuloDocumento } from "./format.ts";

export default function VerRecibo({ id }: { id: number }) {
  const [recibo, setRecibo] = useState<ReciboCompleto | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    api.lerRecibo(id).then(setRecibo).catch((e) => setErro(mensagemErro(e)));
  }, [id]);

  if (erro) {
    return (
      <>
        <p className="erro" role="alert">{erro}</p>
        <a href="#/recibos">Voltar para a lista</a>
      </>
    );
  }
  if (!recibo) return <p className="suave">Carregando…</p>;

  const extenso = valorPorExtenso(recibo.valor_centavos);

  return (
    <>
      <div className="acoes no-print">
        <a className="btn secundario" href="#/recibos">Voltar</a>
        <button className="btn" onClick={() => window.print()}>Imprimir / salvar em PDF</button>
      </div>

      <article className="folha">
        <header className="folha-topo">
          <div>
            <h1>RECIBO</h1>
            <p>Nº {String(recibo.numero).padStart(4, "0")}</p>
          </div>
          <div className="folha-valor">{moeda(recibo.valor_centavos)}</div>
        </header>

        <p>
          Recebi de <strong>{recibo.destinatario_nome}</strong>, {rotuloDocumento(recibo.destinatario_documento)}{" "}
          <strong>{formatarDocumento(recibo.destinatario_documento)}</strong>
          {recibo.destinatario_endereco && <>, com endereço em {recibo.destinatario_endereco}</>}, a importância de{" "}
          <strong>{moeda(recibo.valor_centavos)}</strong> (<em>{extenso}</em>), referente a {recibo.referente}.
        </p>
        <p>Para maior clareza, firmo o presente recibo, dando plena e total quitação do valor recebido.</p>

        <p className="folha-data">{dataPorExtenso(recibo.data)}</p>

        <div className="assinatura">
          <div className="linha" />
          <strong>{recibo.emitente_nome}</strong>
          <span>{rotuloDocumento(recibo.emitente_documento)} {formatarDocumento(recibo.emitente_documento)}</span>
          {recibo.emitente_endereco && <span>{recibo.emitente_endereco}</span>}
        </div>

        <footer className="folha-rodape">Emitido por {recibo.escritorio_nome}</footer>
      </article>
    </>
  );
}
