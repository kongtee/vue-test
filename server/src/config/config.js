// default config
module.exports = {
    port: 8360,
    workers: 0,
    onUnhandledRejection: err => think.logger.error(err), // unhandledRejection handle
    onUncaughtException: err => think.logger.error(err)
};
