import { CircleAlert, CircleCheck } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

type Tom = 'sucesso' | 'perigo'

interface AvisoFlutuante {
  id: number
  tom: Tom
  texto: string
}

const ContextoDeAvisos = createContext<((tom: Tom, texto: string) => void) | null>(null)

const DURACAO_EM_MS = 4000

/** Avisos flutuantes: confirmam o resultado de uma ação e somem sozinhos. */
export function ProvedorDeAvisos({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<AvisoFlutuante[]>([])
  const proximoId = useRef(1)

  const avisar = useCallback((tom: Tom, texto: string) => {
    const id = proximoId.current++
    setAvisos((atuais) => [...atuais.slice(-2), { id, tom, texto }])
    setTimeout(() => setAvisos((atuais) => atuais.filter((aviso) => aviso.id !== id)), DURACAO_EM_MS)
  }, [])

  const valor = useMemo(() => avisar, [avisar])

  return (
    <ContextoDeAvisos.Provider value={valor}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 md:inset-x-auto md:bottom-6 md:right-6 md:items-end"
      >
        <AnimatePresence>
          {avisos.map((aviso) => {
            const Icone = aviso.tom === 'sucesso' ? CircleCheck : CircleAlert
            return (
              <motion.div
                key={aviso.id}
                layout
                role="status"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-controle border border-borda-tinta bg-tinta px-4 py-3 text-sm font-semibold text-sobre-tinta shadow-flutuante"
              >
                <Icone
                  className={`size-4 shrink-0 ${aviso.tom === 'sucesso' ? 'text-lima' : 'text-perigo-sobre-tinta'}`}
                  aria-hidden
                />
                {aviso.texto}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ContextoDeAvisos.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAvisar(): (tom: Tom, texto: string) => void {
  const avisar = useContext(ContextoDeAvisos)
  if (!avisar) throw new Error('useAvisar deve ser usado dentro de ProvedorDeAvisos')
  return avisar
}
