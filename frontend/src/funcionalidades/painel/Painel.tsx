import { Check, Flame } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../compartilhado/api'
import { BarrasPorDia, contarPorDia } from '../../compartilhado/graficos'
import { useSessao } from '../../compartilhado/sessao'
import type {
  Checkin,
  CheckinDoDia,
  RegistroDeAuditoria,
  SituacaoDaMatricula,
  Usuario,
} from '../../compartilhado/tipos'
import { NOME_DA_PERMISSAO, NOME_DO_PAPEL, Permissao, PLANOS } from '../../compartilhado/tipos'
import { Avatar, Cartao, Contador, Conteudo, Esqueleto, SeloDePapel, Vazio } from '../../compartilhado/ui'
import {
  calcularSequencias,
  chaveDoDia,
  diasAtras,
  formatarData,
  formatarDiaDaSemana,
  formatarHora,
  inicioDoMes,
  useDados,
  comInicialMaiuscula,
} from '../../compartilhado/util'
import { CLASSE_DO_TOM, descreverEvento, detalheComNomes } from '../auditoria/eventos'

const DIAS_DO_GRAFICO = 14

const LINK = 'text-sm font-semibold text-acento underline-offset-4 hover:underline'

function TituloDoBloco({ children, link }: { children: ReactNode; link?: { para: string; texto: string } }) {
  return (
    <div className="mb-5 flex items-baseline justify-between gap-3">
      <h2>{children}</h2>
      {link && (
        <Link to={link.para} className={LINK}>
          {link.texto}
        </Link>
      )}
    </div>
  )
}

/** Um número do painel: régua de tinta em cima, o rótulo, o número e a linha que diz o que ele significa. */
function Indicador({ rotulo, valor, detalhe }: { rotulo: string; valor: number; detalhe?: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 lg:block">
      <p className="text-sm font-semibold">{rotulo}</p>
      <p className="numero col-start-2 row-span-2 row-start-1 text-[3rem] lg:mt-3 lg:text-[4rem]">
        <Contador valor={valor} />
      </p>
      {detalhe && <p className="mt-1 text-sm text-texto-suave lg:mt-3">{detalhe}</p>}
    </div>
  )
}

const CELULA_DE_NUMERO = 'border-t-2 border-texto pt-3 lg:pt-4'

/** O objeto principal do aluno: a sequência de treinos, a matrícula e o atalho para o check-in. */
function ResumoDoAluno() {
  const consulta = useDados(async () => {
    const [matricula, checkins] = await Promise.all([
      api.get<SituacaoDaMatricula>('/matriculas/minha'),
      api.get<Checkin[]>('/checkins/meus'),
    ])
    return { matricula, checkins }
  })

  return (
    <Cartao escuro className="sm:p-8 lg:col-span-8">
      <Conteudo {...consulta} esqueleto={<Esqueleto naTinta className="h-56" />}>
        {({ matricula, checkins }) => {
          const dias = new Set(checkins.map((c) => chaveDoDia(c.registradoEm)))
          const { atual } = calcularSequencias(dias)
          const treinouHoje = dias.has(chaveDoDia(diasAtras(0)))
          const plano = PLANOS.find((p) => p.valor === matricula.plano)
          return (
            <div>
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-sobre-tinta-suave">
                  <Flame className="size-4 text-lima" aria-hidden /> Sequência atual
                </p>
                <p className="numero mt-4 flex items-baseline gap-3 text-[8.5rem]">
                  <Contador valor={atual} />
                  <span className="text-[2.25rem] text-sobre-tinta-suave">{atual === 1 ? 'dia' : 'dias'}</span>
                </p>
              </div>
              <div className="mt-6 max-w-[40ch]">
                <p className="text-sobre-tinta-suave">
                  {matricula.ativa && matricula.validaAte
                    ? `Plano ${plano?.nome ?? ''} ativo até ${formatarData(matricula.validaAte)}.`
                    : 'Sua matrícula não está ativa. Procure a recepção para liberar o check-in.'}
                </p>
                <Link
                  to="/checkin"
                  className="mt-5 inline-flex h-12 items-center rounded-controle bg-lima px-6 font-semibold text-sobre-destaque transition-transform duration-[120ms] active:scale-[0.98]"
                >
                  {treinouHoje ? 'Ver meus treinos' : 'Fazer check-in'}
                </Link>
              </div>
            </div>
          )
        }}
      </Conteudo>
    </Cartao>
  )
}

