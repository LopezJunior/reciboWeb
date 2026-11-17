import { useEffect, useState } from "react";
import { definirAoExpirar, lerSessao, salvarSessao } from "./api.ts";
import type { Sessao } from "./api.ts";
import Cadastro from "./Cadastro.tsx";
import Login from "./Login.tsx";
import NovoRecibo from "./NovoRecibo.tsx";
import Recibos from "./Recibos.tsx";
import VerRecibo from "./VerRecibo.tsx";

/** Rota simples baseada no hash da URL (#/recibos, #/emitentes...). */
function useRota(): string {
  const [rota, setRota] = useState(() => location.hash.slice(1) || "/recibos");
  useEffect(() => {
    const atualizar = () => setRota(location.hash.slice(1) || "/recibos");
    window.addEventListener("hashchange", atualizar);
    return () => window.removeEventListener("hashchange", atualizar);
  }, []);
  return rota;
}

export default function App() {
  const [sessao, setSessao] = useState<Sessao | null>(lerSessao);
  const rota = useRota();

  useEffect(() => {
    definirAoExpirar(() => setSessao(null));
  }, []);

  if (!sessao) {
    return (
      <Login
        aoEntrar={(s) => {
          salvarSessao(s);
          location.hash = "/recibos";
          setSessao(s);
        }}
      />
    );
  }

  function sair() {
    salvarSessao(null);
    location.hash = "";
    setSessao(null);
  }

  const ativo = (prefixo: string) => (rota.startsWith(prefixo) ? "ativo" : "");
  const reciboId = /^\/recibos\/(\d+)$/.exec(rota)?.[1];

  let tela;
  if (rota === "/recibos/novo") tela = <NovoRecibo />;
  else if (reciboId) tela = <VerRecibo key={reciboId} id={Number(reciboId)} />;
  else if (rota === "/emitentes") tela = <Cadastro key="emitentes" tipo="emitentes" />;
  else if (rota === "/destinatarios") tela = <Cadastro key="destinatarios" tipo="destinatarios" />;
  else tela = <Recibos />;

  return (
    <>
      <header className="topo no-print">
        <strong className="marca">Emissor de Recibos</strong>
        <nav>
          <a className={ativo("/recibos")} href="#/recibos">Recibos</a>
          <a className={ativo("/emitentes")} href="#/emitentes">Emitentes</a>
          <a className={ativo("/destinatarios")} href="#/destinatarios">Destinatários</a>
        </nav>
        <div className="usuario">
          <span>{sessao.escritorio}</span>
          <button className="btn-link" onClick={sair}>Sair</button>
        </div>
      </header>
      <main className="conteudo">{tela}</main>
    </>
  );
}
