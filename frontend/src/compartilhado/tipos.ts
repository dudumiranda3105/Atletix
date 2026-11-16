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

/** Nome legível de cada permissão, para mostrar ao usuário o que o perfil dele permite. */
export const NOME_DA_PERMISSAO: Record<string, string> = {
  [Permissao.USUARIOS_LISTAR]: 'Ver a lista de usuários',
  [Permissao.USUARIOS_ALTERAR_STATUS]: 'Ativar e desativar contas',
  [Permissao.AUTORIZACAO_LISTAR]: 'Ver o perfil de cada usuário',
  [Permissao.AUTORIZACAO_ALTERAR_PAPEL]: 'Alterar o perfil de um usuário',
  [Permissao.MATRICULAS_REGISTRAR]: 'Registrar e renovar matrículas',
  [Permissao.MATRICULAS_CONSULTAR]: 'Consultar a matrícula de qualquer aluno',
  [Permissao.MATRICULAS_CONSULTAR_PROPRIA]: 'Consultar a própria matrícula',
  [Permissao.CHECKIN_REGISTRAR]: 'Fazer check-in',
  [Permissao.CHECKIN_LISTAR_PROPRIOS]: 'Ver os próprios check-ins',
  [Permissao.CHECKIN_LISTAR_DO_DIA]: 'Ver os check-ins do dia',
  [Permissao.AUDITORIA_CONSULTAR]: 'Consultar a auditoria',
  [Permissao.NOTIFICACOES_CAIXA_DE_SAIDA]: 'Ver os e-mails enviados',
}