function TreinosDoAluno() {
  const checkins = useDados(() => api.get<Checkin[]>('/checkins/meus'))
  return (
    <section className="lg:col-span-4">
      <Conteudo {...checkins} esqueleto={<Esqueleto className="h-56" />}>
        {(lista) => {
          const noMes = lista.filter((c) => new Date(c.registradoEm) >= inicioDoMes()).length
          const naSemana = lista.filter((c) => new Date(c.registradoEm) >= diasAtras(6)).length
          const { maior } = calcularSequencias(new Set(lista.map((c) => chaveDoDia(c.registradoEm))))
          return (
            <dl className="grid h-full grid-cols-2 content-between gap-x-6 gap-y-8">
              <div className={`col-span-2 ${CELULA_DE_NUMERO}`}>
                <dt className="text-sm font-semibold">Treinos neste mês</dt>
                <dd className="numero mt-3 text-[4rem]">
                  <Contador valor={noMes} />
                </dd>
              </div>
              <div className="border-t border-borda pt-4">
                <dt className="text-sm text-texto-suave">Últimos 7 dias</dt>
                <dd className="numero mt-2 text-[2.5rem]">{naSemana}</dd>
              </div>
              <div className="border-t border-borda pt-4">
                <dt className="text-sm text-texto-suave">Maior sequência</dt>
                <dd className="numero mt-2 text-[2.5rem]">{maior}</dd>
              </div>
            </dl>
          )
        }}
      </Conteudo>
    </section>
  )
}

function CheckinsHoje({ className = '' }: { className?: string }) {
  const checkins = useDados(() => api.get<CheckinDoDia[]>('/checkins/hoje'))
  return (
    <section className={`${CELULA_DE_NUMERO} ${className}`}>
      <Conteudo {...checkins} esqueleto={<Esqueleto className="h-28" />}>
        {(lista) => (
          <Indicador
            rotulo="Check-ins hoje"
            valor={lista.length}
            detalhe={lista[0] ? `Último às ${formatarHora(lista[0].registradoEm)}` : 'Nenhuma entrada ainda'}
          />
        )}
      </Conteudo>
    </section>
  )
}

function TotalDeUsuarios({ className = '' }: { className?: string }) {
  const usuarios = useDados(() => api.get<Usuario[]>('/usuarios'))
  return (
    <section className={`${CELULA_DE_NUMERO} ${className}`}>
      <Conteudo {...usuarios} esqueleto={<Esqueleto className="h-28" />}>
        {(lista) => {
          const inativos = lista.filter((u) => !u.ativo).length
          return (
            <Indicador
              rotulo="Usuários cadastrados"
              valor={lista.length}
              detalhe={inativos === 0 ? 'Todas as contas ativas' : `${inativos} com a conta desativada`}
            />
          )
        }}
      </Conteudo>
    </section>
  )
}

