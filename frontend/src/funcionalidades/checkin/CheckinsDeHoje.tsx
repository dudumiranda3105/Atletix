import { RefreshCw } from 'lucide-react'
import { api } from '../../compartilhado/api'
import type { CheckinDoDia } from '../../compartilhado/tipos'
import { Avatar, Botao, Cabecalho, Cartao, Conteudo, Vazio } from '../../compartilhado/ui'
import { formatarHora, iniciais, useDados } from '../../compartilhado/util'

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
            <Vazio>Nenhum check-in hoje ainda.</Vazio>
          ) : (
            <Cartao className="p-0">
              <ul className="divide-y divide-borda">
                {lista.map((checkin) => (
                  <li key={checkin.id} className="flex items-center gap-4 px-5 py-3.5">
                    <Avatar sigla={iniciais(checkin.nomeDoAluno)} />
                    <span className="min-w-0 flex-1 truncate font-medium">{checkin.nomeDoAluno}</span>
                    <span className="text-sm tabular-nums text-texto-suave">{formatarHora(checkin.registradoEm)}</span>
                  </li>
                ))}
              </ul>
            </Cartao>
          )
        }
      </Conteudo>
    </>
  )
}
