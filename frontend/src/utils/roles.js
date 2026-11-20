export const ROLES = {
  ADMIN: 'Administrador',
  RESPONSABLE: 'Responsable',
  VOLUNTARIO: 'Voluntario',
};

// Admin y Responsable
export const GESTION = [ROLES.ADMIN, ROLES.RESPONSABLE];

export const esGestion = (user) => GESTION.includes(user?.rol);
export const esAdmin = (user) => user?.rol === ROLES.ADMIN;
