import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  api,
  definirAoPerderSessao,
  esquecerTokens,
  guardarTokens,
  renovarSessao,
  tokenDeRenovacaoGuardado,
} from './api'
import type { Papel, Usuario } from './tipos'

interface Perfil {
  usuario: Usuario
  papel: Papel
  permissoes: string[]
}

interface Sessao {
  estado: 'carregando' | 'anonimo' | 'autenticado'
  perfil: Perfil | null
  entrar: (email: string, senha: string) => Promise<void>
  sair: () => Promise<void>
  pode: (permissao: string) => boolean
}

const ContextoDeSessao = createContext<Sessao | null>(null)

/** Quem é o usuário (Identidade) e o que ele pode fazer (Autorização) vêm de duas chamadas separadas. */
async function carregarPerfil(): Promise<Perfil> {
  const [usuario, acesso] = await Promise.all([
    api.get<Usuario>('/auth/eu'),
    api.get<{ papel: Papel; permissoes: string[] }>('/autorizacao/eu'),
  ])
  return { usuario, ...acesso }
}

export function ProvedorDeSessao({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Sessao['estado']>('carregando')
  const [perfil, setPerfil] = useState<Perfil | null>(null)

  const encerrarLocalmente = useCallback(() => {
    esquecerTokens()
    setPerfil(null)
    setEstado('anonimo')
  }, [])

  useEffect(() => {
    let ativo = true
    definirAoPerderSessao(encerrarLocalmente)
    ;(async () => {
      try {
        if (!tokenDeRenovacaoGuardado() || !(await renovarSessao())) throw new Error('sem sessão')
        const carregado = await carregarPerfil()
        if (!ativo) return
        setPerfil(carregado)
        setEstado('autenticado')
      } catch {
        if (ativo) encerrarLocalmente()
      }
    })()
    return () => {
      ativo = false
    }
  }, [encerrarLocalmente])

  const entrar = useCallback(async (email: string, senha: string) => {
    guardarTokens(await api.post('/auth/entrar', { email, senha }))
    setPerfil(await carregarPerfil())
    setEstado('autenticado')
  }, [])

  const sair = useCallback(async () => {
    const tokenDeRenovacao = tokenDeRenovacaoGuardado()
    encerrarLocalmente()
    if (tokenDeRenovacao) await api.post('/auth/sair', { tokenDeRenovacao }).catch(() => undefined)
  }, [encerrarLocalmente])

  const valor = useMemo<Sessao>(
    () => ({
      estado,
      perfil,
      entrar,
      sair,
      pode: (permissao) => perfil?.permissoes.includes(permissao) ?? false,
    }),
    [estado, perfil, entrar, sair],
  )

  return <ContextoDeSessao.Provider value={valor}>{children}</ContextoDeSessao.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSessao(): Sessao {
  const sessao = useContext(ContextoDeSessao)
  if (!sessao) throw new Error('useSessao deve ser usado dentro de ProvedorDeSessao')
  return sessao
}
