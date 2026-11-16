import { Check, ScanLine } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { api, mensagemDoErro } from '../../compartilhado/api'
import { useAvisar } from '../../compartilhado/avisos'
import { CalendarioDeTreinos } from '../../compartilhado/graficos'
import type { Checkin, SituacaoDaMatricula } from '../../compartilhado/tipos'
import { Aviso, Cabecalho, Cartao, Contador, Conteudo, Esqueleto, Vazio } from '../../compartilhado/ui'
import {
  calcularSequencias,
  chaveDoDia,
  diasAtras,
  formatarHora,
  inicioDoMes,
  nomeDoDia,
  useDados,
} from '../../compartilhado/util'
import { ResumoDaMatricula } from '../matriculas/CartaoDaMatricula'

function Numero({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <div>
      <p className="text-sm text-texto-suave">{rotulo}</p>
      <p className="numero mt-1 text-5xl">
        <Contador valor={valor} />
      </p>
    </div>
  )
}

export function MeuCheckin() {
  const matricula = useDados(() => api.get<SituacaoDaMatricula>('/matriculas/minha'))
  const historico = useDados(() => api.get<Checkin[]>('/checkins/meus'))
  const avisar = useAvisar()
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const dias = new Set((historico.dados ?? []).map((c) => chaveDoDia(c.registradoEm)))
  const deHoje = (historico.dados ?? []).find((c) => chaveDoDia(c.registradoEm) === chaveDoDia(diasAtras(0)))
  const { atual, maior } = calcularSequencias(dias)
  const noMes = (historico.dados ?? []).filter((c) => new Date(c.registradoEm) >= inicioDoMes()).length

  const fazerCheckin = async () => {
    setErro(null)
    setEnviando(true)
    try {
      await api.post<Checkin>('/checkins')
      avisar('sucesso', 'Entrada liberada. Bom treino!')
      historico.recarregar()
    } catch (falha) {
      // A regra (conta ativa, matrícula em dia, um por dia) é do servidor; a tela só mostra a resposta.
      setErro(mensagemDoErro(falha))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <Cabecalho titulo="Check-in" descricao="Registre a sua entrada na academia." />

      <div className="grid gap-5 lg:grid-cols-12">
        <Cartao escuro className="flex flex-col items-center justify-center gap-6 px-6 py-10 text-center lg:col-span-5">
          <AnimatePresence mode="wait" initial={false}>
            {historico.dados === null ? (
              <Esqueleto key="carregando" className="size-36 rounded-full bg-white/10" />
            ) : deHoje ? (
              <motion.div
                key="feito"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="flex flex-col items-center gap-5"
              >
                <span className="grid size-36 place-items-center rounded-full bg-[#c6f432] text-[#10130a]">
                  <Check className="size-16" strokeWidth={2.5} />
                </span>
                <div>
                  <p className="titulo text-4xl">Entrada liberada</p>
                  <p className="mt-2 text-sobre-tinta-suave">
                    Check-in de hoje feito às {formatarHora(deHoje.registradoEm)}. Bom treino!
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="pendente"
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-5"
              >
                <button
                  type="button"
                  onClick={fazerCheckin}
                  disabled={enviando}
                  className="group relative grid size-36 place-items-center rounded-full bg-[#c6f432] text-[#10130a] transition-transform active:scale-95 disabled:opacity-70"
                  aria-label="Fazer check-in"
                >
                  <span aria-hidden className="absolute inset-0 animate-pulso rounded-full bg-[#c6f432]" />
                  <ScanLine className="relative size-14" strokeWidth={2} />
                </button>
                <div>
                  <p className="titulo text-4xl">{enviando ? 'Registrando' : 'Fazer check-in'}</p>
                  <p className="mt-2 text-sobre-tinta-suave">Toque no botão ao chegar na academia.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {erro && (
            <div className="w-full text-left">
              <Aviso tom="perigo">{erro}</Aviso>
            </div>
          )}
        </Cartao>

        <Cartao className="lg:col-span-7">
          <Conteudo {...historico} esqueleto={<Esqueleto className="h-64" />}>
            {() => (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <Numero rotulo="Sequência atual" valor={atual} />
                  <Numero rotulo="Maior sequência" valor={maior} />
                  <Numero rotulo="Treinos no mês" valor={noMes} />
                </div>
                <div className="mt-7 border-t border-borda pt-6">
                  <h2 className="mb-4 font-semibold">Seus treinos nas últimas semanas</h2>
                  <CalendarioDeTreinos dias={dias} />
                </div>
              </>
            )}
          </Conteudo>
        </Cartao>

        <Cartao className="lg:col-span-5">
          <h2 className="mb-4 font-semibold">Matrícula</h2>
          <Conteudo {...matricula} esqueleto={<Esqueleto className="h-24" />}>
            {(situacao) => <ResumoDaMatricula situacao={situacao} />}
          </Conteudo>
        </Cartao>

        <Cartao className="lg:col-span-7">
          <h2 className="mb-4 font-semibold">Últimas entradas</h2>
          <Conteudo {...historico}>
            {(lista) =>
              lista.length === 0 ? (
                <Vazio icone={ScanLine} titulo="Nenhum check-in ainda">
                  O seu histórico aparece aqui depois do primeiro treino.
                </Vazio>
              ) : (
                <ul className="grid gap-x-8 gap-y-2.5 text-sm sm:grid-cols-2">
                  {lista.slice(0, 8).map((checkin) => (
                    <li key={checkin.id} className="flex justify-between gap-3">
                      <span className="truncate first-letter:uppercase">{nomeDoDia(chaveDoDia(checkin.registradoEm))}</span>
                      <span className="font-medium tabular-nums text-texto-suave">
                        {formatarHora(checkin.registradoEm)}
                      </span>
                    </li>
                  ))}
                </ul>
              )
            }
          </Conteudo>
        </Cartao>
      </div>
    </>
  )
}
