import { CircleAlert, CircleCheck, Info, LoaderCircle, Search, X } from 'lucide-react'
import type { ButtonHTMLAttributes, ComponentType, InputHTMLAttributes, ReactNode } from 'react'
import { useEffect, useId, useRef } from 'react'
import type { Papel } from './tipos'
import { NOME_DO_PAPEL } from './tipos'
import { iniciais } from './util'

type Tom = 'neutro' | 'sucesso' | 'perigo' | 'alerta' | 'destaque' | 'escuro' | 'contorno'

const TONS: Record<Tom, string> = {
  neutro: 'bg-superficie-3 text-texto-suave',
  sucesso: 'bg-sucesso-fundo text-sucesso',
  perigo: 'bg-perigo-fundo text-perigo',
  alerta: 'bg-alerta-fundo text-alerta',
  destaque: 'bg-destaque text-sobre-destaque',
  escuro: 'bg-texto text-fundo',
  contorno: 'border border-borda-campo text-texto',
}

/** O haltere do ícone do site, desenhado com a cor do texto em volta. */
function Haltere({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <g fill="currentColor" transform="rotate(-32 16 16)">
        <rect x="11" y="14.25" width="10" height="3.5" />
        <rect x="4.5" y="12" width="5" height="8" rx="1.5" />
        <rect x="22.5" y="12" width="5" height="8" rx="1.5" />
        <rect x="8" y="8.5" width="4.5" height="15" rx="1.5" />
        <rect x="19.5" y="8.5" width="4.5" height="15" rx="1.5" />
      </g>
    </svg>
  )
}

