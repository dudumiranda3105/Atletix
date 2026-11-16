import { ArrowRight, Check, Flame } from 'lucide-react'
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
} from '../../compartilhado/util'
import { CLASSE_DO_TOM, descreverEvento, detalheComNomes } from '../auditoria/eventos'

const DIAS_DO_GRAFICO = 14

function TituloDoBloco({ children, link }: { children: ReactNode; link?: { para: string; texto: string } }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-3">
      <h2 className="font-semibold">{children}</h2>
      {link && (
        <Link to={link.para} className="flex items-center gap-1 text-sm font-medium text-acento hover:underline">
          {link.texto} <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  )
}

function Indicador({ rotulo, valor, detalhe }: { rotulo: string; valor: number; detalhe?: string }) {
  return (
    <>
      <p className="text-sm text-texto-suave">{rotulo}</p>
      <p className="numero mt-2 text-6xl">
        <Contador valor={valor} />
      </p>
      {detalhe && <p className="mt-2 text-sm text-texto-suave">{detalhe}</p>}
    </>
  )
}

/** Bloco principal do aluno: sequência de treinos, matrícula e o atalho para o check-in. */
function ResumoDoAluno() {
  const consulta = useDados(async () => {
    const [matricula, checkins] = await Promise.all([
      api.get<SituacaoDaMatricula>('/matriculas/minha'),
      api.get<Checkin[]>('/checkins/meus'),
    ])
    return { matricula, checkins }
  })

  return (
    <Cartao escuro className="relative overflow-hidden p-7 lg:col-span-7">
      <div
        aria-hidden
        className="absolute -right-16 -top-10 h-[140%] w-40 rotate-12 bg-[#c6f432]"
        style={{ clipPath: 'polygon(40% 0, 100% 0, 60% 100%, 0 100%)' }}
      />
      <Conteudo {...consulta} esqueleto={<Esqueleto className="h-44 bg-white/10" />}>
        {({ matricula, checkins }) => {
          const dias = new Set(checkins.map((c) => chaveDoDia(c.registradoEm)))
          const { atual } = calcularSequencias(dias)
          const treinouHoje = dias.has(chaveDoDia(diasAtras(0)))
          const plano = PLANOS.find((p) => p.valor === matricula.plano)
          return (
            <div className="relative max-w-md">
              <p className="flex items-center gap-2 text-sm font-medium text-sobre-tinta-suave">
                <Flame className="size-4 text-[#c6f432]" /> Sequência atual
              </p>
              <p className="numero mt-3 text-8xl">
                <Contador valor={atual} />
                <span className="ml-3 text-3xl text-sobre-tinta-suave">{atual === 1 ? 'dia' : 'dias'}</span>
              </p>
              <p className="mt-5 text-sobre-tinta-suave">
                {matricula.ativa && matricula.validaAte
                  ? `Plano ${plano?.nome ?? ''} ativo até ${formatarData(matricula.validaAte)}.`
                  : 'Sua matrícula não está ativa. Procure a recepção para liberar o check-in.'}
              </p>
              <Link
                to="/checkin"
                className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-[#c6f432] px-6 font-semibold text-[#10130a] transition-transform active:scale-[0.98]"
              >
                {treinouHoje ? 'Ver meus treinos' : 'Fazer check-in'} <ArrowRight className="size-4" />
              </Link>
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
    <Cartao className="lg:col-span-5">
      <Conteudo {...checkins} esqueleto={<Esqueleto className="h-40" />}>
        {(lista) => {
          const noMes = lista.filter((c) => new Date(c.registradoEm) >= inicioDoMes()).length
          const naSemana = lista.filter((c) => new Date(c.registradoEm) >= diasAtras(6)).length
          const { maior } = calcularSequencias(new Set(lista.map((c) => chaveDoDia(c.registradoEm))))
          return (
            <div className="grid h-full grid-cols-2 content-between gap-6">
              <div className="col-span-2">
                <Indicador rotulo="Treinos neste mês" valor={noMes} />
              </div>
              <div>
                <p className="text-sm text-texto-suave">Últimos 7 dias</p>
                <p className="numero mt-1 text-4xl">{naSemana}</p>
              </div>
              <div>
                <p className="text-sm text-texto-suave">Maior sequência</p>
                <p className="numero mt-1 text-4xl">{maior}</p>
              </div>
            </div>
          )
        }}
      </Conteudo>
    </Cartao>
  )
}

function CheckinsHoje({ className = '' }: { className?: string }) {
  const checkins = useDados(() => api.get<CheckinDoDia[]>('/checkins/hoje'))
  return (
    <Cartao className={className}>
      <Conteudo {...checkins} esqueleto={<Esqueleto className="h-28" />}>
        {(lista) => (
          <Indicador
            rotulo="Check-ins hoje"
            valor={lista.length}
            detalhe={lista[0] ? `Último às ${formatarHora(lista[0].registradoEm)}` : 'Nenhuma entrada ainda'}
          />
        )}
      </Conteudo>
    </Cartao>
  )
}

function TotalDeUsuarios({ className = '' }: { className?: string }) {
  const usuarios = useDados(() => api.get<Usuario[]>('/usuarios'))
  return (
    <Cartao className={className}>
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
    </Cartao>
  )
}

function EntradasDeHoje() {
  const checkins = useDados(() => api.get<CheckinDoDia[]>('/checkins/hoje'))
  return (
    <Cartao className="lg:col-span-7">
      <TituloDoBloco link={{ para: '/checkins-de-hoje', texto: 'Ver todas' }}>Entradas de hoje</TituloDoBloco>
      <Conteudo {...checkins}>
        {(lista) =>
          lista.length === 0 ? (
            <Vazio titulo="Ninguém entrou ainda">As entradas aparecem aqui assim que os alunos fizerem check-in.</Vazio>
          ) : (
            <ul className="space-y-3">
              {lista.slice(0, 5).map((checkin) => (
                <li key={checkin.id} className="flex items-center gap-3">
                  <Avatar nome={checkin.nomeDoAluno} />
                  <span className="min-w-0 flex-1 truncate font-medium">{checkin.nomeDoAluno}</span>
                  <span className="text-sm tabular-nums text-texto-suave">{formatarHora(checkin.registradoEm)}</span>
                </li>
              ))}
            </ul>
          )
        }
      </Conteudo>
    </Cartao>
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

            <Cartao escuro className="p-6 lg:col-span-4">
              <p className="text-sm text-sobre-tinta-suave">Logins sem sucesso em 7 dias</p>
              <p className="numero mt-2 text-6xl">
                <Contador valor={falhas} />
              </p>
              <p className="mt-2 text-sm text-sobre-tinta-suave">
                {bloqueios === 0
                  ? 'Nenhuma conta bloqueada no período.'
                  : `${bloqueios} ${bloqueios === 1 ? 'conta bloqueada' : 'contas bloqueadas'} no período.`}
              </p>
            </Cartao>

            <Cartao className="lg:col-span-8">
              <TituloDoBloco link={{ para: '/auditoria', texto: 'Abrir auditoria' }}>Atividade recente</TituloDoBloco>
              <ul className="space-y-3.5">
                {registros.slice(0, 4).map((registro) => {
                  const evento = descreverEvento(registro.tipo)
                  const Icone = evento.icone
                  return (
                    <li key={registro.id} className="flex items-center gap-3">
                      <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${CLASSE_DO_TOM[evento.tom]}`}>
                        <Icone className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {evento.rotulo}
                          {registro.usuarioId && nomes.has(registro.usuarioId) && (
                            <span className="font-normal text-texto-suave"> de {nomes.get(registro.usuarioId)}</span>
                          )}
                        </p>
                        <p className="truncate text-xs text-texto-suave">{detalheComNomes(registro, nomes)}</p>
                      </div>
                      <span className="text-xs tabular-nums text-texto-suave">{formatarHora(registro.ocorridoEm)}</span>
                    </li>
                  )
                })}
              </ul>
            </Cartao>
          </>
        )
      }}
    </Conteudo>
  )
}

function SeuAcesso({ permissoes, papel }: { permissoes: string[]; papel: string }) {
  return (
    <Cartao className="lg:col-span-12">
      <TituloDoBloco>O que o perfil {papel} pode fazer</TituloDoBloco>
      <ul className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {permissoes.map((permissao) => (
          <li key={permissao} className="flex items-start gap-2.5 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-acento" aria-hidden />
            <span>
              {NOME_DA_PERMISSAO[permissao] ?? permissao}
              <code className="block font-mono text-[0.7rem] text-texto-suave">{permissao}</code>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-5 border-t border-borda pt-4 text-xs text-texto-suave">
        O servidor confere estas permissões em toda requisição. Esconder um item do menu não é o que protege o sistema.
      </p>
    </Cartao>
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
      <header className="mb-8">
        <div className="flex items-center gap-3 text-sm text-texto-suave">
          <SeloDePapel papel={perfil.papel} />
          <span className="first-letter:uppercase">{formatarDiaDaSemana(diasAtras(0))}</span>
        </div>
        <h1 className="titulo mt-4 text-5xl md:text-7xl">Olá, {perfil.usuario.nome.split(' ')[0]}.</h1>
      </header>

      <div className="grid gap-5 lg:grid-cols-12">
        {aluno && (
          <>
            <ResumoDoAluno />
            <TreinosDoAluno />
          </>
        )}

        {veEntradas && <CheckinsHoje className={administrador ? 'lg:col-span-6' : 'lg:col-span-5'} />}
        {veUsuarios && (
          <TotalDeUsuarios className={administrador ? 'lg:col-span-6' : veEntradas ? 'lg:col-span-7' : 'lg:col-span-12'} />
        )}
        {administrador && <VisaoDoAdministrador />}
        {veEntradas && !administrador && (
          <>
            <EntradasDeHoje />
            <Cartao escuro className="flex flex-col justify-between gap-6 p-6 lg:col-span-5">
              <div>
                <p className="titulo text-3xl">Matrículas</p>
                <p className="mt-2 text-sm text-sobre-tinta-suave">
                  Consulte a situação de um aluno e registre ou renove o plano.
                </p>
              </div>
              <Link
                to="/matriculas"
                className="inline-flex h-11 w-fit items-center gap-2 rounded-xl bg-[#c6f432] px-5 font-semibold text-[#10130a] transition-transform active:scale-[0.98]"
              >
                Abrir matrículas <ArrowRight className="size-4" />
              </Link>
            </Cartao>
          </>
        )}

        <SeuAcesso permissoes={perfil.permissoes} papel={NOME_DO_PAPEL[perfil.papel]} />
      </div>
    </>
  )
}
