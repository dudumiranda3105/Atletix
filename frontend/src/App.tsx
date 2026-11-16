import { ShieldX } from 'lucide-react'
import { MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { ProvedorDeAvisos } from './compartilhado/avisos'
import { Layout } from './compartilhado/Layout'
import { ProvedorDeSessao, useSessao } from './compartilhado/sessao'
import { Permissao } from './compartilhado/tipos'
import { Cabecalho, Carregando, Vazio } from './compartilhado/ui'
import { Auditoria } from './funcionalidades/auditoria/Auditoria'
import { CheckinsDeHoje } from './funcionalidades/checkin/CheckinsDeHoje'
import { MeuCheckin } from './funcionalidades/checkin/MeuCheckin'
import { Cadastro } from './funcionalidades/identidade/Cadastro'
import { Entrar } from './funcionalidades/identidade/Entrar'
import { MinhaConta } from './funcionalidades/identidade/MinhaConta'
import { RecuperarSenha } from './funcionalidades/identidade/RecuperarSenha'
import { RedefinirSenha } from './funcionalidades/identidade/RedefinirSenha'
import { Matriculas } from './funcionalidades/matriculas/Matriculas'
import { CaixaDeSaida } from './funcionalidades/notificacoes/CaixaDeSaida'
import { Painel } from './funcionalidades/painel/Painel'
import { Usuarios } from './funcionalidades/usuarios/Usuarios'

function TelaCheia({ children }: { children: ReactNode }) {
  return <div className="grid min-h-dvh place-items-center">{children}</div>
}

/** Rotas internas: exigem sessão. Sem sessão, o usuário vai para o login. */
function AreaLogada() {
  const { estado } = useSessao()
  const local = useLocation()
  if (estado === 'carregando') {
    return (
      <TelaCheia>
        <Carregando />
      </TelaCheia>
    )
  }
  if (estado === 'anonimo') return <Navigate to="/entrar" replace state={{ de: local.pathname }} />
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

/** Telas de login e cadastro: quem já entrou vai direto para o painel. */
function AreaAnonima() {
  const { estado } = useSessao()
  const origem = (useLocation().state as { de?: string } | null)?.de
  if (estado === 'carregando') {
    return (
      <TelaCheia>
        <Carregando />
      </TelaCheia>
    )
  }
  return estado === 'autenticado' ? <Navigate to={origem ?? '/painel'} replace /> : <Outlet />
}

function Exige({ permissao, children }: { permissao: string; children: ReactNode }) {
  const { pode } = useSessao()
  if (pode(permissao)) return <>{children}</>
  return (
    <>
      <Cabecalho titulo="Acesso negado" />
      <Vazio icone={ShieldX} titulo="O seu perfil não dá acesso a esta página">
        Se você precisa deste acesso, fale com um administrador.
      </Vazio>
    </>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <ProvedorDeAvisos>
        <ProvedorDeSessao>
        <Routes>
          <Route element={<AreaAnonima />}>
            <Route path="/entrar" element={<Entrar />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          </Route>
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />

          <Route element={<AreaLogada />}>
            <Route path="/painel" element={<Painel />} />
            <Route path="/conta" element={<MinhaConta />} />
            <Route
              path="/checkin"
              element={
                <Exige permissao={Permissao.CHECKIN_REGISTRAR}>
                  <MeuCheckin />
                </Exige>
              }
            />
            <Route
              path="/usuarios"
              element={
                <Exige permissao={Permissao.USUARIOS_LISTAR}>
                  <Usuarios />
                </Exige>
              }
            />
            <Route
              path="/matriculas"
              element={
                <Exige permissao={Permissao.MATRICULAS_CONSULTAR}>
                  <Matriculas />
                </Exige>
              }
            />
            <Route
              path="/checkins-de-hoje"
              element={
                <Exige permissao={Permissao.CHECKIN_LISTAR_DO_DIA}>
                  <CheckinsDeHoje />
                </Exige>
              }
            />
            <Route
              path="/auditoria"
              element={
                <Exige permissao={Permissao.AUDITORIA_CONSULTAR}>
                  <Auditoria />
                </Exige>
              }
            />
            <Route
              path="/caixa-de-saida"
              element={
                <Exige permissao={Permissao.NOTIFICACOES_CAIXA_DE_SAIDA}>
                  <CaixaDeSaida />
                </Exige>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/painel" replace />} />
        </Routes>
        </ProvedorDeSessao>
        </ProvedorDeAvisos>
      </BrowserRouter>
    </MotionConfig>
  )
}
