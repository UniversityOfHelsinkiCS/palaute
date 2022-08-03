const { adRouter, noadRouter } = require('./feedbackTargetController')

module.exports = {
  ad: adRouter,
  noad: noadRouter,
}
