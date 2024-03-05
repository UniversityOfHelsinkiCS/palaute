module.exports = {
  up: async queryInterface => {
    await queryInterface.sequelize.query(`ALTER TABLE summaries SET LOGGED;`)
  },
  down: async queryInterface => {},
}