export function Marca({ compacta = false, className = '' }: { compacta?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="grid size-9 shrink-0 place-items-center rounded-controle bg-destaque text-sobre-destaque">
        <Haltere className="size-7" />
      </span>
      {!compacta && <span className="titulo text-2xl">Atletix</span>}
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
  secundario: 'border border-borda-campo bg-superficie text-texto hover:bg-superficie-2',
  perigo: 'border border-perigo/50 bg-superficie text-perigo hover:bg-perigo-fundo',
  fantasma: 'text-texto-suave hover:bg-superficie-2 hover:text-texto',
}

const TAMANHOS = {
  pequeno: 'h-8 px-3 text-sm',
  normal: 'h-10 px-4 text-[0.9375rem]',
  grande: 'h-12 px-6 text-base',
}

export function Botao({
  variante = 'primario',
  tamanho = 'normal',
  carregando = false,
  className = '',
  children,
  disabled,
  type = 'button',
  ...resto
}: BotaoProps) {
  return (
    <button
      {...resto}
      type={type}
      disabled={disabled || carregando}
      className={`inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-controle font-semibold transition-[background-color,border-color,transform] duration-[120ms] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 disabled:active:scale-100 ${VARIANTES[variante]} ${TAMANHOS[tamanho]} ${className}`}
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
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {rotulo}
      </label>
      <input
        id={id}
        {...resto}
        className="h-10 w-full rounded-controle border border-borda-campo bg-superficie px-3 text-base transition-colors duration-[120ms] placeholder:text-texto-suave hover:border-texto-suave disabled:cursor-not-allowed disabled:opacity-55"
      />
      {ajuda && <p className="mt-1.5 text-sm text-texto-suave">{ajuda}</p>}
    </div>
  )
}

/**
 * Painel de conteúdo. O padrão é um poço tingido sobre o papel, sem borda.
 * `escuro` é o bloco de tinta, reservado ao objeto principal da tela.
 */
export function Cartao({
  children,
  className = '',
  escuro = false,
}: {
  children: ReactNode
  className?: string
  escuro?: boolean
}) {
  const fundo = escuro ? 'bg-tinta text-sobre-tinta' : 'bg-superficie-2'
  return <section className={`rounded-painel p-6 ${fundo} ${className}`}>{children}</section>
}

export function Selo({ tom = 'neutro', children }: { tom?: Tom; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[0.8125rem] font-semibold ${TONS[tom]}`}
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
    <div
      role={tom === 'perigo' ? 'alert' : 'status'}
      className={`flex gap-2.5 rounded-controle px-3.5 py-3 text-sm ${TONS[tom]}`}
    >
      <Icone className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0">{children}</div>
    </div>
  )
}

/** Bloco que ocupa o lugar do conteúdo enquanto ele carrega. `naTinta` para os blocos escuros. */
export function Esqueleto({ className = '', naTinta = false }: { className?: string; naTinta?: boolean }) {
  const brilho = naTinta
    ? 'bg-[linear-gradient(100deg,var(--color-tinta-2)_40%,var(--color-borda-tinta)_50%,var(--color-tinta-2)_60%)]'
    : 'bg-[linear-gradient(100deg,var(--color-superficie-3)_40%,var(--color-borda)_50%,var(--color-superficie-3)_60%)]'
  return <div aria-hidden className={`animate-brilho rounded-controle bg-[length:200%_100%] ${brilho} ${className}`} />
}

export function EsqueletoDeLista({ linhas = 5 }: { linhas?: number }) {
  return (
    <div role="status" aria-label="Carregando" className="divide-y divide-borda">
      {Array.from({ length: linhas }, (_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <Esqueleto className="size-9 shrink-0 rounded-full" />
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

/** O que está vazio, por que importa e, quando houver, a ação que preenche. */
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
    <div className="rounded-painel border border-dashed border-borda-campo/60 px-6 py-8">
      <p className="flex items-center gap-2.5 font-semibold">
        {Icone && <Icone className="size-5 shrink-0 text-texto-suave" />}
        {titulo}
      </p>
      {children && <p className="mt-1.5 max-w-[52ch] text-texto-suave">{children}</p>}
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  )
}

export function Cabecalho({ titulo, descricao, acoes }: { titulo: string; descricao?: string; acoes?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-borda pb-6">
      <div className="min-w-0">
        <h1 className="titulo text-[2rem] md:text-[length:var(--text-display)]">{titulo}</h1>
        {descricao && <p className="mt-2 text-texto-suave">{descricao}</p>}
      </div>
      {acoes && <div className="flex items-center gap-2">{acoes}</div>}
    </header>
  )
}

const CORES_DE_AVATAR = [
  'bg-avatar-1 text-avatar-1-texto',
  'bg-avatar-2 text-avatar-2-texto',
  'bg-avatar-3 text-avatar-3-texto',
  'bg-avatar-4 text-avatar-4-texto',
  'bg-avatar-5 text-avatar-5-texto',
]

/** Iniciais em um círculo. A cor depende do nome, então a mesma pessoa tem sempre a mesma cor. */
export function Avatar({ nome, grande = false }: { nome: string; grande?: boolean }) {
  const indice = [...nome].reduce((soma, letra) => (soma * 31 + letra.charCodeAt(0)) % 9973, 7) % CORES_DE_AVATAR.length
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-full font-semibold ${CORES_DE_AVATAR[indice]} ${
        grande ? 'size-12 text-base' : 'size-9 text-sm'
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

/** Um número da tela. Aparece já com o valor final: movimento aqui só marca mudança de estado. */
export function Contador({ valor }: { valor: number }) {
  return <span>{valor}</span>
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
          className={`h-9 rounded-full px-3.5 text-sm font-semibold transition-colors duration-[120ms] active:scale-[0.98] ${
            opcao.valor === valor
              ? 'bg-texto text-fundo'
              : 'bg-superficie-2 text-texto-suave hover:bg-superficie-3 hover:text-texto'
          }`}
        >
          {opcao.nome}
        </button>
      ))}
    </div>
  )
}

/** Campo de busca com a lupa dentro. */
export function CampoDeBusca({
  rotulo,
  valor,
  aoMudar,
  className = '',
}: {
  rotulo: string
  valor: string
  aoMudar: (valor: string) => void
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-texto-suave" />
      <input
        type="search"
        aria-label={rotulo}
        placeholder={rotulo}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        className="h-10 w-full rounded-controle border border-borda-campo bg-superficie pl-10 pr-3 text-base placeholder:text-texto-suave hover:border-texto-suave"
      />
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
      className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-painel border border-borda bg-superficie p-0 text-texto shadow-flutuante"
    >
      {aberto && (
        <div className="p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="titulo text-[1.75rem]">{titulo}</h2>
              {descricao && <p className="mt-2 text-texto-suave">{descricao}</p>}
            </div>
            <button
              type="button"
              onClick={aoFechar}
              aria-label="Fechar"
              className="grid size-9 shrink-0 place-items-center rounded-controle text-texto-suave transition-colors duration-[120ms] hover:bg-superficie-2 hover:text-texto"
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
