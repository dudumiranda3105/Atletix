import { ScanLine } from 'lucide-react'
import { useState } from 'react'
import { api, mensagemDoErro } from '../../compartilhado/api'
import type { Checkin, SituacaoDaMatricula } from '../../compartilhado/tipos'
import { Aviso, Botao, Cabecalho, Cartao, Conteudo, Vazio } from '../../compartilhado/ui'
import { formatarData, formatarHora, useDados } from '../../compartilhado/util'
import { ResumoDaMatricula } from '../matriculas/CartaoDaMatricula'

export function MeuCheckin() {
  const matricula = useDados(() => api.get<SituacaoDaMatricula>('/matriculas/minha'))
  const historico = useDados(() => api.get<Checkin[]>('/checkins/meus'))
  const [resultado, setResultado] = useState<{ tom: 'sucesso' | 'perigo'; texto: string } | null>(null)
  const [enviando, setEnviando] = useState(false)

  const fazerCheckin = async () => {
    setResultado(null)
    setEnviando(true)
    try {
      const checkin = await api.post<Checkin>('/checkins')
      setResultado({ tom: 'sucesso', texto: `Entrada liberada às ${formatarHora(checkin.registradoEm)}. Bom treino!` })
      historico.recarregar()
    } catch (falha) {
      // A regra (conta ativa, matrícula em dia, um por dia) é do servidor; a tela só mostra a resposta.
      setResultado({ tom: 'perigo', texto: mensagemDoErro(falha) })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <Cabecalho titulo="Check-in" descricao="Registre a sua entrada na academia." />
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <Cartao className="text-center">
            <Botao tamanho="grande" carregando={enviando} onClick={fazerCheckin} className="w-full">
              {!enviando && <ScanLine className="size-5" />} Fazer check-in
            </Botao>
            {resultado && (
              <div className="mt-4 text-left">
                <Aviso tom={resultado.tom}>{resultado.texto}</Aviso>
              </div>
            )}
          </Cartao>
          <Cartao>
            <Conteudo {...matricula}>{(situacao) => <ResumoDaMatricula situacao={situacao} />}</Conteudo>
          </Cartao>
        </div>

        <Cartao>
          <h2 className="font-semibold">Últimos check-ins</h2>
          <div className="mt-4">
            <Conteudo {...historico}>
              {(lista) =>
                lista.length === 0 ? (
                  <Vazio>Você ainda não fez nenhum check-in.</Vazio>
                ) : (
                  <ul className="divide-y divide-borda text-sm">
                    {lista.map((checkin) => (
                      <li key={checkin.id} className="flex justify-between py-2.5">
                        <span>{formatarData(checkin.registradoEm)}</span>
                        <span className="font-medium tabular-nums">{formatarHora(checkin.registradoEm)}</span>
                      </li>
                    ))}
                  </ul>
                )
              }
            </Conteudo>
          </div>
        </Cartao>
      </div>
    </>
  )
}
