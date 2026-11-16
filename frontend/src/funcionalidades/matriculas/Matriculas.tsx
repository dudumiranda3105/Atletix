import { IdCard, Search } from 'lucide-react'
import { useState } from 'react'
import { api, mensagemDoErro } from '../../compartilhado/api'
import { useAvisar } from '../../compartilhado/avisos'
import { useSessao } from '../../compartilhado/sessao'
import type { Plano, SituacaoDaMatricula, Usuario } from '../../compartilhado/tipos'
import { Permissao, PLANOS } from '../../compartilhado/tipos'
import { Aviso, Avatar, Cabecalho, Cartao, Conteudo, Esqueleto, Vazio } from '../../compartilhado/ui'
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
    <div className="space-y-5">
      <Cartao>
        <div className="flex items-center gap-3">
          <Avatar nome={aluno.nome} grande />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{aluno.nome}</p>
            <p className="truncate text-sm text-texto-suave">{aluno.email}</p>
          </div>
        </div>
        <div className="mt-6 border-t border-borda pt-5">
          <Conteudo {...situacao} esqueleto={<Esqueleto className="h-24" />}>
            {(dados) => <ResumoDaMatricula situacao={dados} />}
          </Conteudo>
        </div>
      </Cartao>

      {pode(Permissao.MATRICULAS_REGISTRAR) && (
        <Cartao>
          <h2 className="font-semibold">Registrar ou renovar</h2>
          <p className="mt-1 text-sm text-texto-suave">
            Se ainda houver matrícula valendo, o novo período começa quando o atual terminar.
          </p>
          {!aluno.ativo && (
            <div className="mt-4">
              <Aviso tom="alerta">A conta deste usuário está desativada.</Aviso>
            </div>
          )}
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {PLANOS.map((plano) => (
              <button
                key={plano.valor}
                type="button"
                disabled={enviando !== null || !aluno.ativo}
                onClick={() => registrar(plano.valor)}
                className="group rounded-xl border border-borda p-4 text-left transition-[border-color,transform,background-color] hover:border-acento hover:bg-superficie-2/60 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
              >
                <span className="titulo block text-2xl">{plano.nome}</span>
                <span className="mt-1 block text-sm text-texto-suave">{plano.duracao}</span>
                <span className="mt-3 block text-sm font-semibold text-acento">
                  {enviando === plano.valor ? 'Registrando' : 'Registrar'}
                </span>
              </button>
            ))}
          </div>
        </Cartao>
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
            <div className="grid items-start gap-5 lg:grid-cols-[22rem_1fr]">
              <Cartao className="p-2">
                <div className="relative p-1.5">
                  <Search className="pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-texto-suave" />
                  <input
                    type="search"
                    aria-label="Buscar aluno"
                    placeholder="Buscar aluno"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="h-10 w-full rounded-xl bg-superficie-2 pl-10 pr-3 text-sm placeholder:text-texto-suave/80"
                  />
                </div>
                <ul className="max-h-[30rem] overflow-y-auto">
                  {visiveis.map((usuario) => {
                    const ativo = usuario.id === selecionadoId
                    return (
                      <li key={usuario.id}>
                        <button
                          type="button"
                          onClick={() => setSelecionadoId(usuario.id)}
                          aria-pressed={ativo}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                            ativo ? 'bg-destaque text-sobre-destaque' : 'hover:bg-superficie-2'
                          }`}
                        >
                          <Avatar nome={usuario.nome} />
                          <span className="min-w-0">
                            <span className="block truncate font-medium">{usuario.nome}</span>
                            <span className={`block truncate text-xs ${ativo ? 'opacity-75' : 'text-texto-suave'}`}>
                              {usuario.email}
                            </span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </Cartao>

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
