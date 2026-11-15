import { CircleAlert, CircleCheck, Info, LoaderCircle } from 'lucide-react'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import { useId } from 'react'

type Tom = 'neutro' | 'sucesso' | 'perigo' | 'alerta' | 'destaque'

const TONS: Record<Tom, string> = {
  neutro: 'bg-superficie-2 text-texto-suave',
  sucesso: 'bg-sucesso-fundo text-sucesso',
  perigo: 'bg-perigo-fundo text-perigo',
  alerta: 'bg-alerta-fundo text-alerta',
  destaque: 'bg-destaque text-sobre-destaque',
}

export function Marca({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-black tracking-tight ${className}`}>
      <span className="grid size-8 place-items-center rounded-lg bg-destaque text-base text-sobre-destaque">A</span>
      <span className="text-xl uppercase">Atletix</span>
    </span>
  )
}

interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'perigo' | 'fantasma'
  tamanho?: 'normal' | 'pequeno' | 'grande'
  carregando?: boolean
}

const VARIANTES = {
  primario: 'bg-destaque text-sobre-destaque hover:bg-destaque-forte',
  secundario: 'border border-borda bg-superficie text-texto hover:bg-superficie-2',
  perigo: 'border border-perigo/40 text-perigo hover:bg-perigo-fundo',
  fantasma: 'text-texto-suave hover:bg-superficie-2 hover:text-texto',
}

const TAMANHOS = {
  pequeno: 'h-8 px-3 text-sm',
  normal: 'h-10 px-4 text-sm',
  grande: 'h-14 px-8 text-base',
}

export function Botao({
  variante = 'primario',
  tamanho = 'normal',
  carregando = false,
  className = '',
  children,
  disabled,
  ...resto
}: BotaoProps) {
  return (
    <button
      {...resto}
      disabled={disabled || carregando}
      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${VARIANTES[variante]} ${TAMANHOS[tamanho]} ${className}`}
    >
      {carregando && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
}

interface CampoProps extends InputHTMLAttributes<HTMLInputElement> {
  rotulo: string
  ajuda?: string
}

export function Campo({ rotulo, ajuda, className = '', ...resto }: CampoProps) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {rotulo}
      </label>
      <input
        id={id}
        {...resto}
        className="h-10 w-full rounded-lg border border-borda bg-superficie px-3 text-sm placeholder:text-texto-suave/70 focus:border-acento"
      />
      {ajuda && <p className="mt-1.5 text-xs text-texto-suave">{ajuda}</p>}
    </div>
  )
}

export function Cartao({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-borda bg-superficie p-5 ${className}`}>{children}</section>
}

export function Selo({ tom = 'neutro', children }: { tom?: Tom; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONS[tom]}`}>
      {children}
    </span>
  )
}

export function Aviso({ tom, children }: { tom: 'sucesso' | 'perigo' | 'alerta' | 'neutro'; children: ReactNode }) {
  const Icone = tom === 'sucesso' ? CircleCheck : tom === 'neutro' ? Info : CircleAlert
  return (
    <div role={tom === 'perigo' ? 'alert' : 'status'} className={`flex gap-2.5 rounded-lg p-3 text-sm ${TONS[tom]}`}>
      <Icone className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export function Carregando({ texto = 'Carregando…' }: { texto?: string }) {
  return (
    <div className="flex items-center gap-2 py-10 text-sm text-texto-suave" role="status">
      <LoaderCircle className="size-4 animate-spin" aria-hidden />
      {texto}
    </div>
  )
}

export function Vazio({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-dashed border-borda p-8 text-center text-sm text-texto-suave">{children}</p>
}

export function Cabecalho({ titulo, descricao, acoes }: { titulo: string; descricao?: string; acoes?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{titulo}</h1>
        {descricao && <p className="mt-1 text-sm text-texto-suave">{descricao}</p>}
      </div>
      {acoes && <div className="flex items-center gap-2">{acoes}</div>}
    </header>
  )
}

export function Avatar({ sigla }: { sigla: string }) {
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-superficie-2 text-xs font-bold text-texto-suave">
      {sigla}
    </span>
  )
}

/** Carrega dados e mostra os estados de carregando e de erro; só renderiza o conteúdo quando há dados. */
export function Conteudo<T>({
  dados,
  erro,
  carregando,
  children,
}: {
  dados: T | null
  erro: string | null
  carregando: boolean
  children: (dados: T) => ReactNode
}) {
  if (erro) return <Aviso tom="perigo">{erro}</Aviso>
  if (dados === null) return carregando ? <Carregando /> : null
  return <>{children(dados)}</>
}
