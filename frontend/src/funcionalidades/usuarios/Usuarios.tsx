import { Plus, UsersRound } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { api, mensagemDoErro } from '../../compartilhado/api'
import { useAvisar } from '../../compartilhado/avisos'
import { useSessao } from '../../compartilhado/sessao'
import type { Atribuicao, Papel, Usuario } from '../../compartilhado/tipos'
import { NOME_DO_PAPEL, PAPEIS, Permissao } from '../../compartilhado/tipos'
import {
  Aviso,
  Avatar,
  Botao,
  Cabecalho,
  Campo,
  CampoDeBusca,
  Conteudo,
  Dialogo,
  Segmentos,
  Selo,
  SeloDePapel,
  Vazio,
} from '../../compartilhado/ui'
import { useDados } from '../../compartilhado/util'

type FiltroDePapel = Papel | 'TODOS'

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
      className="h-9 rounded-controle border border-borda-campo bg-superficie px-2.5 text-sm font-semibold transition-colors duration-[120ms] hover:border-texto-suave disabled:cursor-not-allowed disabled:opacity-55"
    >
      {PAPEIS.map((papel) => (
        <option key={papel} value={papel}>
          {NOME_DO_PAPEL[papel]}
        </option>
      ))}
    </select>
  )
}

function FormularioDeNovoUsuario({ aoCriar, aoFechar }: { aoCriar: (nome: string) => void; aoFechar: () => void }) {
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
      aoCriar(criado.nome)
    } catch (falha) {
      setErro(mensagemDoErro(falha))
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={aoEnviar} className="space-y-4">
      {erro && <Aviso tom="perigo">{erro}</Aviso>}
      <Campo rotulo="Nome completo" required minLength={3} autoFocus value={nome} onChange={(e) => setNome(e.target.value)} />
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
          <span className="mb-1.5 block text-sm font-semibold">Perfil</span>
          <SeletorDePapel valor={papel} aoMudar={setPapel} rotulo="Perfil do novo usuário" />
        </div>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Botao type="button" variante="fantasma" onClick={aoFechar}>
          Cancelar
        </Botao>
        <Botao type="submit" carregando={enviando}>
          Criar usuário
        </Botao>
      </div>
    </form>
  )
}

