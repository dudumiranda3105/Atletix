/**
 * Tipos e nomes que espelham os contratos do backend. Os nomes das permissões e dos papéis
 * precisam ser idênticos aos de backend/src/modulos/<modulo>/contratos (conascência de nome
 * através da API): ficam todos neste arquivo para que uma mudança tenha um único lugar aqui.
 */
export type Papel = 'ADMIN' | 'RECEPCAO' | 'INSTRUTOR' | 'ALUNO'

export const PAPEIS: Papel[] = ['ADMIN', 'RECEPCAO', 'INSTRUTOR', 'ALUNO']

export const NOME_DO_PAPEL: Record<Papel, string> = {
  ADMIN: 'Administrador',
  RECEPCAO: 'Recepção',
  INSTRUTOR: 'Instrutor',
  ALUNO: 'Aluno',
}

export const Permissao = {
  USUARIOS_LISTAR: 'usuarios:listar',
  USUARIOS_ALTERAR_STATUS: 'usuarios:alterar-status',
  AUTORIZACAO_LISTAR: 'autorizacao:listar-atribuicoes',
  AUTORIZACAO_ALTERAR_PAPEL: 'autorizacao:alterar-papel',
  MATRICULAS_REGISTRAR: 'matriculas:registrar',
  MATRICULAS_CONSULTAR: 'matriculas:consultar',
  MATRICULAS_CONSULTAR_PROPRIA: 'matriculas:consultar-propria',
  CHECKIN_REGISTRAR: 'checkin:registrar-proprio',
  CHECKIN_LISTAR_PROPRIOS: 'checkin:listar-proprios',
  CHECKIN_LISTAR_DO_DIA: 'checkin:listar-do-dia',
  AUDITORIA_CONSULTAR: 'auditoria:consultar',
  NOTIFICACOES_CAIXA_DE_SAIDA: 'notificacoes:ver-caixa-de-saida',
} as const

export interface Usuario {
  id: string
  nome: string
  email: string
  ativo: boolean
}

export interface Atribuicao {
  usuarioId: string
  papel: Papel
}

export type Plano = 'MENSAL' | 'TRIMESTRAL' | 'ANUAL'

export const PLANOS: { valor: Plano; nome: string; duracao: string }[] = [
  { valor: 'MENSAL', nome: 'Mensal', duracao: '30 dias' },
  { valor: 'TRIMESTRAL', nome: 'Trimestral', duracao: '90 dias' },
  { valor: 'ANUAL', nome: 'Anual', duracao: '365 dias' },
]

export interface SituacaoDaMatricula {
  ativa: boolean
  plano: Plano | null
  validaAte: string | null
}

export interface Checkin {
  id: string
  registradoEm: string
}

export interface CheckinDoDia extends Checkin {
  alunoId: string
  nomeDoAluno: string
}

export interface RegistroDeAuditoria {
  id: string
  tipo: string
  usuarioId: string | null
  descricao: string
  ocorridoEm: string
}

export interface Mensagem {
  id: string
  destinatario: string
  assunto: string
  corpo: string
  criadaEm: string
}
