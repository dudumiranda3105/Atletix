import { KeyRound, ScanLine, ShieldCheck } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { BotaoDeTema } from '../../compartilhado/Layout'
import { Marca } from '../../compartilhado/ui'

const DESTAQUES = [
  { icone: KeyRound, texto: 'Login seguro, com sessão que se renova sozinha' },
  { icone: ShieldCheck, texto: 'Cada perfil vê só o que precisa' },
  { icone: ScanLine, texto: 'Check-in liberado para quem está em dia' },
]

const SUAVE = [0.16, 1, 0.3, 1] as const

/** Moldura das telas públicas (entrar, criar conta, recuperar e redefinir senha). */
export function TelaDeAcesso({ titulo, descricao, children }: { titulo: string; descricao: string; children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden bg-[#0b0d08] p-12 text-[#eef2e6] lg:flex lg:flex-col lg:justify-between">
        <motion.div
          aria-hidden
          initial={{ x: 140, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease: SUAVE }}
          className="absolute -right-24 -top-24 h-[130%] w-56 rotate-12 bg-[#c6f432]"
          style={{ clipPath: 'polygon(35% 0, 100% 0, 65% 100%, 0 100%)' }}
        />
        <span className="relative inline-flex items-center gap-2.5">
          <span className="titulo grid size-10 place-items-center rounded-xl bg-[#c6f432] text-2xl text-[#10130a]">A</span>
          <span className="titulo text-3xl">Atletix</span>
        </span>
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: SUAVE }}
          className="relative max-w-lg"
        >
          <h2 className="titulo text-7xl xl:text-8xl">
            A sua academia, <span className="text-[#c6f432]">sob controle.</span>
          </h2>
          <ul className="mt-10 space-y-4">
            {DESTAQUES.map(({ icone: Icone, texto }) => (
              <li key={texto} className="flex items-center gap-3 text-lg text-[#c5ccb8]">
                <Icone className="size-5 text-[#c6f432]" aria-hidden />
                {texto}
              </li>
            ))}
          </ul>
        </motion.div>
        <p className="relative text-sm text-[#98a08c]">Gestão de academias com controle de autenticação</p>
      </div>

      <div className="flex flex-col px-6 py-6 sm:px-12">
        <div className="flex items-center justify-between">
          <Marca className="lg:invisible" />
          <BotaoDeTema />
        </div>
        <motion.div
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: SUAVE }}
          className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10"
        >
          <h1 className="titulo text-5xl">{titulo}</h1>
          <p className="mt-3 text-texto-suave">{descricao}</p>
          <div className="mt-8">{children}</div>
        </motion.div>
      </div>
    </div>
  )
}