export function Usuarios() {
  const { perfil, pode } = useSessao()
  const avisar = useAvisar()
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
  const [filtro, setFiltro] = useState<FiltroDePapel>('TODOS')
  const [criando, setCriando] = useState(false)
  const [aDesativar, setADesativar] = useState<Usuario | null>(null)
  const [ocupado, setOcupado] = useState<string | null>(null)

  const executar = async (usuarioId: string, acao: () => Promise<unknown>, sucesso: string) => {
    setOcupado(usuarioId)
    try {
      await acao()
      avisar('sucesso', sucesso)
      consulta.recarregar()
    } catch (falha) {
      avisar('perigo', mensagemDoErro(falha))
    } finally {
      setOcupado(null)
    }
  }

  const definirStatus = (usuario: Usuario, ativo: boolean) =>
    executar(
      usuario.id,
      () => api.patch(`/usuarios/${usuario.id}/status`, { ativo }),
      ativo ? `Conta de ${usuario.nome} reativada.` : `Conta de ${usuario.nome} desativada.`,
    )

  return (
    <>
      <Cabecalho
        titulo="Usuários"
        descricao="Alunos e funcionários cadastrados."
        acoes={
          podeCriar && (
            <Botao onClick={() => setCriando(true)}>
              <Plus className="size-4" /> Novo usuário
            </Botao>
          )
        }
      />

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <CampoDeBusca rotulo="Buscar por nome ou e-mail" valor={busca} aoMudar={setBusca} className="min-w-56 flex-1" />
        {vePapeis && (
          <Segmentos<FiltroDePapel>
            rotulo="Filtrar por perfil"
            valor={filtro}
            aoMudar={setFiltro}
            opcoes={[{ valor: 'TODOS', nome: 'Todos' }, ...PAPEIS.map((p) => ({ valor: p, nome: NOME_DO_PAPEL[p] }))]}
          />
        )}
      </div>

      <Conteudo {...consulta}>
        {({ usuarios, papeis }) => {
          const termo = busca.trim().toLowerCase()
          const visiveis = usuarios.filter(
            (u) =>
              (!termo || u.nome.toLowerCase().includes(termo) || u.email.toLowerCase().includes(termo)) &&
              (filtro === 'TODOS' || papeis.get(u.id) === filtro),
          )
          if (visiveis.length === 0) {
            return (
              <Vazio icone={UsersRound} titulo="Nenhum usuário encontrado">
                Tente outro nome, outro e-mail ou outro perfil.
              </Vazio>
            )
          }
          return (
            <table className="w-full text-left">
              <caption className="sr-only">Usuários cadastrados</caption>
              <thead className="max-md:sr-only">
                <tr className="border-b border-texto text-sm">
                  <th scope="col" className="pb-3 pr-3 font-semibold">
                    Usuário
                  </th>
                  {vePapeis && (
                    <th scope="col" className="px-3 pb-3 font-semibold">
                      Perfil
                    </th>
                  )}
                  <th scope="col" className="px-3 pb-3 font-semibold">
                    Conta
                  </th>
                  {alteraStatus && (
                    <th scope="col" className="pb-3 pl-3 text-right font-semibold">
                      Ação
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {visiveis.map((usuario) => {
                  const papel = papeis.get(usuario.id)
                  const souEu = usuario.id === perfil?.usuario.id
                  return (
                    <tr
                      key={usuario.id}
                      className="border-b border-borda transition-colors duration-[120ms] hover:bg-superficie-2 max-md:grid max-md:grid-cols-[minmax(0,1fr)_auto] max-md:gap-x-3 max-md:gap-y-2 max-md:py-4"
                    >
                      <td className="py-3 pr-3 max-md:col-span-2 max-md:py-0">
                        <div className="flex items-center gap-3">
                          <Avatar nome={usuario.nome} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold">
                              {usuario.nome}
                              {souEu && <span className="ml-2 font-normal text-texto-suave">(você)</span>}
                            </p>
                            <p className="truncate text-sm text-texto-suave">{usuario.email}</p>
                          </div>
                        </div>
                      </td>
                      {vePapeis && (
                        <td className="px-3 py-3 max-md:px-0 max-md:py-0 max-md:pl-12">
                          {papel &&
                            (alteraPapel ? (
                              <SeletorDePapel
                                valor={papel}
                                rotulo={`Perfil de ${usuario.nome}`}
                                desabilitado={ocupado === usuario.id}
                                aoMudar={(novo) =>
                                  executar(
                                    usuario.id,
                                    () => api.put(`/autorizacao/usuarios/${usuario.id}/papel`, { papel: novo }),
                                    `${usuario.nome} agora tem o perfil ${NOME_DO_PAPEL[novo]}.`,
                                  )
                                }
                              />
                            ) : (
                              <SeloDePapel papel={papel} />
                            ))}
                        </td>
                      )}
                      <td className="px-3 py-3 max-md:px-0 max-md:py-0 max-md:pl-12 max-md:self-center">
                        <Selo tom={usuario.ativo ? 'sucesso' : 'perigo'}>{usuario.ativo ? 'Ativa' : 'Desativada'}</Selo>
                      </td>
                      {alteraStatus && (
                        <td className="py-3 pl-3 text-right max-md:col-start-2 max-md:row-start-2 max-md:row-span-2 max-md:self-center max-md:py-0">
                          <Botao
                            variante={usuario.ativo ? 'perigo' : 'secundario'}
                            tamanho="pequeno"
                            className="w-24"
                            disabled={souEu}
                            title={souEu ? 'Você não pode desativar a própria conta' : undefined}
                            carregando={ocupado === usuario.id}
                            onClick={() => (usuario.ativo ? setADesativar(usuario) : definirStatus(usuario, true))}
                          >
                            {usuario.ativo ? 'Desativar' : 'Reativar'}
                          </Botao>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )
        }}
      </Conteudo>

      <Dialogo
        aberto={criando}
        aoFechar={() => setCriando(false)}
        titulo="Novo usuário"
        descricao="A conta é criada como aluno. O perfil pode ser alterado depois."
      >
        <FormularioDeNovoUsuario
          aoFechar={() => setCriando(false)}
          aoCriar={(nome) => {
            setCriando(false)
            avisar('sucesso', `Conta de ${nome} criada.`)
            consulta.recarregar()
          }}
        />
      </Dialogo>

      <Dialogo
        aberto={aDesativar !== null}
        aoFechar={() => setADesativar(null)}
        titulo="Desativar conta"
        descricao={`${aDesativar?.nome ?? ''} perde o acesso imediatamente e todas as sessões abertas são encerradas. A conta pode ser reativada depois.`}
      >
        <div className="flex justify-end gap-2">
          <Botao variante="fantasma" onClick={() => setADesativar(null)}>
            Cancelar
          </Botao>
          <Botao
            variante="perigo"
            onClick={() => {
              const usuario = aDesativar
              setADesativar(null)
              if (usuario) void definirStatus(usuario, false)
            }}
          >
            Desativar conta
          </Botao>
        </div>
      </Dialogo>
    </>
  )
}
