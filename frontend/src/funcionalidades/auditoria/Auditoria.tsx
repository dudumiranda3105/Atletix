import { RefreshCw } from 'lucide-react'
import { api } from '../../compartilhado/api'
import type { RegistroDeAuditoria, Usuario } from '../../compartilhado/tipos'
import { Botao, Cabecalho, Cartao, Conteudo, Selo, Vazio } from '../../compartilhado/ui'
import { formatarDataEHora, useDados } from '../../compartilhado/util'

type Tom = 'neutro' | 'sucesso' | 'perigo' | 'alerta'

/** Nome amigável de cada tipo de evento. Tipos novos aparecem com o nome técnico até entrarem aqui. */
const EVENTOS: Record<string, { rotulo: string; tom: Tom }> = {
  'usuarios.usuario-cadastrado': { rotulo: 'Conta criada', tom: 'neutro' },
  'usuarios.usuario-desativado': { rotulo: 'Conta desativada', tom: 'perigo' },
  'usuarios.usuario-reativado': { rotulo: 'Conta reativada', tom: 'sucesso' },
  'identidade.login-realizado': { rotulo: 'Login', tom: 'sucesso' },
  'identidade.login-falhou': { rotulo: 'Login sem sucesso', tom: 'alerta' },
  'identidade.conta-bloqueada': { rotulo: 'Conta bloqueada', tom: 'perigo' },
  'identidade.sessao-encerrada': { rotulo: 'Logout', tom: 'neutro' },
  'identidade.senha-alterada': { rotulo: 'Senha alterada', tom: 'alerta' },
  'identidade.recuperacao-de-senha-solicitada': { rotulo: 'Recuperação de senha', tom: 'alerta' },
  'identidade.senha-redefinida': { rotulo: 'Senha redefinida', tom: 'alerta' },
  'autorizacao.papel-alterado': { rotulo: 'Perfil alterado', tom: 'alerta' },
  'matriculas.matricula-registrada': { rotulo: 'Matrícula', tom: 'neutro' },
  'checkin.checkin-registrado': { rotulo: 'Check-in', tom: 'sucesso' },
  'checkin.checkin-negado': { rotulo: 'Check-in negado', tom: 'perigo' },
}

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g

export function Auditoria() {
  // A trilha guarda só ids; os nomes vêm do módulo Usuários e são juntados aqui na tela.
  const consulta = useDados(async () => {
    const [registros, usuarios] = await Promise.all([
      api.get<RegistroDeAuditoria[]>('/auditoria/registros?limite=200'),
      api.get<Usuario[]>('/usuarios'),
    ])
    return { registros, nomes: new Map(usuarios.map((u) => [u.id, u.nome])) }
  })

  return (
    <>
      <Cabecalho
        titulo="Auditoria"
        descricao="Eventos de segurança, do mais recente para o mais antigo."
        acoes={
          <Botao variante="secundario" onClick={consulta.recarregar} carregando={consulta.carregando}>
            {!consulta.carregando && <RefreshCw className="size-4" />} Atualizar
          </Botao>
        }
      />
      <Conteudo {...consulta}>
        {({ registros, nomes }) =>
          registros.length === 0 ? (
            <Vazio>Nenhum evento registrado.</Vazio>
          ) : (
            <Cartao className="overflow-x-auto p-0">
              <table className="w-full min-w-[42rem] text-left text-sm">
                <thead className="border-b border-borda text-xs uppercase tracking-wide text-texto-suave">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Quando</th>
                    <th className="px-3 py-3 font-semibold">Evento</th>
                    <th className="px-3 py-3 font-semibold">Usuário</th>
                    <th className="px-5 py-3 font-semibold">Detalhe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borda">
                  {registros.map((registro) => {
                    const evento = EVENTOS[registro.tipo] ?? { rotulo: registro.tipo, tom: 'neutro' as Tom }
                    return (
                      <tr key={registro.id}>
                        <td className="whitespace-nowrap px-5 py-3 tabular-nums text-texto-suave">
                          {formatarDataEHora(registro.ocorridoEm)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <Selo tom={evento.tom}>{evento.rotulo}</Selo>
                        </td>
                        <td className="px-3 py-3 font-medium">
                          {registro.usuarioId ? (nomes.get(registro.usuarioId) ?? 'Usuário removido') : '—'}
                        </td>
                        <td className="px-5 py-3 text-texto-suave">
                          {registro.descricao.replace(UUID, (id) => nomes.get(id) ?? id)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </Cartao>
          )
        }
      </Conteudo>
    </>
  )
}
