import { RefreshCw, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../compartilhado/api'
import type { RegistroDeAuditoria, Usuario } from '../../compartilhado/tipos'
import { Botao, Cabecalho, CampoDeBusca, Conteudo, Segmentos, Vazio } from '../../compartilhado/ui'
import { chaveDoDia, comInicialMaiuscula, formatarHora, nomeDoDia, useDados } from '../../compartilhado/util'
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

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Segmentos rotulo="Filtrar por tipo de evento" opcoes={FILTROS} valor={filtro} aoMudar={setFiltro} />
        <CampoDeBusca rotulo="Buscar por pessoa" valor={busca} aoMudar={setBusca} className="min-w-52 flex-1" />
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
            <div className="space-y-10">
              {[...porDia.entries()].map(([dia, doDia]) => (
                <section key={dia}>
                  <h2 className="flex items-baseline justify-between gap-3 border-b border-texto pb-3">
                    <span>{comInicialMaiuscula(nomeDoDia(dia))}</span>
                    <span className="text-sm font-normal tabular-nums text-texto-suave">
                      {doDia.length} {doDia.length === 1 ? 'evento' : 'eventos'}
                    </span>
                  </h2>
                  <ul className="divide-y divide-borda">
                    {doDia.map((registro) => {
                      const evento = descreverEvento(registro.tipo)
                      const Icone = evento.icone
                      const nome = registro.usuarioId ? nomes.get(registro.usuarioId) : undefined
                      return (
                        <li key={registro.id} className="flex items-start gap-4 py-3.5">
                          <time className="w-12 shrink-0 pt-1 text-sm tabular-nums text-texto-suave">
                            {formatarHora(registro.ocorridoEm)}
                          </time>
                          <span className={`grid size-8 shrink-0 place-items-center rounded-controle ${CLASSE_DO_TOM[evento.tom]}`}>
                            <Icone className="size-4" />
                          </span>
                          <div className="min-w-0 flex-1 pt-0.5 md:flex md:items-baseline md:gap-3">
                            <p className="truncate md:shrink-0">
                              <span className="font-semibold">{evento.rotulo}</span>
                              {nome && <span> de {nome}</span>}
                            </p>
                            <p className="truncate text-sm text-texto-suave">{detalheComNomes(registro, nomes)}</p>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )
        }}
      </Conteudo>
    </>
  )
}
