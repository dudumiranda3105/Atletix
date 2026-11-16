import { Mail, RefreshCw } from 'lucide-react'
import { Fragment } from 'react'
import { api } from '../../compartilhado/api'
import type { Mensagem } from '../../compartilhado/tipos'
import { Aviso, Botao, Cabecalho, Cartao, Conteudo, Vazio } from '../../compartilhado/ui'
import { formatarDataEHora, useDados } from '../../compartilhado/util'

/** Mostra o texto do e-mail e transforma os endereços http em links clicáveis. */
function Corpo({ texto }: { texto: string }) {
  const partes = texto.split(/(https?:\/\/\S+)/)
  return (
    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-texto-suave">
      {partes.map((parte, indice) =>
        parte.startsWith('http') ? (
          <a key={indice} href={parte} className="font-medium text-acento underline underline-offset-2">
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
            <div className="grid gap-4 lg:grid-cols-2">
              {lista.map((mensagem) => (
                <Cartao key={mensagem.id}>
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-superficie-2 text-texto-suave">
                      <Mail className="size-[1.1rem]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-semibold leading-snug">{mensagem.assunto}</h2>
                      <p className="mt-0.5 truncate text-sm text-texto-suave">Para {mensagem.destinatario}</p>
                    </div>
                    <time className="shrink-0 text-xs tabular-nums text-texto-suave">
                      {formatarDataEHora(mensagem.criadaEm)}
                    </time>
                  </div>
                  <div className="mt-4 border-t border-borda pt-4">
                    <Corpo texto={mensagem.corpo} />
                  </div>
                </Cartao>
              ))}
            </div>
          )
        }
      </Conteudo>
    </>
  )
}
