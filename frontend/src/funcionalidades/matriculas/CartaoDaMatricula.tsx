import type { SituacaoDaMatricula } from '../../compartilhado/tipos'
import { PLANOS } from '../../compartilhado/tipos'
import { Selo } from '../../compartilhado/ui'
import { formatarData } from '../../compartilhado/util'

/** Resumo da matrícula, usado no painel do aluno, no check-in e na tela da recepção. */
export function ResumoDaMatricula({ situacao }: { situacao: SituacaoDaMatricula }) {
  const plano = PLANOS.find((p) => p.valor === situacao.plano)

  if (!situacao.validaAte) {
    return (
      <div>
        <Selo tom="alerta">Sem matrícula</Selo>
        <p className="mt-3 text-sm text-texto-suave">Nenhuma matrícula registrada. A recepção faz a matrícula.</p>
      </div>
    )
  }

  return (
    <div>
      <Selo tom={situacao.ativa ? 'sucesso' : 'perigo'}>{situacao.ativa ? 'Matrícula ativa' : 'Matrícula vencida'}</Selo>
      <p className="mt-3 text-2xl font-bold tracking-tight">Plano {plano?.nome ?? situacao.plano}</p>
      <p className="mt-1 text-sm text-texto-suave">
        {situacao.ativa ? 'Válida até' : 'Venceu em'} {formatarData(situacao.validaAte)}
      </p>
    </div>
  )
}
