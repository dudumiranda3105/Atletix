import { RefreshCw, Search, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../compartilhado/api'
import type { RegistroDeAuditoria, Usuario } from '../../compartilhado/tipos'
import { Botao, Cabecalho, Cartao, Conteudo, Segmentos, Vazio } from '../../compartilhado/ui'
import { chaveDoDia, formatarHora, nomeDoDia, useDados } from '../../compartilhado/util'
import type { Categoria } from './eventos'
import { CLASSE_DO_TOM, descreverEvento, detalheComNomes } from './eventos'

type Filtro = Categoria | 'tudo'

const FILTROS: { valor: Filtro; nome: string }[] = [
  { valor: 'tudo', nome: 'Tudo' },
  { valor: 'acesso', nome: 'Acesso' },
  { valor: 'senhas', nome: 'Senhas' },
  { valor: 'contas', nome: 'Contas e perfis' },
  { valor: 'academia', nome: 'Matrículas e check-ins' },
]

export function Auditoria() {
  // A trilha guarda só ids; os nomes vêm do módulo Usuários e são juntados aqui na tela.
  const consulta = useDados(async () => {
    const [registros, usuarios] = await Promise.all([
      api.get<RegistroDeAuditoria[]>('/auditoria/registros?limite=300'),
      api.get<Usuario[]>('/usuarios'),
    ])
    return { registros, nomes: new Map(usuarios.map((u) => [u.id, u.nome])) }
  })
  const [filtro, setFiltro] = useState<Filtro>('tudo')
  const [busca, setBusca] = useState('')

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

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Segmentos rotulo="Filtrar por tipo de evento" opcoes={FILTROS} valor={filtro} aoMudar={setFiltro} />
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-texto-suave" />
          <input
            type="search"
            aria-label="Buscar por pessoa"
            placeholder="Buscar por pessoa"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="h-10 w-full rounded-xl border border-borda bg-superficie pl-10 pr-3 text-sm placeholder:text-texto-suave/80 focus:border-acento"
          />
        </div>
      </div>

      <Conteudo {...consulta}>
        {({ registros, nomes }) => {
          const termo = busca.trim().toLowerCase()
          const visiveis = registros.filter((registro) => {
            const nome = (registro.usuarioId && nomes.get(registro.usuarioId)) || ''
            return (
              (filtro === 'tudo' || descreverEvento(registro.tipo).categoria === filtro) &&
              (!termo || nome.toLowerCase().includes(termo) || registro.descricao.toLowerCase().includes(termo))
            )
          })
          if (visiveis.length === 0) {
            return (
              <Vazio icone={ShieldCheck} titulo="Nenhum evento encontrado">
                Nenhum registro combina com o filtro escolhido.
              </Vazio>
            )
          }

          // Agrupa por dia, mantendo a ordem em que os registros chegaram (mais recente primeiro).
          const porDia = new Map<string, RegistroDeAuditoria[]>()
          for (const registro of visiveis) {
            const chave = chaveDoDia(registro.ocorridoEm)
            porDia.set(chave, [...(porDia.get(chave) ?? []), registro])
          }

          return (
            <div className="space-y-7">
              {[...porDia.entries()].map(([dia, doDia]) => (
                <section key={dia}>
                  <h2 className="mb-3 flex items-center gap-3 text-sm font-semibold text-texto-suave">
                    <span className="first-letter:uppercase">{nomeDoDia(dia)}</span>
                    <span className="h-px flex-1 bg-borda" />
                    <span className="font-normal tabular-nums">
                      {doDia.length} {doDia.length === 1 ? 'evento' : 'eventos'}
                    </span>
                  </h2>
                  <Cartao className="p-2">
                    <ul>
                      {doDia.map((registro) => {
                        const evento = descreverEvento(registro.tipo)
                        const Icone = evento.icone
                        const nome = registro.usuarioId ? nomes.get(registro.usuarioId) : undefined
                        return (
                          <li
                            key={registro.id}
                            className="flex items-center gap-3.5 rounded-xl px-3 py-2.5 transition-colors hover:bg-superficie-2/70"
                          >
                            <span
                              className={`grid size-10 shrink-0 place-items-center rounded-xl ${CLASSE_DO_TOM[evento.tom]}`}
                            >
                              <Icone className="size-[1.1rem]" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">
                                {evento.rotulo}
                                {nome && <span className="font-normal text-texto-suave"> de {nome}</span>}
                              </p>
                              <p className="truncate text-sm text-texto-suave">{detalheComNomes(registro, nomes)}</p>
                            </div>
                            <time className="shrink-0 text-sm tabular-nums text-texto-suave">
                              {formatarHora(registro.ocorridoEm)}
                            </time>
                          </li>
                        )
                      })}
                    </ul>
                  </Cartao>
                </section>
              ))}
            </div>
          )
        }}
      </Conteudo>
    </>
  )
}
