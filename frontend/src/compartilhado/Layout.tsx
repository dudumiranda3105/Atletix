import {
  CalendarCheck,
  IdCard,
  LayoutDashboard,
  LogOut,
  Mail,
  Moon,
  ScanLine,
  ShieldCheck,
  Sun,
  UserRound,
  Users,
} from 'lucide-react'
import type { ComponentType, ReactNode } from 'react'
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useSessao } from './sessao'
import { NOME_DO_PAPEL, Permissao } from './tipos'
import { Avatar, Marca } from './ui'
import { iniciais } from './util'

interface Item {
  para: string
  rotulo: string
  icone: ComponentType<{ className?: string }>
  permissao?: string
}

/** Cada item só aparece para quem tem a permissão; o backend confere de novo em toda requisição. */
const ITENS: Item[] = [
  { para: '/painel', rotulo: 'Painel', icone: LayoutDashboard },
  { para: '/checkin', rotulo: 'Check-in', icone: ScanLine, permissao: Permissao.CHECKIN_REGISTRAR },
  { para: '/usuarios', rotulo: 'Usuários', icone: Users, permissao: Permissao.USUARIOS_LISTAR },
  { para: '/matriculas', rotulo: 'Matrículas', icone: IdCard, permissao: Permissao.MATRICULAS_CONSULTAR },
  {
    para: '/checkins-de-hoje',
    rotulo: 'Check-ins de hoje',
    icone: CalendarCheck,
    permissao: Permissao.CHECKIN_LISTAR_DO_DIA,
  },
  { para: '/auditoria', rotulo: 'Auditoria', icone: ShieldCheck, permissao: Permissao.AUDITORIA_CONSULTAR },
  { para: '/caixa-de-saida', rotulo: 'Caixa de saída', icone: Mail, permissao: Permissao.NOTIFICACOES_CAIXA_DE_SAIDA },
  { para: '/conta', rotulo: 'Minha conta', icone: UserRound },
]

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
      className={`grid size-9 place-items-center rounded-lg text-texto-suave hover:bg-superficie-2 hover:text-texto ${className}`}
    >
      <Icone className="size-4" />
    </button>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  const { perfil, sair: encerrarSessao } = useSessao()
  const navegar = useNavigate()
  const itens = useItensPermitidos()
  if (!perfil) return null

  // Ao sair por vontade própria, o próximo login começa no painel, não na página que estava aberta.
  const sair = async () => {
    await encerrarSessao()
    navegar('/entrar', { replace: true })
  }

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[15.5rem_1fr]">
      <aside className="border-borda bg-superficie md:sticky md:top-0 md:flex md:h-dvh md:flex-col md:border-r">
        <div className="flex items-center justify-between px-4 py-4">
          <Marca />
          <BotaoDeTema />
        </div>

        <nav
          aria-label="Principal"
          className="flex gap-1 overflow-x-auto border-b border-borda px-3 pb-3 md:flex-1 md:flex-col md:overflow-visible md:border-0 md:pb-0"
        >
          {itens.map(({ para, rotulo, icone: Icone }) => (
            <NavLink
              key={para}
              to={para}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-destaque text-sobre-destaque'
                    : 'text-texto-suave hover:bg-superficie-2 hover:text-texto'
                }`
              }
            >
              <Icone className="size-4" />
              {rotulo}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 border-t border-borda p-3 md:flex">
          <Avatar sigla={iniciais(perfil.usuario.nome)} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{perfil.usuario.nome}</p>
            <p className="text-xs text-texto-suave">{NOME_DO_PAPEL[perfil.papel]}</p>
          </div>
          <button
            type="button"
            onClick={() => void sair()}
            aria-label="Sair"
            title="Sair"
            className="grid size-9 place-items-center rounded-lg text-texto-suave hover:bg-superficie-2 hover:text-texto"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">
        {children}
        <button
          type="button"
          onClick={() => void sair()}
          className="mt-10 flex items-center gap-2 text-sm text-texto-suave hover:text-texto md:hidden"
        >
          <LogOut className="size-4" /> Sair da conta
        </button>
      </main>
    </div>
  )
}
