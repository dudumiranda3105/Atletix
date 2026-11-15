import { Plus, Search } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { api, mensagemDoErro } from '../../compartilhado/api'
import { useSessao } from '../../compartilhado/sessao'
import type { Atribuicao, Papel, Usuario } from '../../compartilhado/tipos'
import { NOME_DO_PAPEL, PAPEIS, Permissao } from '../../compartilhado/tipos'
import { Aviso, Avatar, Botao, Cabecalho, Campo, Cartao, Conteudo, Selo, Vazio } from '../../compartilhado/ui'
import { iniciais, useDados } from '../../compartilhado/util'

function SeletorDePapel({
  valor,
  aoMudar,
  rotulo,
  desabilitado,
}: {
  valor: Papel
  aoMudar: (papel: Papel) => void
  rotulo: string
  desabilitado?: boolean
}) {
  return (
    <select
      aria-label={rotulo}
      value={valor}
      disabled={desabilitado}
      onChange={(e) => aoMudar(e.target.value as Papel)}
      className="h-9 rounded-lg border border-borda bg-superficie px-2 text-sm disabled:opacity-55"
    >
      {PAPEIS.map((papel) => (
        <option key={papel} value={papel}>
          {NOME_DO_PAPEL[papel]}
        </option>
      ))}
    </select>
  )
}

function NovoUsuario({ aoCriar, aoFechar }: { aoCriar: () => void; aoFechar: () => void }) {
  const { pode } = useSessao()
  const podeDefinirPapel = pode(Permissao.AUTORIZACAO_ALTERAR_PAPEL)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [papel, setPapel] = useState<Papel>('ALUNO')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const aoEnviar = async (evento: FormEvent) => {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      // Duas chamadas, uma para cada módulo dono do dado: a conta (Identidade) e o papel (Autorização).
      const criado = await api.post<Usuario>('/auth/cadastro', { nome, email, senha })
      if (papel !== 'ALUNO') await api.put(`/autorizacao/usuarios/${criado.id}/papel`, { papel })
      aoCriar()
    } catch (falha) {
      setErro(mensagemDoErro(falha))
      setEnviando(false)
    }
  }

  return (
    <Cartao className="mb-5">
      <h2 className="font-semibold">Novo usuário</h2>
      <form onSubmit={aoEnviar} className="mt-4 grid gap-4 sm:grid-cols-2">
        {erro && (
          <div className="sm:col-span-2">
            <Aviso tom="perigo">{erro}</Aviso>
          </div>
        )}
        <Campo rotulo="Nome completo" required minLength={3} value={nome} onChange={(e) => setNome(e.target.value)} />
        <Campo rotulo="E-mail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Campo
          rotulo="Senha inicial"
          type="password"
          autoComplete="new-password"
          required
          ajuda="Pelo menos 8 caracteres, com letras e números."
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        {podeDefinirPapel && (
          <div>
            <span className="mb-1.5 block text-sm font-medium">Perfil</span>
            <SeletorDePapel valor={papel} aoMudar={setPapel} rotulo="Perfil do novo usuário" />
          </div>
        )}
        <div className="flex gap-2 sm:col-span-2">
          <Botao type="submit" carregando={enviando}>
            Criar usuário
          </Botao>
          <Botao type="button" variante="fantasma" onClick={aoFechar}>
            Cancelar
          </Botao>
        </div>
      </form>
    </Cartao>
  )
}

