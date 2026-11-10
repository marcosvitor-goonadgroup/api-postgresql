/**
 * Restrições de exposição de dados por evento
 *
 * A API entrega qualquer tabela do schema public sem autenticação.
 * Para bancos que guardam credenciais ou dados pessoais (ex.: o Strapi do Missões),
 * definimos aqui as tabelas bloqueadas e as colunas removidas das respostas.
 * Eventos sem entrada neste objeto não têm restrição (comportamento original).
 */
const restrictions = {
  missoes: {
    // Tabelas internas do Strapi: usuários admin, API tokens, sessões, configurações e permissões
    blockedTables: [/^admin_/i, /^strapi_/i, /^up_permissions/i],

    // Colunas removidas de qualquer tabela
    hiddenColumns: [
      // Credenciais e tokens (up_users)
      'password',
      'reset_password_token',
      'confirmation_token',
      // Dados pessoais sensíveis (up_users)
      'cpf',
      'telephone',
      'agencia',
      'conta',
      'titular_conta',
      // Códigos que permitiriam burlar check-in/resgate (ativacoes, postos_staff, resgates)
      'codigo_qr',
      'codigo'
    ]
  }
};

/**
 * Indica se a tabela não deve ser exposta para o evento
 */
const isTableBlocked = (event, tableName) => {
  const rules = restrictions[event];
  return Boolean(rules) && rules.blockedTables.some((pattern) => pattern.test(tableName));
};

/**
 * Remove as colunas sensíveis das linhas retornadas para o evento
 */
const sanitizeRows = (event, rows) => {
  const rules = restrictions[event];
  if (!rules) return rows;

  return rows.map((row) => {
    const clean = { ...row };
    for (const column of rules.hiddenColumns) {
      delete clean[column];
    }
    return clean;
  });
};

module.exports = {
  isTableBlocked,
  sanitizeRows
};
