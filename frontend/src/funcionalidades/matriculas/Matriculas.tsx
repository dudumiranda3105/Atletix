import { IdCard } from 'lucide-react'
import { useState } from 'react'
import { api, mensagemDoErro } from '../../compartilhado/api'
import { useAvisar } from '../../compartilhado/avisos'
import { useSessao } from '../../compartilhado/sessao'
import type { Plano, SituacaoDaMatricula, Usuario } from '../../compartilhado/tipos'
import { Permissao, PLANOS } from '../../compartilhado/tipos'
import { Aviso, Avatar, Cabecalho, CampoDeBusca, Conteudo, Esqueleto, Vazio } from '../../compartilhado/ui'
import { useDados } from '../../compartilhado/util'
import { ResumoDaMatricula } from './CartaoDaMatricula'

function MatriculaDoAluno({ aluno }: { aluno: Usuario }) {
  const { pode } = useSessao()
  const avisar = useAvisar()
  const situacao = useDados(() => api.get<SituacaoDaMatricula>(`/matriculas/aluno/${aluno.id}`), [aluno.id])
  const [enviando, setEnviando] = useState<Plano | null>(null)

  const registrar = async (plano: Plano) => {
    setEnviando(plano)
    try {
      await api.post('/matriculas', { alunoId: aluno.id, plano })
      avisar('sucesso', `Matrícula de ${aluno.nome} registrada.`)
      situacao.recarregar()
    } catch (falha) {
      avisar('perigo', mensagemDoErro(falha))
    } finally {
      setEnviando(null)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 border-b border-borda pb-6">
        <Avatar nome={aluno.nome} grande />
        <div className="min-w-0">
          <h2 className="truncate text-[1.44rem]">{aluno.nome}</h2>
          <p className="truncate text-texto-suave">{aluno.email}</p>
        </div>
      </div>

      <div className="py-8">
        <Conteudo {...situacao} esqueleto={<Esqueleto className="h-24" />}>
          {(dados) => <ResumoDaMatricula situacao={dados} />}
        </Conteudo>
      </div>

      {pode(Permissao.MATRICULAS_REGISTRAR) && (
        <section className="border-t border-borda pt-8">
          <h2>Registrar ou renovar</h2>
          <p className="mt-1.5 text-texto-suave">
            Se ainda houver matrícula valendo, o novo período começa quando o atual terminar.
          </p>
          {!aluno.ativo && (
            <div className="mt-4">
              <Aviso tom="alerta">A conta deste usuário está desativada.</Aviso>
            </div>
          )}
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {PLANOS.map((plano) => (
              <button
                key={plano.valor}
                type="button"
                disabled={enviando !== null || !aluno.ativo}
                onClick={() => registrar(plano.valor)}
                className="rounded-painel border border-borda-campo bg-superficie p-5 text-left transition-[border-color,background-color,transform] duration-[120ms] hover:border-texto hover:bg-superficie-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 disabled:active:scale-100"
              >
                <span className="titulo block text-[1.75rem]">{plano.nome}</span>
                <span className="mt-1 block text-texto-suave">{plano.duracao}</span>
                <span className="mt-4 block text-sm font-semibold text-acento">
                  {enviando === plano.valor ? 'Registrando' : 'Registrar'}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export function Matriculas() {
  const usuarios = useDados(() => api.get<Usuario[]>('/usuarios'))
  const [busca, setBusca] = useState('')
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null)

  return (
    <>
      <Cabecalho titulo="Matrículas" descricao="Consulte a situação de um aluno e registre o plano." />
      <Conteudo {...usuarios}>
        {(lista) => {
          const termo = busca.trim().toLowerCase()
          const visiveis = lista.filter(
            (u) => !termo || u.nome.toLowerCase().includes(termo) || u.email.toLowerCase().includes(termo),
          )
          const selecionado = lista.find((u) => u.id === selecionadoId)
          return (
            <div className="grid items-start gap-x-10 gap-y-8 lg:grid-cols-[22rem_minmax(0,1fr)]">
              <div className="rounded-painel bg-superficie-2 p-2">
                <CampoDeBusca rotulo="Buscar aluno" valor={busca} aoMudar={setBusca} className="p-1.5" />
                <ul className="mt-1 max-h-[32rem] overflow-y-auto">
                  {visiveis.map((usuario) => {
                    const ativo = usuario.id === selecionadoId
                    return (
                      <li key={usuario.id}>
                        <button
                          type="button"
                          onClick={() => setSelecionadoId(usuario.id)}
                          aria-pressed={ativo}
                          className={`flex w-full items-center gap-3 rounded-controle px-3 py-2.5 text-left transition-colors duration-[120ms] ${
                            ativo ? 'bg-tinta text-sobre-tinta' : 'hover:bg-superficie-3'
                          }`}
                        >
                          <Avatar nome={usuario.nome} />
                          <span className="min-w-0">
                            <span className="block truncate font-semibold">{usuario.nome}</span>
                            <span
                              className={`block truncate text-sm ${ativo ? 'text-sobre-tinta-suave' : 'text-texto-suave'}`}
                            >
                              {usuario.email}
                            </span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {selecionado ? (
                <MatriculaDoAluno key={selecionado.id} aluno={selecionado} />
              ) : (
                <Vazio icone={IdCard} titulo="Escolha um aluno">
                  Selecione uma pessoa na lista para ver a matrícula e registrar um plano.
                </Vazio>
              )}
            </div>
          )
        }}
      </Conteudo>
    </>
  )
}
