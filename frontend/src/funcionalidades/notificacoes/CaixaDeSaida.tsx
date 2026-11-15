import { RefreshCw } from 'lucide-react'
import { Fragment } from 'react'
import { api } from '../../compartilhado/api'
import type { Mensagem } from '../../compartilhado/tipos'
import { Aviso, Botao, Cabecalho, Cartao, Conteudo, Vazio } from '../../compartilhado/ui'
import { formatarDataEHora, useDados } from '../../compartilhado/util'

/** Mostra o texto do e-mail e transforma os endereços http em links clicáveis. */
function Corpo({ texto }: { texto: string }) {
  const partes = texto.split(/(https?:\/\/\S+)/)
  return (
    <p className="whitespace-pre-wrap break-words text-sm text-texto-suave">
      {partes.map((parte, indice) =>
        parte.startsWith('http') ? (
          <a key={indice} href={parte} className="font-medium text-acento underline">
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
      <div className="mb-5">
        <Aviso tom="neutro">
          O envio de e-mail é simulado nesta versão: as mensagens ficam aqui em vez de irem para a caixa do usuário.
        </Aviso>
      </div>
      <Conteudo {...mensagens}>
        {(lista) =>
          lista.length === 0 ? (
            <Vazio>Nenhum e-mail enviado ainda.</Vazio>
          ) : (
            <div className="space-y-4">
              {lista.map((mensagem) => (
                <Cartao key={mensagem.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="font-semibold">{mensagem.assunto}</h2>
                    <span className="text-xs tabular-nums text-texto-suave">{formatarDataEHora(mensagem.criadaEm)}</span>
                  </div>
                  <p className="mt-1 text-sm">Para: {mensagem.destinatario}</p>
                  <div className="mt-3 border-t border-borda pt-3">
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
