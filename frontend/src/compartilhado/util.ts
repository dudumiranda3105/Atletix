import { useCallback, useEffect, useState } from 'react'
import { mensagemDoErro } from './api'

const DATA_E_HORA = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
const SO_DATA = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' })
const SO_HORA = new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' })

export const formatarDataEHora = (iso: string) => DATA_E_HORA.format(new Date(iso))
export const formatarData = (iso: string) => SO_DATA.format(new Date(iso))
export const formatarHora = (iso: string) => SO_HORA.format(new Date(iso))

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/)
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? (partes.at(-1)?.[0] ?? '') : '')).toUpperCase()
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
