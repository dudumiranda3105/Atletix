import { KeyRound, ScanLine, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { BotaoDeTema } from '../../compartilhado/Layout'
import { Marca } from '../../compartilhado/ui'

const DESTAQUES = [
  { icone: KeyRound, texto: 'Login seguro, com sessão que se renova sozinha' },
  { icone: ShieldCheck, texto: 'Cada perfil vê só o que precisa' },
  { icone: ScanLine, texto: 'Check-in liberado para quem está em dia' },
]

/** Moldura das telas públicas (entrar, criar conta, recuperar e redefinir senha). */
export function TelaDeAcesso({ titulo, descricao, children }: { titulo: string; descricao: string; children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden bg-[#0c0e09] p-12 text-[#f0f3e8] lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="absolute -right-24 -top-24 h-[130%] w-56 rotate-12 bg-[#c6f432]"
          style={{ clipPath: 'polygon(35% 0, 100% 0, 65% 100%, 0 100%)' }}
        />
        <span className="relative inline-flex items-center gap-2 font-black">
          <span className="grid size-9 place-items-center rounded-lg bg-[#c6f432] text-lg text-[#10130a]">A</span>
          <span className="text-2xl uppercase tracking-tight">Atletix</span>
        </span>
        <div className="relative max-w-md">
          <h2 className="text-5xl font-black uppercase leading-[0.95] tracking-tight">
            A sua academia, <span className="text-[#c6f432]">sob controle.</span>
          </h2>
          <ul className="mt-10 space-y-4">
            {DESTAQUES.map(({ icone: Icone, texto }) => (
              <li key={texto} className="flex items-center gap-3 text-[#c9cfbd]">
                <Icone className="size-5 text-[#c6f432]" aria-hidden />
                {texto}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-[#9aa28e]">Gestão de academias · Controle de autenticação</p>
      </div>

      <div className="flex flex-col px-6 py-6 sm:px-12">
        <div className="flex items-center justify-between">
          <Marca className="lg:invisible" />
          <BotaoDeTema />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-3xl font-bold tracking-tight">{titulo}</h1>
          <p className="mt-2 text-sm text-texto-suave">{descricao}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
