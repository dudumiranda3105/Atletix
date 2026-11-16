import { Mail, RefreshCw } from 'lucide-react'
import { Fragment } from 'react'
import { api } from '../../compartilhado/api'
import type { Mensagem } from '../../compartilhado/tipos'
import { Aviso, Botao, Cabecalho, Conteudo, Vazio } from '../../compartilhado/ui'
import { formatarDataEHora, useDados } from '../../compartilhado/util'

/** Mostra o texto do e-mail e transforma os endereços http em links clicáveis. */
function Corpo({ texto }: { texto: string }) {
  const partes = texto.split(/(https?:\/\/\S+)/)
  return (
    <p className="max-w-[68ch] whitespace-pre-wrap break-words leading-relaxed text-texto-suave">
      {partes.map((parte, indice) =>
        parte.startsWith('http') ? (
          <a key={indice} href={parte} className="break-all font-semibold text-acento underline underline-offset-2">
            {parte}
          </a>
        ) : (
          <Fragment key={indice}>{parte}</Fragment>
        ),
      )}
    </p>
  )
}

export function CaixaDeSaida() {
  const mensagens = useDados(() => api.get<Mensagem[]>('/notificacoes/mensagens'))

  return (
    <>
      <Cabecalho
        titulo="Caixa de saída"
        descricao="E-mails gerados pelo sistema."
        acoes={
          <Botao variante="secundario" onClick={mensagens.recarregar} carregando={mensagens.carregando}>
            {!mensagens.carregando && <RefreshCw className="size-4" />} Atualizar
          </Botao>
        }
      />
      <div className="mb-6">
        <Aviso tom="neutro">
          O envio de e-mail é simulado nesta versão: as mensagens ficam aqui em vez de irem para a caixa do usuário.
        </Aviso>
      </div>
      <Conteudo {...mensagens}>
        {(lista) =>
          lista.length === 0 ? (
            <Vazio icone={Mail} titulo="Nenhum e-mail enviado ainda">
              Os e-mails de recuperação de senha e os alertas de segurança aparecem aqui.
            </Vazio>
          ) : (
            <ul className="border-t border-texto">
              {lista.map((mensagem) => (
                <li key={mensagem.id} className="border-b border-borda py-6">
                  <article className="grid gap-x-10 gap-y-3 md:grid-cols-[16rem_minmax(0,1fr)]">
                    <header className="min-w-0">
                      <time className="text-sm tabular-nums text-texto-suave">{formatarDataEHora(mensagem.criadaEm)}</time>
                      <p className="mt-1 truncate text-sm text-texto-suave">Para {mensagem.destinatario}</p>
                    </header>
                    <div className="min-w-0">
                      <h2 className="text-[1.0625rem] leading-snug">{mensagem.assunto}</h2>
                      <div className="mt-2">
                        <Corpo texto={mensagem.corpo} />
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )
        }
      </Conteudo>
    </>
  )
}
