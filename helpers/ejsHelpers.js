module.exports = function (name, params = {}) {
  return global.app.namedRoutes.build(name, params);
};