export function Usuarios() {
  const { perfil, pode } = useSessao()
  const vePapeis = pode(Permissao.AUTORIZACAO_LISTAR)
  const alteraPapel = pode(Permissao.AUTORIZACAO_ALTERAR_PAPEL)
  const alteraStatus = pode(Permissao.USUARIOS_ALTERAR_STATUS)
  const podeCriar = pode(Permissao.MATRICULAS_REGISTRAR)

  // Usuários e papéis pertencem a módulos diferentes no backend; a tela junta os dois pelo id.
  const consulta = useDados(async () => {
    const [usuarios, atribuicoes] = await Promise.all([
      api.get<Usuario[]>('/usuarios'),
      vePapeis ? api.get<Atribuicao[]>('/autorizacao/atribuicoes') : Promise.resolve([]),
    ])
    return { usuarios, papeis: new Map(atribuicoes.map((a) => [a.usuarioId, a.papel])) }
  })

  const [busca, setBusca] = useState('')
  const [criando, setCriando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState<string | null>(null)

  const executar = async (usuarioId: string, acao: () => Promise<unknown>) => {
    setErro(null)
    setOcupado(usuarioId)
    try {
      await acao()
      consulta.recarregar()
    } catch (falha) {
      setErro(mensagemDoErro(falha))
    } finally {
      setOcupado(null)
    }
  }

  return (
    <>
      <Cabecalho
        titulo="Usuários"
        descricao="Alunos e funcionários cadastrados."
        acoes={
          podeCriar &&
          !criando && (
            <Botao onClick={() => setCriando(true)}>
              <Plus className="size-4" /> Novo usuário
            </Botao>
          )
        }
      />

      {criando && (
        <NovoUsuario
          aoFechar={() => setCriando(false)}
          aoCriar={() => {
            setCriando(false)
            consulta.recarregar()
          }}
        />
      )}

      {erro && (
        <div className="mb-4">
          <Aviso tom="perigo">{erro}</Aviso>
        </div>
      )}

      <Conteudo {...consulta}>
        {({ usuarios, papeis }) => {
          const termo = busca.trim().toLowerCase()
          const visiveis = usuarios.filter(
            (u) => !termo || u.nome.toLowerCase().includes(termo) || u.email.toLowerCase().includes(termo),
          )
          return (
            <Cartao className="p-0">
              <div className="relative border-b border-borda p-3">
                <Search className="pointer-events-none absolute left-6 top-1/2 size-4 -translate-y-1/2 text-texto-suave" />
                <input
                  type="search"
                  aria-label="Buscar por nome ou e-mail"
                  placeholder="Buscar por nome ou e-mail"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="h-10 w-full rounded-lg bg-superficie-2 pl-10 pr-3 text-sm placeholder:text-texto-suave"
                />
              </div>

              {visiveis.length === 0 ? (
                <div className="p-5">
                  <Vazio>Nenhum usuário encontrado.</Vazio>
                </div>
              ) : (
                <ul className="divide-y divide-borda">
                  {visiveis.map((usuario) => {
                    const papel = papeis.get(usuario.id)
                    const souEu = usuario.id === perfil?.usuario.id
                    return (
                      <li key={usuario.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-3.5">
                        <Avatar sigla={iniciais(usuario.nome)} />
                        <div className="min-w-0 flex-1 basis-48">
                          <p className="truncate font-medium">
                            {usuario.nome} {souEu && <span className="text-sm text-texto-suave">(você)</span>}
                          </p>
                          <p className="truncate text-sm text-texto-suave">{usuario.email}</p>
                        </div>
                        <Selo tom={usuario.ativo ? 'sucesso' : 'perigo'}>{usuario.ativo ? 'Ativa' : 'Desativada'}</Selo>
                        {papel &&
                          (alteraPapel ? (
                            <SeletorDePapel
                              valor={papel}
                              rotulo={`Perfil de ${usuario.nome}`}
                              desabilitado={ocupado === usuario.id}
                              aoMudar={(novo) =>
                                executar(usuario.id, () =>
                                  api.put(`/autorizacao/usuarios/${usuario.id}/papel`, { papel: novo }),
                                )
                              }
                            />
                          ) : (
                            <Selo>{NOME_DO_PAPEL[papel]}</Selo>
                          ))}
                        {alteraStatus && (
                          <Botao
                            variante={usuario.ativo ? 'perigo' : 'secundario'}
                            tamanho="pequeno"
                            className="w-24"
                            disabled={souEu}
                            title={souEu ? 'Você não pode desativar a própria conta' : undefined}
                            carregando={ocupado === usuario.id}
                            onClick={() =>
                              executar(usuario.id, () =>
                                api.patch(`/usuarios/${usuario.id}/status`, { ativo: !usuario.ativo }),
                              )
                            }
                          >
                            {usuario.ativo ? 'Desativar' : 'Reativar'}
                          </Botao>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </Cartao>
          )
        }}
      </Conteudo>
    </>
  )
}
