import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, mensagemDoErro } from '../../compartilhado/api'
import { useSessao } from '../../compartilhado/sessao'
import { NOME_DO_PAPEL } from '../../compartilhado/tipos'
import { Aviso, Botao, Cabecalho, Campo, Cartao, Selo } from '../../compartilhado/ui'

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
      <div className="grid gap-5 lg:grid-cols-2">
        <Cartao>
          <h2 className="font-semibold">Dados</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-texto-suave">Nome</dt>
              <dd className="font-medium">{perfil.usuario.nome}</dd>
            </div>
            <div>
              <dt className="text-texto-suave">E-mail</dt>
              <dd className="font-medium">{perfil.usuario.email}</dd>
            </div>
            <div>
              <dt className="mb-1 text-texto-suave">Perfil</dt>
              <dd>
                <Selo tom="destaque">{NOME_DO_PAPEL[perfil.papel]}</Selo>
              </dd>
            </div>
          </dl>
        </Cartao>

        <Cartao>
          <h2 className="font-semibold">Trocar senha</h2>
          <p className="mt-1 text-sm text-texto-suave">
            Ao trocar a senha, todas as sessões abertas são encerradas e você entra de novo.
          </p>
          <form onSubmit={aoEnviar} className="mt-4 space-y-4">
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
