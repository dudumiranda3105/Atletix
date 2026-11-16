import { CalendarCheck, RefreshCw } from 'lucide-react'
import { api } from '../../compartilhado/api'
import type { CheckinDoDia } from '../../compartilhado/tipos'
import { Avatar, Botao, Cabecalho, Cartao, Contador, Conteudo, Vazio } from '../../compartilhado/ui'
import { formatarHora, useDados } from '../../compartilhado/util'

export function CheckinsDeHoje() {
  const checkins = useDados(() => api.get<CheckinDoDia[]>('/checkins/hoje'))

  return (
    <>
      <Cabecalho
        titulo="Check-ins de hoje"
        descricao="Alunos que entraram na academia hoje, do mais recente para o mais antigo."
        acoes={
          <Botao variante="secundario" onClick={checkins.recarregar} carregando={checkins.carregando}>
            {!checkins.carregando && <RefreshCw className="size-4" />} Atualizar
          </Botao>
        }
      />
      <Conteudo {...checkins}>
        {(lista) =>
          lista.length === 0 ? (
            <Vazio icone={CalendarCheck} titulo="Nenhum check-in hoje ainda">
              As entradas aparecem aqui assim que os alunos fizerem check-in.
            </Vazio>
          ) : (
            <div className="grid items-start gap-5 lg:grid-cols-12">
              <Cartao escuro className="p-6 lg:col-span-4">
                <p className="text-sm text-sobre-tinta-suave">Entradas hoje</p>
                <p className="numero mt-2 text-8xl">
                  <Contador valor={lista.length} />
                </p>
                <p className="mt-3 text-sm text-sobre-tinta-suave">
                  Primeira às {formatarHora(lista.at(-1)!.registradoEm)}, última às{' '}
                  {formatarHora(lista[0].registradoEm)}.
                </p>
              </Cartao>
              <Cartao className="p-2 lg:col-span-8">
                <ul>
                  {lista.map((checkin) => (
                    <li
                      key={checkin.id}
                      className="flex items-center gap-4 rounded-xl px-3 py-2.5 transition-colors hover:bg-superficie-2"
                    >
                      <Avatar nome={checkin.nomeDoAluno} />
                      <span className="min-w-0 flex-1 truncate font-medium">{checkin.nomeDoAluno}</span>
                      <span className="text-sm tabular-nums text-texto-suave">{formatarHora(checkin.registradoEm)}</span>
                    </li>
                  ))}
                </ul>
              </Cartao>
            </div>
          )
        }
      </Conteudo>
    </>
  )
}
