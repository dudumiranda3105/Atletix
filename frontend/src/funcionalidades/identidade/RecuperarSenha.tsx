import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api, mensagemDoErro } from '../../compartilhado/api'
import { Aviso, Botao, Campo } from '../../compartilhado/ui'
import { TelaDeAcesso } from './TelaDeAcesso'

export function RecuperarSenha() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const aoEnviar = async (evento: FormEvent) => {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      await api.post('/auth/recuperar-senha', { email })
      setEnviado(true)
    } catch (falha) {
      setErro(mensagemDoErro(falha))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <TelaDeAcesso titulo="Recuperar senha" descricao="Enviaremos um link para você criar uma nova senha.">
      {enviado ? (
        <div className="space-y-4">
          <Aviso tom="sucesso">
            Se existir uma conta com <strong>{email}</strong>, o link de redefinição foi enviado. Ele vale por 30
            minutos e só pode ser usado uma vez.
          </Aviso>
          <Aviso tom="neutro">
            Nesta versão de demonstração o e-mail não sai de verdade: o administrador o encontra em “Caixa de saída”.
          </Aviso>
        </div>
      ) : (
        <form onSubmit={aoEnviar} className="space-y-4">
          {erro && <Aviso tom="perigo">{erro}</Aviso>}
          <Campo
            rotulo="E-mail da conta"
            type="email"
            autoComplete="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Botao type="submit" carregando={enviando} className="w-full">
            Enviar link
          </Botao>
        </form>
      )}
      <p className="mt-6 text-sm">
        <Link to="/entrar" className="font-semibold text-acento underline-offset-4 hover:underline">
          Voltar para o login
        </Link>
      </p>
    </TelaDeAcesso>
  )
}
