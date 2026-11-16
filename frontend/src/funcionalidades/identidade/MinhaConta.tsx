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
      <div className="grid items-start gap-5 lg:grid-cols-12">
        <Cartao escuro className="p-6 lg:col-span-5">
          <Avatar nome={perfil.usuario.nome} grande />
          <p className="titulo mt-5 text-4xl">{perfil.usuario.nome}</p>
          <p className="mt-2 text-sobre-tinta-suave">{perfil.usuario.email}</p>
          <div className="mt-5">
            <SeloDePapel papel={perfil.papel} />
          </div>
        </Cartao>

        <Cartao className="lg:col-span-7">
          <h2 className="font-semibold">Trocar senha</h2>
          <p className="mt-1 text-sm text-texto-suave">
            Ao trocar a senha, todas as sessões abertas são encerradas e você entra de novo.
          </p>
          <form onSubmit={aoEnviar} className="mt-5 max-w-md space-y-4">
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
        </Cartao>
      </div>
    </>
  )
}
