import { KeyRound, ScanLine, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { BotaoDeTema } from '../../compartilhado/Layout'
import { Marca } from '../../compartilhado/ui'

const DESTAQUES = [
  { icone: KeyRound, texto: 'Login seguro, com sessão que se renova sozinha' },
  { icone: ShieldCheck, texto: 'Cada perfil vê só o que precisa' },
  { icone: ScanLine, texto: 'Check-in liberado para quem está em dia' },
]

/**
 * Moldura das telas públicas (entrar, criar conta, recuperar e redefinir senha).
 * À esquerda, a tinta com a faixa em limão da marca; à direita, o formulário sobre o papel.
 */
export function TelaDeAcesso({ titulo, descricao, children }: { titulo: string; descricao: string; children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <div className="relative hidden overflow-hidden bg-tinta px-12 py-10 text-sobre-tinta lg:flex lg:flex-col">
        <div
          aria-hidden
          className="absolute -top-24 right-6 h-[130%] w-24 rotate-12 bg-lima"
          style={{ clipPath: 'polygon(35% 0, 100% 0, 65% 100%, 0 100%)' }}
        />
        <Marca className="relative" />

        <div className="relative my-auto pr-36">
          <h2 className="titulo text-[4.75rem] xl:text-[6rem]">
            A sua academia,
            <br />
            sob controle.
          </h2>
          <ul className="mt-10 max-w-[30rem] space-y-4 border-t border-borda-tinta pt-8">
            {DESTAQUES.map(({ icone: Icone, texto }) => (
              <li key={texto} className="flex items-center gap-3 text-[1.0625rem] text-sobre-tinta-suave">
                <Icone className="size-5 shrink-0 text-lima" aria-hidden />
                {texto}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative mt-10 text-sm text-sobre-tinta-suave">Gestão de academias com controle de autenticação</p>
      </div>

      <div className="flex flex-col px-6 py-6 sm:px-12">
        <div className="flex items-center justify-between">
          <Marca className="lg:invisible" />
          <BotaoDeTema />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="titulo text-[3rem]">{titulo}</h1>
          <p className="mt-3 text-texto-suave">{descricao}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
