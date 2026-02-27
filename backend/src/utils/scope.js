/**
 * Injeta o storeId obrigatório em cláusulas "where" do Prisma.
 * @param {Object} where - Objeto where original
 * @param {Object} req - Objeto request do Express (deve conter req.storeId)
 * @returns {Object} Objeto where com storeId blindado
 */
exports.withStore = (where, req) => {
  if (!req || !req.storeId) {
    throw new Error("TENTATIVA DE ACESSO SEM STORE SCOPE (FALHA DE SEGURANÇA)");
  }
  return {
    ...where,
    storeId: req.storeId
  };
};
