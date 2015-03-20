module.exports = function enableAuthentication(server) {
  if (process.env.NODE_ENV === 'production'|| process.env.NODE_ENV === 'staging' || process.env.AUTH_ENABLED === "true") {
    server.enableAuth();
  }
};
