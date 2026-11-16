import { CalendarCheck, RefreshCw } from 'lucide-react'
import { api } from '../../compartilhado/api'
import type { CheckinDoDia } from '../../compartilhado/tipos'
import { Avatar, Botao, Cabecalho, Cartao, Contador, Conteudo, Vazio } from '../../compartilhado/ui'
import { formatarHora, useDados } from '../../compartilhado/util'

/** O registro de entradas do dia, com a hora na frente, como numa catraca. */
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
            <div className="grid items-start gap-x-10 gap-y-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
              <Cartao escuro className="lg:sticky lg:top-10">
                <p className="text-sm font-semibold text-sobre-tinta-suave">Entradas hoje</p>
                <p className="numero mt-3 text-[7rem]">
                  <Contador valor={lista.length} />
                </p>
                <dl className="mt-6 grid grid-cols-2 border-t border-borda-tinta pt-4">
                  <div>
                    <dt className="text-sm text-sobre-tinta-suave">Primeira</dt>
                    <dd className="mt-1 text-[1.44rem] font-semibold tabular-nums">
                      {formatarHora(lista.at(-1)!.registradoEm)}
                    </dd>
                  </div>
                  <div className="border-l border-borda-tinta pl-4">
                    <dt className="text-sm text-sobre-tinta-suave">Última</dt>
                    <dd className="mt-1 text-[1.44rem] font-semibold tabular-nums">
                      {formatarHora(lista[0].registradoEm)}
                    </dd>
                  </div>
                </dl>
              </Cartao>

              <table className="w-full text-left">
                <caption className="sr-only">Entradas de hoje</caption>
                <thead>
                  <tr className="border-b border-texto text-sm">
                    <th scope="col" className="w-20 pb-3 font-semibold">
                      Hora
                    </th>
                    <th scope="col" className="pb-3 font-semibold">
                      Aluno
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((checkin) => (
                    <tr key={checkin.id} className="border-b border-borda">
                      <td className="py-3 align-middle">
                        <time className="font-semibold tabular-nums">{formatarHora(checkin.registradoEm)}</time>
                      </td>
                      <td className="py-3">
                        <span className="flex items-center gap-3">
                          <Avatar nome={checkin.nomeDoAluno} />
                          <span className="min-w-0 truncate">{checkin.nomeDoAluno}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </Conteudo>
    </>
  )
}
