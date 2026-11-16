import {
  CalendarCheck,
  Ellipsis,
  IdCard,
  LayoutDashboard,
  LogOut,
  Mail,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  ScanLine,
  ShieldCheck,
  Sun,
  UserRound,
  Users,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type { ComponentType, ReactNode } from 'react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSessao } from './sessao'
import { NOME_DO_PAPEL, Permissao } from './tipos'
import { Avatar, Marca } from './ui'

type Secao = 'Geral' | 'Gestão' | 'Segurança' | 'Conta'

interface Item {
  para: string
  rotulo: string
  curto: string
  secao: Secao
  icone: ComponentType<{ className?: string }>
  permissao?: string
}

/** Cada item só aparece para quem tem a permissão; o backend confere de novo em toda requisição. */
const ITENS: Item[] = [
  { para: '/painel', rotulo: 'Painel', curto: 'Painel', secao: 'Geral', icone: LayoutDashboard },
  {
    para: '/checkin',
    rotulo: 'Check-in',
    curto: 'Check-in',
    secao: 'Geral',
    icone: ScanLine,
    permissao: Permissao.CHECKIN_REGISTRAR,
  },
  {
    para: '/usuarios',
    rotulo: 'Usuários',
    curto: 'Usuários',
    secao: 'Gestão',
    icone: Users,
    permissao: Permissao.USUARIOS_LISTAR,
  },
  {
    para: '/matriculas',
    rotulo: 'Matrículas',
    curto: 'Matrículas',
    secao: 'Gestão',
    icone: IdCard,
    permissao: Permissao.MATRICULAS_CONSULTAR,
  },
  {
    para: '/checkins-de-hoje',
    rotulo: 'Check-ins de hoje',
    curto: 'Entradas',
    secao: 'Gestão',
    icone: CalendarCheck,
    permissao: Permissao.CHECKIN_LISTAR_DO_DIA,
  },
  {
    para: '/auditoria',
    rotulo: 'Auditoria',
    curto: 'Auditoria',
    secao: 'Segurança',
    icone: ShieldCheck,
    permissao: Permissao.AUDITORIA_CONSULTAR,
  },
  {
    para: '/caixa-de-saida',
    rotulo: 'Caixa de saída',
    curto: 'E-mails',
    secao: 'Segurança',
    icone: Mail,
    permissao: Permissao.NOTIFICACOES_CAIXA_DE_SAIDA,
  },
  { para: '/conta', rotulo: 'Minha conta', curto: 'Conta', secao: 'Conta', icone: UserRound },
]

const SECOES: Secao[] = ['Geral', 'Gestão', 'Segurança', 'Conta']
const ITENS_NA_BARRA = 4

// eslint-disable-next-line react-refresh/only-export-components
export function useItensPermitidos(): Item[] {
  const { pode } = useSessao()
  return ITENS.filter((item) => !item.permissao || pode(item.permissao))
}

export function BotaoDeTema({ className = '' }: { className?: string }) {
  const [escuro, setEscuro] = useState(() => document.documentElement.classList.contains('dark'))
  const alternar = () => {
    const novo = !escuro
    document.documentElement.classList.toggle('dark', novo)
    localStorage.setItem('atletix.tema', novo ? 'escuro' : 'claro')
    setEscuro(novo)
  }
  const Icone = escuro ? Sun : Moon
  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={escuro ? 'Usar tema claro' : 'Usar tema escuro'}
      title={escuro ? 'Tema claro' : 'Tema escuro'}
      className={`grid size-9 shrink-0 place-items-center rounded-xl text-texto-suave transition-colors hover:bg-superficie-2 hover:text-texto ${className}`}
    >
      <Icone className="size-4" />
    </button>
  )
}

function BotaoDeIcone({
  rotulo,
  aoClicar,
  children,
}: {
  rotulo: string
  aoClicar: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={aoClicar}
      aria-label={rotulo}
      title={rotulo}
      className="grid size-9 shrink-0 place-items-center rounded-xl text-texto-suave transition-colors hover:bg-superficie-2 hover:text-texto"
    >
      {children}
    </button>
  )
}

