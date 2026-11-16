import {
  CircleX,
  IdCard,
  KeyRound,
  LockKeyhole,
  LogIn,
  LogOut,
  MailQuestion,
  ScanLine,
  ShieldAlert,
  UserCheck,
  UserCog,
  UserMinus,
  UserPlus,
} from 'lucide-react'
import type { ComponentType } from 'react'
import type { RegistroDeAuditoria } from '../../compartilhado/tipos'

export type Categoria = 'acesso' | 'senhas' | 'contas' | 'academia'
type Tom = 'neutro' | 'sucesso' | 'perigo' | 'alerta'

interface Evento {
  rotulo: string
  tom: Tom
  categoria: Categoria
  icone: ComponentType<{ className?: string }>
}

/** Como cada tipo de evento do backend aparece na interface. Tipos novos caem no padrão abaixo. */
const EVENTOS: Record<string, Evento> = {
  'usuarios.usuario-cadastrado': { rotulo: 'Conta criada', tom: 'neutro', categoria: 'contas', icone: UserPlus },
  'usuarios.usuario-desativado': { rotulo: 'Conta desativada', tom: 'perigo', categoria: 'contas', icone: UserMinus },
  'usuarios.usuario-reativado': { rotulo: 'Conta reativada', tom: 'sucesso', categoria: 'contas', icone: UserCheck },
  'autorizacao.papel-alterado': { rotulo: 'Perfil alterado', tom: 'alerta', categoria: 'contas', icone: UserCog },
  'identidade.login-realizado': { rotulo: 'Login', tom: 'sucesso', categoria: 'acesso', icone: LogIn },
  'identidade.login-falhou': { rotulo: 'Login sem sucesso', tom: 'alerta', categoria: 'acesso', icone: ShieldAlert },
  'identidade.conta-bloqueada': { rotulo: 'Conta bloqueada', tom: 'perigo', categoria: 'acesso', icone: LockKeyhole },
  'identidade.sessao-encerrada': { rotulo: 'Logout', tom: 'neutro', categoria: 'acesso', icone: LogOut },
  'identidade.senha-alterada': { rotulo: 'Senha alterada', tom: 'alerta', categoria: 'senhas', icone: KeyRound },
  'identidade.recuperacao-de-senha-solicitada': {
    rotulo: 'Recuperação de senha',
    tom: 'alerta',
    categoria: 'senhas',
    icone: MailQuestion,
  },
  'identidade.senha-redefinida': { rotulo: 'Senha redefinida', tom: 'alerta', categoria: 'senhas', icone: KeyRound },
  'matriculas.matricula-registrada': { rotulo: 'Matrícula', tom: 'neutro', categoria: 'academia', icone: IdCard },
  'checkin.checkin-registrado': { rotulo: 'Check-in', tom: 'sucesso', categoria: 'academia', icone: ScanLine },
  'checkin.checkin-negado': { rotulo: 'Check-in negado', tom: 'perigo', categoria: 'academia', icone: CircleX },
}

export function descreverEvento(tipo: string): Evento {
  return EVENTOS[tipo] ?? { rotulo: tipo, tom: 'neutro', categoria: 'acesso', icone: ShieldAlert }
}

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g

/** A trilha guarda só ids. Aqui eles são trocados pelos nomes vindos do módulo Usuários. */
export function detalheComNomes(registro: RegistroDeAuditoria, nomes: Map<string, string>): string {
  return registro.descricao.replace(UUID, (id) => nomes.get(id) ?? 'outro usuário')
}

export const CLASSE_DO_TOM: Record<Tom, string> = {
  neutro: 'bg-superficie-2 text-texto-suave',
  sucesso: 'bg-sucesso-fundo text-sucesso',
  perigo: 'bg-perigo-fundo text-perigo',
  alerta: 'bg-alerta-fundo text-alerta',
}
