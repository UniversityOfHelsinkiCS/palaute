module.exports = {
  up: async ({ context: queryInterface }) => {
    try {
      await queryInterface.sequelize.query('DROP INDEX summaries_entity_id_start_date;')
    } catch (e) {
      console.log('Tried to drop summaries_entity_id_start_date but index does not exist. Ok.')
    }
  },
  down: async ({ context: queryInterface }) => {},
}
