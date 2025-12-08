module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`ALTER TABLE summaries SET LOGGED;`)
  },
  down: async ({ context: queryInterface }) => {},
}
