import { CircleAlert, CircleCheck, Info, LoaderCircle, X } from 'lucide-react'
import { animate } from 'motion/react'
import type { ButtonHTMLAttributes, ComponentType, InputHTMLAttributes, ReactNode } from 'react'
import { useEffect, useId, useRef } from 'react'
import type { Papel } from './tipos'
import { NOME_DO_PAPEL } from './tipos'
import { iniciais } from './util'

type Tom = 'neutro' | 'sucesso' | 'perigo' | 'alerta' | 'destaque' | 'escuro' | 'contorno'

const TONS: Record<Tom, string> = {
  neutro: 'bg-superficie-2 text-texto-suave',
  sucesso: 'bg-sucesso-fundo text-sucesso',
  perigo: 'bg-perigo-fundo text-perigo',
  alerta: 'bg-alerta-fundo text-alerta',
  destaque: 'bg-destaque text-sobre-destaque',
  escuro: 'bg-texto text-fundo',
  contorno: 'border border-borda text-texto',
}

export function Marca({ compacta = false, className = '' }: { compacta?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="titulo grid size-9 shrink-0 place-items-center rounded-xl bg-destaque text-xl text-sobre-destaque">
        A
      </span>
      {!compacta && <span className="titulo text-2xl tracking-tight">Atletix</span>}
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
  grande: 'h-13 px-7 text-base',
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
      className={`inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-[background-color,transform,border-color] duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 disabled:active:scale-100 ${VARIANTES[variante]} ${TAMANHOS[tamanho]} ${className}`}
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
        className="h-11 w-full rounded-xl border border-borda bg-superficie px-3.5 text-[0.95rem] transition-colors placeholder:text-texto-suave/70 hover:border-texto-suave/50 focus:border-acento"
      />
      {ajuda && <p className="mt-1.5 text-xs text-texto-suave">{ajuda}</p>}
    </div>
  )
}

export function Cartao({
  children,
  className = '',
  escuro = false,
}: {
  children: ReactNode
  className?: string
  escuro?: boolean
}) {
  const fundo = escuro ? 'bg-tinta text-sobre-tinta border-transparent' : 'border-borda bg-superficie shadow-cartao'
  return <section className={`rounded-2xl border p-5 ${fundo} ${className}`}>{children}</section>
}

export function Selo({ tom = 'neutro', children }: { tom?: Tom; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONS[tom]}`}
    >
      {children}
    </span>
  )
}

const TOM_DO_PAPEL: Record<Papel, Tom> = {
  ADMIN: 'destaque',
  RECEPCAO: 'escuro',
  INSTRUTOR: 'contorno',
  ALUNO: 'neutro',
}

export function SeloDePapel({ papel }: { papel: Papel }) {
  return <Selo tom={TOM_DO_PAPEL[papel]}>{NOME_DO_PAPEL[papel]}</Selo>
}

export function Aviso({ tom, children }: { tom: 'sucesso' | 'perigo' | 'alerta' | 'neutro'; children: ReactNode }) {
  const Icone = tom === 'sucesso' ? CircleCheck : tom === 'neutro' ? Info : CircleAlert
  return (
    <div role={tom === 'perigo' ? 'alert' : 'status'} className={`flex gap-2.5 rounded-xl p-3 text-sm ${TONS[tom]}`}>
      <Icone className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0">{children}</div>
    </div>
  )
}

/** Bloco que ocupa o lugar do conteúdo enquanto ele carrega. */
export function Esqueleto({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-brilho rounded-xl bg-[linear-gradient(100deg,var(--color-superficie-2)_40%,var(--color-borda)_50%,var(--color-superficie-2)_60%)] bg-[length:200%_100%] ${className}`}
    />
  )
}

