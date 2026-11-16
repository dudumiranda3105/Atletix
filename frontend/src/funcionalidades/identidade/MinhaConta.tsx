import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, mensagemDoErro } from '../../compartilhado/api'
import { useSessao } from '../../compartilhado/sessao'
import { Aviso, Avatar, Botao, Cabecalho, Campo, Cartao, SeloDePapel } from '../../compartilhado/ui'

export function MinhaConta() {
  const { perfil, sair } = useSessao()
  const navegar = useNavigate()
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  if (!perfil) return null

  const aoEnviar = async (evento: FormEvent) => {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      await api.post('/auth/trocar-senha', { senhaAtual, novaSenha })
      // A troca encerra todas as sessões no servidor; aqui só acompanhamos.
      await sair()
      navegar('/entrar', { replace: true, state: { aviso: 'Senha alterada. Entre com a nova senha.' } })
    } catch (falha) {
      setErro(mensagemDoErro(falha))
      setEnviando(false)
    }
  }

  return (
    <>
      <Cabecalho titulo="Minha conta" descricao="Seus dados de acesso." />
      <Cartao escuro className="flex flex-wrap items-center gap-x-6 gap-y-4 sm:p-8">
        <Avatar nome={perfil.usuario.nome} grande />
        <div className="min-w-0 flex-1">
          <p className="titulo truncate text-[2.25rem]">{perfil.usuario.nome}</p>
          <p className="mt-1 truncate text-sobre-tinta-suave">{perfil.usuario.email}</p>
        </div>
        <SeloDePapel papel={perfil.papel} />
      </Cartao>

      <section className="mt-12 grid gap-x-10 gap-y-6 border-t border-borda pt-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <h2>Trocar senha</h2>
          <p className="mt-1.5 max-w-[42ch] text-texto-suave">
            Ao trocar a senha, todas as sessões abertas são encerradas e você entra de novo.
          </p>
        </div>
        <form onSubmit={aoEnviar} className="max-w-md space-y-4">
          {erro && <Aviso tom="perigo">{erro}</Aviso>}
          <Campo
            rotulo="Senha atual"
            type="password"
            autoComplete="current-password"
            required
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
          />
          <Campo
            rotulo="Nova senha"
            type="password"
            autoComplete="new-password"
            required
            ajuda="Pelo menos 8 caracteres, com letras e números."
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
          />
          <Botao type="submit" carregando={enviando}>
            Trocar senha
          </Botao>
        </form>
      </section>
    </>
  )
}
