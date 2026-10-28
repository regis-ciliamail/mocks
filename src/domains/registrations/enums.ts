/** Valores espelham o contrato da API (ainda a definir — ver GERE-1446). */
export enum UserStatusEnum {
  Active = 'active',
  Invited = 'invited',
  PasswordReset = 'password_reset',
  Inactive = 'inactive',
}

/** Módulos do GERE que um perfil pode acessar, na ordem do menu lateral. */
export enum PermissionEnum {
  Dashboard = 'dashboard',
  Workshops = 'workshops',
  Ratings = 'ratings',
  Providers = 'providers',
  AutoCenters = 'auto_centers',
  Map = 'map',
  Integrations = 'integrations',
  Reports = 'reports',
  Registrations = 'registrations',
  Administration = 'administration',
}
