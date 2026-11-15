/**
 * Cliente HTTP único do frontend.
 *
 * - O token de acesso fica só em memória; o token de renovação fica no localStorage.
 * - Quando a API responde 401, o cliente renova a sessão uma vez e repete a chamada.
 * - Erros chegam como ErroDaApi, com o mesmo { status, codigo, mensagem } do backend.
 */
const BASE = import.meta.env.VITE_URL_DA_API ?? '/api'
const CHAVE_DE_RENOVACAO = 'atletix.tokenDeRenovacao'

export class ErroDaApi extends Error {
  status: number
  codigo: string

  constructor(status: number, codigo: string, mensagem: string) {
    super(mensagem)
    this.status = status
    this.codigo = codigo
  }
}

interface Tokens {
  tokenDeAcesso: string
  tokenDeRenovacao: string
}

let tokenDeAcesso: string | null = null
let renovacaoEmAndamento: Promise<boolean> | null = null
let aoPerderSessao: () => void = () => {}

export function definirAoPerderSessao(funcao: () => void): void {
  aoPerderSessao = funcao
}

export function guardarTokens(tokens: Tokens): void {
  tokenDeAcesso = tokens.tokenDeAcesso
  localStorage.setItem(CHAVE_DE_RENOVACAO, tokens.tokenDeRenovacao)
}

export function esquecerTokens(): void {
  tokenDeAcesso = null
  localStorage.removeItem(CHAVE_DE_RENOVACAO)
}

export function tokenDeRenovacaoGuardado(): string | null {
  return localStorage.getItem(CHAVE_DE_RENOVACAO)
}

async function requisitar(metodo: string, caminho: string, corpo?: unknown): Promise<Response> {
  const cabecalhos: Record<string, string> = {}
  if (corpo !== undefined) cabecalhos['Content-Type'] = 'application/json'
  if (tokenDeAcesso) cabecalhos.Authorization = `Bearer ${tokenDeAcesso}`
  try {
    return await fetch(BASE + caminho, {
      method: metodo,
      headers: cabecalhos,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    })
  } catch {
    throw new ErroDaApi(0, 'SEM_CONEXAO', 'Não foi possível conectar ao servidor. Verifique se a API está rodando.')
  }
}

/**
 * Troca o token de renovação por um novo par. Chamadas simultâneas compartilham a mesma
 * requisição: como o backend invalida o token usado, renovar duas vezes derrubaria a sessão.
 */
export function renovarSessao(): Promise<boolean> {
  renovacaoEmAndamento ??= (async () => {
    const tokenDeRenovacao = tokenDeRenovacaoGuardado()
    if (!tokenDeRenovacao) return false
    try {
      const resposta = await requisitar('POST', '/auth/renovar', { tokenDeRenovacao })
      if (!resposta.ok) {
        esquecerTokens()
        return false
      }
      guardarTokens((await resposta.json()) as Tokens)
      return true
    } catch {
      return false
    }
  })().finally(() => {
    renovacaoEmAndamento = null
  })
  return renovacaoEmAndamento
}

async function chamar<T>(metodo: string, caminho: string, corpo?: unknown): Promise<T> {
  let resposta = await requisitar(metodo, caminho, corpo)

  if (resposta.status === 401 && tokenDeAcesso) {
    if (await renovarSessao()) {
      resposta = await requisitar(metodo, caminho, corpo)
    } else {
      aoPerderSessao()
    }
  }

  if (!resposta.ok) {
    const erro = (await resposta.json().catch(() => null)) as { codigo?: string; mensagem?: string } | null
    throw new ErroDaApi(resposta.status, erro?.codigo ?? 'ERRO', erro?.mensagem ?? 'Algo deu errado. Tente novamente.')
  }

  const texto = await resposta.text()
  return (texto ? JSON.parse(texto) : undefined) as T
}

export const api = {
  get: <T>(caminho: string) => chamar<T>('GET', caminho),
  post: <T>(caminho: string, corpo?: unknown) => chamar<T>('POST', caminho, corpo ?? {}),
  put: <T>(caminho: string, corpo: unknown) => chamar<T>('PUT', caminho, corpo),
  patch: <T>(caminho: string, corpo: unknown) => chamar<T>('PATCH', caminho, corpo),
}

export function mensagemDoErro(erro: unknown): string {
  return erro instanceof Error ? erro.message : 'Algo deu errado. Tente novamente.'
}
