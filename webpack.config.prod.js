const config = require('./webpack.config.dev')

module.exports = Object.assign(config, {
    mode: 'production'
})