function MenuLateral({ itens, aoSair }: { itens: Item[]; aoSair: () => void }) {
  const { perfil } = useSessao()
  const { pathname } = useLocation()
  const [recolhido, setRecolhido] = useState(() => localStorage.getItem('atletix.menu') === 'recolhido')
  if (!perfil) return null

  const alternar = () => {
    localStorage.setItem('atletix.menu', recolhido ? 'aberto' : 'recolhido')
    setRecolhido(!recolhido)
  }

  return (
    <aside
      className={`sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-borda bg-superficie transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:flex ${
        recolhido ? 'w-[4.75rem]' : 'w-64'
      }`}
    >
      <div className={`flex h-[4.5rem] items-center px-4 ${recolhido ? 'justify-center' : 'justify-between'}`}>
        <Marca compacta={recolhido} />
        {!recolhido && (
          <div className="flex items-center">
            <BotaoDeTema />
            <BotaoDeIcone rotulo="Recolher menu" aoClicar={alternar}>
              <PanelLeftClose className="size-4" />
            </BotaoDeIcone>
          </div>
        )}
      </div>

      <nav aria-label="Principal" className="flex-1 space-y-5 overflow-y-auto px-3 py-2">
        {SECOES.map((secao) => {
          const daSecao = itens.filter((item) => item.secao === secao)
          if (daSecao.length === 0) return null
          return (
            <div key={secao}>
              {!recolhido && (
                <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-texto-suave/80">
                  {secao}
                </p>
              )}
              <ul className="space-y-0.5">
                {daSecao.map(({ para, rotulo, icone: Icone }) => {
                  const ativo = pathname === para
                  return (
                    <li key={para}>
                      <Link
                        to={para}
                        aria-current={ativo ? 'page' : undefined}
                        title={recolhido ? rotulo : undefined}
                        className={`relative flex h-10 items-center gap-3 rounded-xl px-3 text-[0.95rem] font-medium transition-colors ${
                          recolhido ? 'justify-center' : ''
                        } ${ativo ? 'text-sobre-destaque' : 'text-texto-suave hover:bg-superficie-2 hover:text-texto'}`}
                      >
                        {ativo && (
                          <motion.span
                            layoutId="item-ativo-do-menu"
                            className="absolute inset-0 rounded-xl bg-destaque"
                            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                          />
                        )}
                        <Icone className="relative size-[1.15rem] shrink-0" />
                        {!recolhido && <span className="relative truncate">{rotulo}</span>}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>

      <div className={`border-t border-borda p-3 ${recolhido ? 'flex flex-col items-center gap-1' : ''}`}>
        {recolhido ? (
          <>
            <BotaoDeIcone rotulo="Abrir menu" aoClicar={alternar}>
              <PanelLeftOpen className="size-4" />
            </BotaoDeIcone>
            <BotaoDeTema />
            <BotaoDeIcone rotulo="Sair" aoClicar={aoSair}>
              <LogOut className="size-4" />
            </BotaoDeIcone>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar nome={perfil.usuario.nome} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{perfil.usuario.nome}</p>
              <p className="text-xs text-texto-suave">{NOME_DO_PAPEL[perfil.papel]}</p>
            </div>
            <BotaoDeIcone rotulo="Sair" aoClicar={aoSair}>
              <LogOut className="size-4" />
            </BotaoDeIcone>
          </div>
        )}
      </div>
    </aside>
  )
}

function BarraDoCelular({ itens, aoSair }: { itens: Item[]; aoSair: () => void }) {
  const { pathname } = useLocation()
  const [maisAberto, setMaisAberto] = useState(false)
  const cabemTodos = itens.length <= ITENS_NA_BARRA + 1
  const naBarra = cabemTodos ? itens : itens.slice(0, ITENS_NA_BARRA)
  const emMais = cabemTodos ? [] : itens.slice(ITENS_NA_BARRA)
  const maisAtivo = emMais.some((item) => item.para === pathname)

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-borda bg-superficie/95 px-4 backdrop-blur md:hidden">
        <Marca />
        <div className="flex items-center">
          <BotaoDeTema />
          <BotaoDeIcone rotulo="Sair" aoClicar={aoSair}>
            <LogOut className="size-4" />
          </BotaoDeIcone>
        </div>
      </header>

      <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 md:hidden">
        <AnimatePresence>
          {maisAberto && (
            <motion.ul
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-full right-4 mb-2 w-56 rounded-2xl border border-borda bg-superficie p-1.5 shadow-flutuante"
            >
              {emMais.map(({ para, rotulo, icone: Icone }) => (
                <li key={para}>
                  <Link
                    to={para}
                    onClick={() => setMaisAberto(false)}
                    aria-current={pathname === para ? 'page' : undefined}
                    className={`flex h-11 items-center gap-3 rounded-xl px-3 font-medium ${
                      pathname === para ? 'bg-destaque text-sobre-destaque' : 'text-texto-suave'
                    }`}
                  >
                    <Icone className="size-[1.15rem]" /> {rotulo}
                  </Link>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>

        <nav
          aria-label="Principal"
          className="flex w-full max-w-md items-stretch gap-1 rounded-2xl border border-borda bg-superficie/95 p-1.5 shadow-flutuante backdrop-blur"
        >
          {naBarra.map(({ para, curto, icone: Icone }) => {
            const ativo = pathname === para
            return (
              <Link
                key={para}
                to={para}
                aria-current={ativo ? 'page' : undefined}
                className={`relative flex h-13 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[0.7rem] font-semibold ${
                  ativo ? 'text-sobre-destaque' : 'text-texto-suave'
                }`}
              >
                {ativo && (
                  <motion.span
                    layoutId="item-ativo-da-barra"
                    className="absolute inset-0 rounded-xl bg-destaque"
                    transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                  />
                )}
                <Icone className="relative size-5" />
                <span className="relative">{curto}</span>
              </Link>
            )
          })}
          {emMais.length > 0 && (
            <button
              type="button"
              aria-expanded={maisAberto}
              onClick={() => setMaisAberto(!maisAberto)}
              className={`flex h-13 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[0.7rem] font-semibold ${
                maisAtivo || maisAberto ? 'bg-superficie-2 text-texto' : 'text-texto-suave'
              }`}
            >
              <Ellipsis className="size-5" />
              Mais
            </button>
          )}
        </nav>
      </div>
    </>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  const { perfil, sair: encerrarSessao } = useSessao()
  const navegar = useNavigate()
  const { pathname } = useLocation()
  const itens = useItensPermitidos()
  if (!perfil) return null

  // Ao sair por vontade própria, o próximo login começa no painel, não na página que estava aberta.
  const sair = async () => {
    await encerrarSessao()
    navegar('/entrar', { replace: true })
  }

  return (
    <div className="min-h-dvh md:flex">
      <MenuLateral itens={itens} aoSair={() => void sair()} />
      <div className="min-w-0 flex-1">
        <BarraDoCelular itens={itens} aoSair={() => void sair()} />
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto w-full max-w-6xl px-4 pb-32 pt-6 md:px-10 md:pb-12 md:pt-10"
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}
