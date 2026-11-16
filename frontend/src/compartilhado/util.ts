import { useCallback, useEffect, useState } from 'react'
import { mensagemDoErro } from './api'

const DATA_E_HORA = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
const SO_DATA = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' })
const SO_HORA = new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' })
const DIA_E_MES = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' })
const DIA_DA_SEMANA = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

export const formatarDataEHora = (iso: string) => DATA_E_HORA.format(new Date(iso))
export const formatarData = (iso: string | Date) => SO_DATA.format(new Date(iso))
export const formatarHora = (iso: string) => SO_HORA.format(new Date(iso))
export const formatarDiaEMes = (data: Date) => DIA_E_MES.format(data)
export const formatarDiaDaSemana = (data: Date) => DIA_DA_SEMANA.format(data)

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/)
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? (partes.at(-1)?.[0] ?? '') : '')).toUpperCase()
}

/** Chave "AAAA-MM-DD" no horário local, usada para agrupar registros por dia. */
export function chaveDoDia(data: Date | string): string {
  const d = new Date(data)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function diasAtras(quantidade: number, aPartirDe = new Date()): Date {
  return new Date(aPartirDe.getFullYear(), aPartirDe.getMonth(), aPartirDe.getDate() - quantidade)
}

export function inicioDoMes(): Date {
  const hoje = new Date()
  return new Date(hoje.getFullYear(), hoje.getMonth(), 1)
}

/** "Hoje", "Ontem" ou a data por extenso. */
export function nomeDoDia(chave: string): string {
  if (chave === chaveDoDia(new Date())) return 'Hoje'
  if (chave === chaveDoDia(diasAtras(1))) return 'Ontem'
  const [ano, mes, dia] = chave.split('-').map(Number)
  return formatarDiaDaSemana(new Date(ano, mes - 1, dia))
}

/**
 * Sequência de dias seguidos com treino. A atual conta a partir de hoje
 * (ou de ontem, se o treino de hoje ainda não aconteceu).
 */
export function calcularSequencias(dias: Set<string>): { atual: number; maior: number } {
  let atual = 0
  let cursor = dias.has(chaveDoDia(new Date())) ? 0 : 1
  while (dias.has(chaveDoDia(diasAtras(cursor)))) {
    atual += 1
    cursor += 1
  }

  let maior = 0
  for (const chave of dias) {
    const [ano, mes, dia] = chave.split('-').map(Number)
    const anterior = chaveDoDia(new Date(ano, mes - 1, dia - 1))
    if (dias.has(anterior)) continue // só começa a contar no primeiro dia de cada sequência
    let tamanho = 1
    while (dias.has(chaveDoDia(new Date(ano, mes - 1, dia + tamanho)))) tamanho += 1
    maior = Math.max(maior, tamanho)
  }
  return { atual, maior }
}

interface Dados<T> {
  dados: T | null
  erro: string | null
  carregando: boolean
  recarregar: () => void
}

/** Busca dados ao montar a tela e sempre que "recarregar" for chamado. */
export function useDados<T>(buscar: () => Promise<T>, dependencias: unknown[] = []): Dados<T> {
  const [dados, setDados] = useState<T | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [versao, setVersao] = useState(0)

  useEffect(() => {
    let ativo = true
    setCarregando(true)
    buscar()
      .then((resultado) => {
        if (!ativo) return
        setDados(resultado)
        setErro(null)
      })
      .catch((falha) => ativo && setErro(mensagemDoErro(falha)))
      .finally(() => ativo && setCarregando(false))
    return () => {
      ativo = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versao, ...dependencias])

  const recarregar = useCallback(() => setVersao((v) => v + 1), [])
  return { dados, erro, carregando, recarregar }
}
