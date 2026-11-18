import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api, mensagemDoErro } from '../../compartilhado/api'
import { useSessao } from '../../compartilhado/sessao'
import { Aviso, Botao, Campo } from '../../compartilhado/ui'
import { TelaDeAcesso } from './TelaDeAcesso'

export function RedefinirSenha() {
  const [parametros] = useSearchParams()
  const token = parametros.get('token')
  const { sair } = useSessao()
  const navegar = useNavigate()
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const aoEnviar = async (evento: FormEvent) => {
    evento.preventDefault()
    if (novaSenha !== confirmacao) {
      setErro('As duas senhas precisam ser iguais.')
      return
    }
    setErro(null)
    setEnviando(true)
    try {
      await api.post('/auth/redefinir-senha', { token, novaSenha })
      // Quem estiver logado neste navegador sai, para entrar de novo com a senha nova.
      await sair()
      navegar('/entrar', { replace: true, state: { aviso: 'Senha redefinida. Entre com a nova senha.' } })
    } catch (falha) {
      setErro(mensagemDoErro(falha))
      setEnviando(false)
    }
  }

  return (
    <TelaDeAcesso titulo="Nova senha" descricao="Escolha a senha que você vai usar a partir de agora.">
      {!token ? (
        <Aviso tom="perigo">Este link está incompleto. Peça um novo link de redefinição.</Aviso>
      ) : (
        <form onSubmit={aoEnviar} className="space-y-4">
          {erro && <Aviso tom="perigo">{erro}</Aviso>}
          <Campo
            rotulo="Nova senha"
            type="password"
            autoComplete="new-password"
            required
            autoFocus
            ajuda="Pelo menos 8 caracteres, com letras e números."
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
          />
          <Campo
            rotulo="Repita a nova senha"
            type="password"
            autoComplete="new-password"
            required
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
          />
          <Botao type="submit" carregando={enviando} className="w-full">
            Salvar nova senha
          </Botao>
        </form>
      )}
      <p className="mt-6 text-sm">
        <Link to="/recuperar-senha" className="font-semibold text-acento underline-offset-4 hover:underline">
          Pedir um novo link
        </Link>
      </p>
    </TelaDeAcesso>
  )
}
