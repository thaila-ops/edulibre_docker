export const PERMISSIONS = [
  {
    key: 'aulas.contratar',
    description: 'Permite agendar uma aula.',
  },
  {
    key: 'aulas.criar',
    description: 'Permite publicar uma aula.',
  },
  {
    key: 'aulas.editar_propria',
    description: 'Permite editar a própria aula.',
  },
  {
    key: 'aulas.excluir_propria',
    description: 'Permite excluir a própria aula.',
  },
  {
    key: 'usuarios.listar',
    description: 'Permite listar usuários.',
  },
  {
    key: 'usuarios.papel.gerenciar',
    description: 'Permite conceder e remover roles.',
  },
  {
    key: 'aulas.gerenciar_qualquer',
    description: 'Permite gerenciar qualquer aula.',
  },
  {
    key: 'aulas.bloquear',
    description: 'Permite bloquear aulas.',
  },
  {
    key: 'aulas.desbloquear',
    description: 'Permite desbloquear aulas.',
  },
  {
    key: 'admin.dashboard.visualizar',
    description: 'Permite visualizar o dashboard administrativo.',
  },
] as const;

type PermissionKey = (typeof PERMISSIONS)[number]['key'];

type RoleSeed = {
  key: string;
  name: string;
  isSuperAdmin: boolean;
  permissions: PermissionKey[];
};

export const ROLE_SEEDS: RoleSeed[] = [
  {
    key: 'aluno',
    name: 'Aluno',
    isSuperAdmin: false,
    permissions: ['aulas.contratar'],
  },
  {
    key: 'professor',
    name: 'Professor',
    isSuperAdmin: false,
    permissions: [
      'aulas.criar',
      'aulas.editar_propria',
      'aulas.excluir_propria',
    ],
  },
  {
    key: 'admin',
    name: 'Administrador',
    isSuperAdmin: true,
    permissions: [],
  },
  {
    key: 'moderador',
    name: 'Moderador',
    isSuperAdmin: false,
    permissions: [
      'aulas.bloquear',
      'aulas.desbloquear',
      'aulas.gerenciar_qualquer',
    ],
  },
  {
    key: 'suporte',
    name: 'Suporte',
    isSuperAdmin: false,
    permissions: ['usuarios.listar'],
  },
];
