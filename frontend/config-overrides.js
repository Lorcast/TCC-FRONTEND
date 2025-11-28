module.exports = function override(config, env) {
  // Filtra as regras para remover o `source-map-loader`
  config.module.rules = config.module.rules.filter(rule => rule.loader !== 'source-map-loader');
  return config;
};
