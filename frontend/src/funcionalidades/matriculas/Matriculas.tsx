import { useState } from 'react'
import { api, mensagemDoErro } from '../../compartilhado/api'
import { useSessao } from '../../compartilhado/sessao'
import type { Plano, SituacaoDaMatricula, Usuario } from '../../compartilhado/tipos'
import { Permissao, PLANOS } from '../../compartilhado/tipos'
import { Aviso, Avatar, Botao, Cabecalho, Cartao, Conteudo, Vazio } from '../../compartilhado/ui'
import { iniciais, useDados } from '../../compartilhado/util'
import { ResumoDaMatricula } from './CartaoDaMatricula'

function MatriculaDoAluno({ aluno }: { aluno: Usuario }) {
  const { pode } = useSessao()
  const situacao = useDados(() => api.get<SituacaoDaMatricula>(`/matriculas/aluno/${aluno.id}`), [aluno.id])
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [enviando, setEnviando] = useState<Plano | null>(null)

  const registrar = async (plano: Plano) => {
    setErro(null)
    setSucesso(null)
    setEnviando(plano)
    try {
      await api.post('/matriculas', { alunoId: aluno.id, plano })
      setSucesso('Matrícula registrada.')
      situacao.recarregar()
    } catch (falha) {
      setErro(mensagemDoErro(falha))
    } finally {
      setEnviando(null)
    }
  }

  return (
    <Cartao>
      <div className="flex items-center gap-3">
        <Avatar sigla={iniciais(aluno.nome)} />
        <div className="min-w-0">
          <p className="truncate font-semibold">{aluno.nome}</p>
          <p className="truncate text-sm text-texto-suave">{aluno.email}</p>
        </div>
      </div>

      <div className="mt-5">
        <Conteudo {...situacao}>{(dados) => <ResumoDaMatricula situacao={dados} />}</Conteudo>
      </div>

      {pode(Permissao.MATRICULAS_REGISTRAR) && (
        <div className="mt-6 border-t border-borda pt-5">
          <h3 className="text-sm font-semibold">Registrar ou renovar</h3>
          <p className="mt-1 text-sm text-texto-suave">
            Se ainda houver matrícula valendo, o novo período começa quando o atual terminar.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {PLANOS.map((plano) => (
              <Botao
                key={plano.valor}
                variante="secundario"
                carregando={enviando === plano.valor}
                disabled={enviando !== null || !aluno.ativo}
                onClick={() => registrar(plano.valor)}
              >
                {plano.nome} · {plano.duracao}
              </Botao>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            {!aluno.ativo && <Aviso tom="alerta">A conta deste usuário está desativada.</Aviso>}
            {erro && <Aviso tom="perigo">{erro}</Aviso>}
            {sucesso && <Aviso tom="sucesso">{sucesso}</Aviso>}
          </div>
        </div>
      )}
    </Cartao>
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
            <div className="grid items-start gap-5 lg:grid-cols-[20rem_1fr]">
              <Cartao className="p-3">
                <input
                  type="search"
                  aria-label="Buscar aluno"
                  placeholder="Buscar aluno"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="mb-2 h-10 w-full rounded-lg bg-superficie-2 px-3 text-sm placeholder:text-texto-suave"
                />
                <ul className="max-h-[28rem] space-y-1 overflow-y-auto">
                  {visiveis.map((usuario) => (
                    <li key={usuario.id}>
                      <button
                        type="button"
                        onClick={() => setSelecionadoId(usuario.id)}
                        aria-pressed={usuario.id === selecionadoId}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          usuario.id === selecionadoId ? 'bg-destaque text-sobre-destaque' : 'hover:bg-superficie-2'
                        }`}
                      >
                        <span className="block truncate font-medium">{usuario.nome}</span>
                        <span className="block truncate text-xs opacity-75">{usuario.email}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </Cartao>

              {selecionado ? (
                <MatriculaDoAluno key={selecionado.id} aluno={selecionado} />
              ) : (
                <Vazio>Escolha um aluno na lista para ver a matrícula.</Vazio>
              )}
            </div>
          )
        }}
      </Conteudo>
    </>
  )
}