/** O registro de entradas do dia, com a hora na frente, como numa catraca. */
function EntradasDeHoje() {
  const checkins = useDados(() => api.get<CheckinDoDia[]>('/checkins/hoje'))
  return (
    <section className="lg:col-span-8">
      <TituloDoBloco link={{ para: '/checkins-de-hoje', texto: 'Ver todas' }}>Entradas de hoje</TituloDoBloco>
      <Conteudo {...checkins}>
        {(lista) =>
          lista.length === 0 ? (
            <Vazio titulo="Ninguém entrou ainda">As entradas aparecem aqui assim que os alunos fizerem check-in.</Vazio>
          ) : (
            <ul className="divide-y divide-borda border-y border-borda">
              {lista.slice(0, 5).map((checkin) => (
                <li key={checkin.id} className="flex items-center gap-4 py-3">
                  <time className="w-12 shrink-0 font-semibold tabular-nums">{formatarHora(checkin.registradoEm)}</time>
                  <Avatar nome={checkin.nomeDoAluno} />
                  <span className="min-w-0 flex-1 truncate">{checkin.nomeDoAluno}</span>
                </li>
              ))}
            </ul>
          )
        }
      </Conteudo>
    </section>
  )
}

/** Blocos do administrador. Os números vêm da trilha de auditoria, sem nenhuma rota extra na API. */
function VisaoDoAdministrador() {
  const consulta = useDados(async () => {
    const [registros, usuarios] = await Promise.all([
      api.get<RegistroDeAuditoria[]>('/auditoria/registros?limite=500'),
      api.get<Usuario[]>('/usuarios'),
    ])
    return { registros, nomes: new Map(usuarios.map((u) => [u.id, u.nome])) }
  })

  return (
    <Conteudo
      {...consulta}
      esqueleto={
        <>
          <Esqueleto className="h-36 lg:col-span-4" />
          <Esqueleto className="h-72 lg:col-span-7" />
          <Esqueleto className="h-72 lg:col-span-5" />
        </>
      }
    >
      {({ registros, nomes }) => {
        const datasDe = (tipo: string) => registros.filter((r) => r.tipo === tipo).map((r) => r.ocorridoEm)
        const seteDias = diasAtras(6)
        const recentes = (tipo: string) => datasDe(tipo).filter((data) => new Date(data) >= seteDias).length
        const falhas = recentes('identidade.login-falhou')
        const bloqueios = recentes('identidade.conta-bloqueada')

        return (
          <>
            <section className={`${CELULA_DE_NUMERO} lg:col-span-4`}>
              <Indicador
                rotulo="Logins sem sucesso em 7 dias"
                valor={falhas}
                detalhe={
                  bloqueios === 0
                    ? 'Nenhuma conta bloqueada no período.'
                    : `${bloqueios} ${bloqueios === 1 ? 'conta bloqueada' : 'contas bloqueadas'} no período.`
                }
              />
            </section>

            <Cartao className="lg:col-span-7">
              <TituloDoBloco>Check-ins por dia, últimos {DIAS_DO_GRAFICO} dias</TituloDoBloco>
              <BarrasPorDia
                pontos={contarPorDia(datasDe('checkin.checkin-registrado'), DIAS_DO_GRAFICO)}
                unidade={['check-in', 'check-ins']}
              />
            </Cartao>

            <Cartao className="lg:col-span-5">
              <TituloDoBloco>Logins por dia, últimos {DIAS_DO_GRAFICO} dias</TituloDoBloco>
              <BarrasPorDia
                pontos={contarPorDia(datasDe('identidade.login-realizado'), DIAS_DO_GRAFICO)}
                unidade={['login', 'logins']}
              />
            </Cartao>

            <section className="lg:col-span-12">
              <TituloDoBloco link={{ para: '/auditoria', texto: 'Abrir auditoria' }}>Atividade recente</TituloDoBloco>
              <ul className="divide-y divide-borda border-y border-borda">
                {registros.slice(0, 4).map((registro) => {
                  const evento = descreverEvento(registro.tipo)
                  const Icone = evento.icone
                  return (
                    <li key={registro.id} className="flex items-center gap-4 py-3">
                      <time className="w-12 shrink-0 text-sm tabular-nums text-texto-suave">
                        {formatarHora(registro.ocorridoEm)}
                      </time>
                      <span className={`grid size-8 shrink-0 place-items-center rounded-controle ${CLASSE_DO_TOM[evento.tom]}`}>
                        <Icone className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1 md:flex md:items-baseline md:gap-3">
                        <p className="truncate md:shrink-0">
                          <span className="font-semibold">{evento.rotulo}</span>
                          {registro.usuarioId && nomes.has(registro.usuarioId) && (
                            <span> de {nomes.get(registro.usuarioId)}</span>
                          )}
                        </p>
                        <p className="truncate text-sm text-texto-suave">{detalheComNomes(registro, nomes)}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          </>
        )
      }}
    </Conteudo>
  )
}

function SeuAcesso({ permissoes, papel }: { permissoes: string[]; papel: string }) {
  return (
    <section className="lg:col-span-12">
      <TituloDoBloco>O que o perfil {papel} pode fazer</TituloDoBloco>
      <ul className="grid gap-x-8 gap-y-4 border-t border-borda pt-5 sm:grid-cols-2 lg:grid-cols-3">
        {permissoes.map((permissao) => (
          <li key={permissao} className="flex items-start gap-2.5">
            <Check className="mt-1 size-4 shrink-0 text-acento" aria-hidden />
            <span>
              {NOME_DA_PERMISSAO[permissao] ?? permissao}
              <code className="mt-0.5 block font-mono text-xs text-texto-suave">{permissao}</code>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-texto-suave">
        O servidor confere estas permissões em toda requisição. Esconder um item do menu não é o que protege o sistema.
      </p>
    </section>
  )
}

export function Painel() {
  const { perfil, pode } = useSessao()
  if (!perfil) return null

  const aluno = pode(Permissao.CHECKIN_REGISTRAR)
  const administrador = pode(Permissao.AUDITORIA_CONSULTAR)
  const veEntradas = pode(Permissao.CHECKIN_LISTAR_DO_DIA)
  const veUsuarios = pode(Permissao.USUARIOS_LISTAR)

  return (
    <>
      <header className="mb-10 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <h1 className="titulo text-[2.5rem] md:text-[3.25rem]">Olá, {perfil.usuario.nome.split(' ')[0]}.</h1>
        <div className="flex items-center gap-3 pb-1.5 text-texto-suave">
          <SeloDePapel papel={perfil.papel} />
          <time>{comInicialMaiuscula(formatarDiaDaSemana(diasAtras(0)))}</time>
        </div>
      </header>

      <div className="grid gap-x-6 gap-y-12 lg:grid-cols-12">
        {aluno && (
          <>
            <ResumoDoAluno />
            <TreinosDoAluno />
          </>
        )}

        {veEntradas && <CheckinsHoje className={administrador ? 'lg:col-span-4' : 'lg:col-span-6'} />}
        {veUsuarios && (
          <TotalDeUsuarios className={administrador ? 'lg:col-span-4' : veEntradas ? 'lg:col-span-6' : 'lg:col-span-12'} />
        )}
        {administrador && <VisaoDoAdministrador />}
        {veEntradas && !administrador && (
          <>
            <EntradasDeHoje />
            <Cartao escuro className="flex flex-col justify-between gap-6 lg:col-span-4">
              <div>
                <h2 className="titulo text-[2rem]">Matrículas</h2>
                <p className="mt-3 text-sobre-tinta-suave">
                  Consulte a situação de um aluno e registre ou renove o plano.
                </p>
              </div>
              <Link
                to="/matriculas"
                className="inline-flex h-11 w-fit items-center rounded-controle bg-lima px-5 font-semibold text-sobre-destaque transition-transform duration-[120ms] active:scale-[0.98]"
              >
                Abrir matrículas
              </Link>
            </Cartao>
          </>
        )}

        <SeuAcesso permissoes={perfil.permissoes} papel={NOME_DO_PAPEL[perfil.papel]} />
      </div>
    </>
  )
}
