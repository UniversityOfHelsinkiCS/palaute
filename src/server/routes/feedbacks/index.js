const { adRouter, noadRouter } = require('./feedbacksController')

module.exports = {
  ad: adRouter,
  noad: noadRouter,
}
