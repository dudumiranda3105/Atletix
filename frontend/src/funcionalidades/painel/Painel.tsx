import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../../compartilhado/api'
import { useItensPermitidos } from '../../compartilhado/Layout'
import { useSessao } from '../../compartilhado/sessao'
import type { CheckinDoDia, SituacaoDaMatricula, Usuario } from '../../compartilhado/tipos'
import { NOME_DO_PAPEL, Permissao } from '../../compartilhado/tipos'
import { Cartao, Conteudo, Selo } from '../../compartilhado/ui'
import { useDados } from '../../compartilhado/util'
import { ResumoDaMatricula } from '../matriculas/CartaoDaMatricula'

function Numero({ rotulo, valor, detalhe }: { rotulo: string; valor: number; detalhe?: string }) {
  return (
    <>
      <p className="text-sm text-texto-suave">{rotulo}</p>
      <p className="mt-1 text-4xl font-black tracking-tight">{valor}</p>
      {detalhe && <p className="mt-1 text-sm text-texto-suave">{detalhe}</p>}
    </>
  )
}

function MinhaMatricula() {
  const matricula = useDados(() => api.get<SituacaoDaMatricula>('/matriculas/minha'))
  return (
    <Cartao>
      <Conteudo {...matricula}>{(situacao) => <ResumoDaMatricula situacao={situacao} />}</Conteudo>
      <Link to="/checkin" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-acento hover:underline">
        Fazer check-in <ArrowRight className="size-4" />
      </Link>
    </Cartao>
  )
}

function CheckinsHoje() {
  const checkins = useDados(() => api.get<CheckinDoDia[]>('/checkins/hoje'))
  return (
    <Cartao>
      <Conteudo {...checkins}>{(lista) => <Numero rotulo="Check-ins hoje" valor={lista.length} />}</Conteudo>
    </Cartao>
  )
}

function TotalDeUsuarios() {
  const usuarios = useDados(() => api.get<Usuario[]>('/usuarios'))
  return (
    <Cartao>
      <Conteudo {...usuarios}>
        {(lista) => (
          <Numero
            rotulo="Usuários cadastrados"
            valor={lista.length}
            detalhe={`${lista.filter((u) => u.ativo).length} com conta ativa`}
          />
        )}
      </Conteudo>
    </Cartao>
  )
}

export function Painel() {
  const { perfil, pode } = useSessao()
  const atalhos = useItensPermitidos().filter((item) => item.para !== '/painel')
  if (!perfil) return null

  return (
    <>
      <header className="mb-6">
        <Selo tom="destaque">{NOME_DO_PAPEL[perfil.papel]}</Selo>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Olá, {perfil.usuario.nome.split(' ')[0]}.</h1>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {pode(Permissao.MATRICULAS_CONSULTAR_PROPRIA) && <MinhaMatricula />}
        {pode(Permissao.CHECKIN_LISTAR_DO_DIA) && <CheckinsHoje />}
        {pode(Permissao.USUARIOS_LISTAR) && <TotalDeUsuarios />}
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-texto-suave">Atalhos</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {atalhos.map(({ para, rotulo, icone: Icone }) => (
          <Link
            key={para}
            to={para}
            className="flex items-center gap-3 rounded-xl border border-borda bg-superficie p-4 font-medium transition-colors hover:border-acento"
          >
            <span className="grid size-10 place-items-center rounded-lg bg-superficie-2">
              <Icone className="size-5" />
            </span>
            {rotulo}
            <ArrowRight className="ml-auto size-4 text-texto-suave" />
          </Link>
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-texto-suave">Seu acesso</h2>
      <Cartao>
        <p className="text-sm text-texto-suave">
          O perfil <strong className="text-texto">{NOME_DO_PAPEL[perfil.papel]}</strong> tem {perfil.permissoes.length}{' '}
          permissões. Elas são conferidas pelo servidor em toda requisição.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {perfil.permissoes.map((permissao) => (
            <li key={permissao} className="rounded-md bg-superficie-2 px-2 py-1 font-mono text-xs">
              {permissao}
            </li>
          ))}
        </ul>
      </Cartao>
    </>
  )
}
