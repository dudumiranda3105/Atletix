import { motion } from 'motion/react'
import { chaveDoDia, diasAtras, formatarDiaEMes } from './util'

export interface PontoDoDia {
  chave: string
  rotulo: string
  descricao: string
  valor: number
}

/** Monta os últimos N dias (do mais antigo para hoje) contando quantas datas caem em cada um. */
export function contarPorDia(datas: (string | Date)[], dias: number): PontoDoDia[] {
  const contagem = new Map<string, number>()
  for (const data of datas) {
    const chave = chaveDoDia(data)
    contagem.set(chave, (contagem.get(chave) ?? 0) + 1)
  }
  return Array.from({ length: dias }, (_, i) => {
    const dia = diasAtras(dias - 1 - i)
    const chave = chaveDoDia(dia)
    return {
      chave,
      rotulo: String(dia.getDate()),
      descricao: i === dias - 1 ? 'Hoje' : formatarDiaEMes(dia),
      valor: contagem.get(chave) ?? 0,
    }
  })
}

/**
 * Barras de uma série por dia. O título do cartão nomeia a série, então não há legenda.
 * Só o maior valor e o de hoje levam número; os demais aparecem ao passar o mouse.
 */
export function BarrasPorDia({ pontos, unidade }: { pontos: PontoDoDia[]; unidade: [string, string] }) {
  const maximo = Math.max(1, ...pontos.map((p) => p.valor))
  const indiceDoMaximo = pontos.findIndex((p) => p.valor === maximo)
  const ultimo = pontos.length - 1
  const comUnidade = (valor: number) => `${valor} ${valor === 1 ? unidade[0] : unidade[1]}`

  return (
    <figure>
      <div className="flex h-40 items-end gap-[3px]" aria-hidden>
        {pontos.map((ponto, i) => {
          const rotulado = ponto.valor > 0 && (i === indiceDoMaximo || i === ultimo)
          const alinhamento = i < 3 ? 'left-0' : i > ultimo - 3 ? 'right-0' : 'left-1/2 -translate-x-1/2'
          return (
            <div key={ponto.chave} className="group relative flex h-full flex-1 flex-col items-center justify-end">
              <span
                className={`pointer-events-none absolute -top-1 z-10 -translate-y-full whitespace-nowrap rounded-lg bg-tinta px-2.5 py-1.5 text-xs font-medium text-sobre-tinta opacity-0 shadow-flutuante transition-opacity group-hover:opacity-100 ${alinhamento}`}
              >
                {ponto.descricao}: {comUnidade(ponto.valor)}
              </span>
              {rotulado && <span className="mb-1 text-xs font-semibold tabular-nums">{ponto.valor}</span>}
              {ponto.valor > 0 ? (
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.025, ease: [0.16, 1, 0.3, 1] }}
                  style={{ height: `${(ponto.valor / maximo) * 78}%`, transformOrigin: 'bottom' }}
                  className={`w-full max-w-9 rounded-t-[4px] transition-colors group-hover:bg-acento ${
                    i === ultimo ? 'bg-acento' : 'bg-grafico'
                  }`}
                />
              ) : (
                <div className="h-[3px] w-full max-w-9 rounded-full bg-grafico-vazio" />
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex gap-[3px] border-t border-borda pt-2 text-[0.7rem] text-texto-suave" aria-hidden>
        {pontos.map((ponto, i) => (
          <span key={ponto.chave} className="flex-1 text-center tabular-nums">
            {i % 2 === (ultimo % 2) ? ponto.rotulo : ''}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>Valores por dia</caption>
        <tbody>
          {pontos.map((ponto) => (
            <tr key={ponto.chave}>
              <th scope="row">{ponto.descricao}</th>
              <td>{comUnidade(ponto.valor)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

const INICIAIS_DA_SEMANA = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

/** Calendário de treinos: um quadrado por dia, semanas em colunas, de segunda a domingo. */
export function CalendarioDeTreinos({ dias, semanas = 8 }: { dias: Set<string>; semanas?: number }) {
  const hoje = diasAtras(0)
  const chaveDeHoje = chaveDoDia(hoje)
  const diaDaSemana = (hoje.getDay() + 6) % 7 // segunda = 0
  const inicio = diasAtras(diaDaSemana + (semanas - 1) * 7, hoje)

  const colunas = Array.from({ length: semanas }, (_, semana) =>
    Array.from({ length: 7 }, (_, dia) => {
      const data = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + semana * 7 + dia)
      return { data, chave: chaveDoDia(data), futuro: data > hoje }
    }),
  )

  return (
    <figure className="overflow-x-auto pb-1">
      <div className="inline-grid grid-cols-[auto_1fr] gap-x-2 gap-y-1.5">
        <span />
        <div className="flex gap-1.5 text-[0.7rem] text-texto-suave" aria-hidden>
          {colunas.map((coluna, i) => {
            const mes = coluna[0].data.getMonth()
            const mudou = i === 0 || colunas[i - 1][0].data.getMonth() !== mes
            return (
              <span key={coluna[0].chave} className="w-6 overflow-visible whitespace-nowrap">
                {mudou ? MESES[mes] : ''}
              </span>
            )
          })}
        </div>
        <div className="grid grid-rows-7 gap-1.5 text-[0.65rem] leading-none text-texto-suave" aria-hidden>
          {INICIAIS_DA_SEMANA.map((letra, i) => (
            <span key={i} className="flex h-6 items-center">
              {i % 2 === 0 ? letra : ''}
            </span>
          ))}
        </div>
        <div className="flex gap-1.5">
          {colunas.map((coluna) => (
            <div key={coluna[0].chave} className="grid grid-rows-7 gap-1.5">
              {coluna.map(({ data, chave, futuro }) => {
                const treinou = dias.has(chave)
                const ehHoje = chave === chaveDeHoje
                return (
                  <div
                    key={chave}
                    title={futuro ? undefined : `${formatarDiaEMes(data)}: ${treinou ? 'treinou' : 'sem treino'}`}
                    className={`size-6 rounded-md ${
                      futuro ? 'opacity-0' : treinou ? 'bg-grafico' : 'bg-grafico-vazio'
                    } ${ehHoje ? 'ring-2 ring-acento ring-offset-2 ring-offset-superficie' : ''}`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <figcaption className="mt-3 flex items-center gap-4 text-xs text-texto-suave">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-[3px] bg-grafico" /> Treinou
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-[3px] bg-grafico-vazio" /> Sem treino
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-[3px] ring-2 ring-acento" /> Hoje
        </span>
      </figcaption>
    </figure>
  )
}
