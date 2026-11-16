import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, mensagemDoErro } from '../../compartilhado/api'
import { useSessao } from '../../compartilhado/sessao'
import { Aviso, Botao, Campo } from '../../compartilhado/ui'
import { TelaDeAcesso } from './TelaDeAcesso'

export function Cadastro() {
  const { entrar } = useSessao()
  const navegar = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const aoEnviar = async (evento: FormEvent) => {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      await api.post('/auth/cadastro', { nome, email, senha })
      await entrar(email, senha)
      navegar('/painel', { replace: true })
    } catch (falha) {
      setErro(mensagemDoErro(falha))
      setEnviando(false)
    }
  }

  return (
    <TelaDeAcesso titulo="Criar conta" descricao="A conta é criada com o perfil de aluno.">
      <form onSubmit={aoEnviar} className="space-y-4">
        {erro && <Aviso tom="perigo">{erro}</Aviso>}
        <Campo
          rotulo="Nome completo"
          autoComplete="name"
          required
          minLength={3}
          autoFocus
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <Campo
          rotulo="E-mail"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Campo
          rotulo="Senha"
          type="password"
          autoComplete="new-password"
          required
          ajuda="Pelo menos 8 caracteres, com letras e números."
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <Botao type="submit" carregando={enviando} className="w-full">
          Criar conta
        </Botao>
      </form>
      <p className="mt-6 text-sm text-texto-suave">
        Já tem conta?{' '}
        <Link to="/entrar" className="font-semibold text-acento underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
    </TelaDeAcesso>
  )
}
