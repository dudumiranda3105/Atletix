/**
 * Funções de aptidão da arquitetura (Richards & Ford): estas regras falham o build
 * se o código deixar de respeitar as decisões do ADR-001.
 *
 * Executar: npm run arquitetura
 */
const MODULO = '^src/modulos/([^/]+)/';

module.exports = {
  forbidden: [
    {
      name: 'sem-dependencias-ciclicas',
      comment: 'Nenhum ciclo entre arquivos ou módulos.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'modulo-so-conhece-o-contrato-do-outro',
      comment:
        'Um módulo só pode importar de outro pela pasta contratos/. A única exceção é a montagem: ' +
        'um *.module.ts pode importar o *.module.ts de quem ele depende.',
      severity: 'error',
      from: { path: MODULO },
      to: {
        path: '^src/modulos/[^/]+/',
        pathNot: ['^src/modulos/$1/', '^src/modulos/[^/]+/contratos/', '^src/modulos/[^/]+/[^/]+\\.module\\.ts$'],
      },
    },
    {
      name: 'so-a-montagem-importa-modulos',
      comment: 'Arquivos *.module.ts só são importados por outros *.module.ts.',
      severity: 'error',
      from: { path: MODULO, pathNot: '\\.module\\.ts$' },
      to: { path: '^src/modulos/[^/]+/[^/]+\\.module\\.ts$' },
    },
    {
      name: 'dominio-sem-framework',
      comment: 'O domínio não conhece NestJS, TypeORM, HTTP nem banco de dados.',
      severity: 'error',
      from: { path: '^src/(modulos/[^/]+|compartilhado)/dominio/' },
      to: { path: ['node_modules/(@nestjs|typeorm|express)', '^src/modulos/[^/]+/(api|aplicacao|infraestrutura)/'] },
    },
    {
      name: 'aplicacao-nao-conhece-api-nem-infraestrutura',
      comment: 'Casos de uso dependem das portas do domínio, nunca dos adaptadores.',
      severity: 'error',
      from: { path: '^src/modulos/[^/]+/aplicacao/' },
      to: { path: '^src/modulos/[^/]+/(api|infraestrutura)/' },
    },
    {
      name: 'api-nao-acessa-infraestrutura',
      comment: 'Controllers e ouvintes passam pelos casos de uso; não falam com o banco.',
      severity: 'error',
      from: { path: '^src/modulos/[^/]+/api/' },
      to: { path: ['^src/modulos/[^/]+/infraestrutura/', 'node_modules/typeorm'] },
    },
    {
      name: 'contrato-nao-expoe-detalhes-internos',
      comment: 'O contrato de um módulo não pode depender das camadas internas dele.',
      severity: 'error',
      from: { path: '^src/modulos/[^/]+/contratos/' },
      to: { path: '^src/modulos/[^/]+/(api|aplicacao|dominio|infraestrutura)/' },
    },
    {
      name: 'nucleo-nao-depende-de-modulos',
      comment: 'O núcleo compartilhado é estável: nenhum módulo de negócio aparece nele.',
      severity: 'error',
      from: { path: '^src/compartilhado/' },
      to: { path: '^src/modulos/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    // Considera também imports só de tipos (interfaces), que somem depois da compilação.
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
  },
};
