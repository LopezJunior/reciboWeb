import { useState } from "react";
import type { FormEvent } from "react";
import { api, mensagemErro } from "./api.ts";
import type { Sessao } from "./api.ts";

export default function Login({ aoEntrar }: { aoEntrar: (sessao: Sessao) => void }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      aoEntrar(await api.login(email, senha));
    } catch (err) {
      setErro(mensagemErro(err));
      setEnviando(false);
    }
  }

  return (
    <div className="login-pagina">
      <form className="cartao login" onSubmit={enviar}>
        <h1>Emissor de Recibos</h1>
        <p className="suave">Entre com o acesso do seu escritório.</p>

        <label>
          E-mail
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" autoFocus required />
        </label>
        <label>
          Senha
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" required />
        </label>

        {erro && <p className="erro" role="alert">{erro}</p>}
        <button className="btn" disabled={enviando}>{enviando ? "Entrando…" : "Entrar"}</button>
      </form>
    </div>
  );
}
