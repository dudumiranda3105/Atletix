import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { mensagemDoErro } from '../../compartilhado/api'
import { useSessao } from '../../compartilhado/sessao'
import { Aviso, Botao, Campo } from '../../compartilhado/ui'
import { TelaDeAcesso } from './TelaDeAcesso'

export function Entrar() {
  const { entrar } = useSessao()
  const navegar = useNavigate()
  const local = useLocation()
  const estado = local.state as { de?: string; aviso?: string } | null
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const aoEnviar = async (evento: FormEvent) => {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      await entrar(email, senha)
      navegar(estado?.de ?? '/painel', { replace: true })
    } catch (falha) {
      setErro(mensagemDoErro(falha))
      setEnviando(false)
    }
  }

  return (
    <TelaDeAcesso titulo="Entrar" descricao="Use o e-mail e a senha da sua conta.">
      <form onSubmit={aoEnviar} className="space-y-4">
        {estado?.aviso && !erro && <Aviso tom="sucesso">{estado.aviso}</Aviso>}
        {erro && <Aviso tom="perigo">{erro}</Aviso>}
        <Campo
          rotulo="E-mail"
          type="email"
          autoComplete="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Campo
          rotulo="Senha"
          type="password"
          autoComplete="current-password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <div className="text-right">
          <Link to="/recuperar-senha" className="text-sm font-semibold text-acento underline-offset-4 hover:underline">
            Esqueci minha senha
          </Link>
        </div>
        <Botao type="submit" carregando={enviando} className="w-full">
          Entrar
        </Botao>
      </form>
      <p className="mt-6 text-sm text-texto-suave">
        Ainda não tem conta?{' '}
        <Link to="/cadastro" className="font-semibold text-acento underline-offset-4 hover:underline">
          Criar conta de aluno
        </Link>
      </p>
    </TelaDeAcesso>
  )
}