export function EsqueletoDeLista({ linhas = 5 }: { linhas?: number }) {
  return (
    <div role="status" aria-label="Carregando" className="space-y-3">
      {Array.from({ length: linhas }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Esqueleto className="size-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Esqueleto className="h-3.5 w-2/5" />
            <Esqueleto className="h-3 w-3/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function Carregando({ texto = 'Carregando' }: { texto?: string }) {
  return (
    <div className="flex items-center gap-2 py-10 text-sm text-texto-suave" role="status">
      <LoaderCircle className="size-4 animate-spin" aria-hidden />
      {texto}
    </div>
  )
}

export function Vazio({
  icone: Icone,
  titulo,
  children,
  acao,
}: {
  icone?: ComponentType<{ className?: string }>
  titulo: string
  children?: ReactNode
  acao?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-borda px-6 py-12 text-center">
      {Icone && (
        <span className="mb-4 grid size-12 place-items-center rounded-xl bg-superficie-2 text-texto-suave">
          <Icone className="size-5" />
        </span>
      )}
      <p className="font-semibold">{titulo}</p>
      {children && <p className="mt-1 max-w-sm text-sm text-texto-suave">{children}</p>}
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  )
}

export function Cabecalho({ titulo, descricao, acoes }: { titulo: string; descricao?: string; acoes?: ReactNode }) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="titulo text-4xl md:text-5xl">{titulo}</h1>
        {descricao && <p className="mt-2 text-texto-suave">{descricao}</p>}
      </div>
      {acoes && <div className="flex items-center gap-2">{acoes}</div>}
    </header>
  )
}

const CORES_DE_AVATAR = [
  'bg-[#dcefa3] text-[#33470a]',
  'bg-[#cfe6d8] text-[#1c4733]',
  'bg-[#ecdfc0] text-[#59420f]',
  'bg-[#d6deea] text-[#293b54]',
  'bg-[#ecd6cc] text-[#672d1b]',
]

/** Iniciais em um círculo. A cor depende do nome, então a mesma pessoa tem sempre a mesma cor. */
export function Avatar({ nome, grande = false }: { nome: string; grande?: boolean }) {
  const indice = [...nome].reduce((soma, letra) => (soma * 31 + letra.charCodeAt(0)) % 9973, 7) % CORES_DE_AVATAR.length
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-full font-bold ${CORES_DE_AVATAR[indice]} ${
        grande ? 'size-12 text-base' : 'size-10 text-sm'
      }`}
    >
      {iniciais(nome)}
    </span>
  )
}

/** Mostra o esqueleto enquanto carrega, o erro se falhar e o conteúdo quando há dados. */
export function Conteudo<T>({
  dados,
  erro,
  carregando,
  esqueleto,
  children,
}: {
  dados: T | null
  erro: string | null
  carregando: boolean
  esqueleto?: ReactNode
  children: (dados: T) => ReactNode
}) {
  if (erro) return <Aviso tom="perigo">{erro}</Aviso>
  if (dados === null) return carregando ? <>{esqueleto ?? <EsqueletoDeLista />}</> : null
  return <>{children(dados)}</>
}

/** Número que conta de zero até o valor quando aparece. Não passa pelo estado do React. */
export function Contador({ valor }: { valor: number }) {
  const elemento = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const animacao = animate(0, valor, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (atual) => {
        if (elemento.current) elemento.current.textContent = String(Math.round(atual))
      },
    })
    return () => animacao.stop()
  }, [valor])
  return <span ref={elemento}>{valor}</span>
}

/** Filtro de escolha única, em forma de pílulas. */
export function Segmentos<T extends string>({
  rotulo,
  opcoes,
  valor,
  aoMudar,
}: {
  rotulo: string
  opcoes: { valor: T; nome: string }[]
  valor: T
  aoMudar: (valor: T) => void
}) {
  return (
    <div role="group" aria-label={rotulo} className="flex flex-wrap gap-1.5">
      {opcoes.map((opcao) => (
        <button
          key={opcao.valor}
          type="button"
          aria-pressed={opcao.valor === valor}
          onClick={() => aoMudar(opcao.valor)}
          className={`h-8 rounded-full px-3.5 text-sm font-medium transition-colors ${
            opcao.valor === valor
              ? 'bg-texto text-fundo'
              : 'bg-superficie-2 text-texto-suave hover:text-texto'
          }`}
        >
          {opcao.nome}
        </button>
      ))}
    </div>
  )
}

/** Janela modal baseada no elemento dialog do navegador (foco e tecla Esc já tratados). */
export function Dialogo({
  aberto,
  aoFechar,
  titulo,
  descricao,
  children,
}: {
  aberto: boolean
  aoFechar: () => void
  titulo: string
  descricao?: string
  children: ReactNode
}) {
  const janela = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const elemento = janela.current
    if (!elemento) return
    if (aberto && !elemento.open) elemento.showModal()
    if (!aberto && elemento.open) elemento.close()
  }, [aberto])

  return (
    <dialog
      ref={janela}
      onClose={aoFechar}
      onClick={(evento) => evento.target === janela.current && aoFechar()}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-2xl border border-borda bg-superficie p-0 text-texto shadow-flutuante"
    >
      {aberto && (
        <div className="p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="titulo text-2xl">{titulo}</h2>
              {descricao && <p className="mt-1.5 text-sm text-texto-suave">{descricao}</p>}
            </div>
            <button
              type="button"
              onClick={aoFechar}
              aria-label="Fechar"
              className="grid size-8 shrink-0 place-items-center rounded-lg text-texto-suave hover:bg-superficie-2 hover:text-texto"
            >
              <X className="size-4" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}
