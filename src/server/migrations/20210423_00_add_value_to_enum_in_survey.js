module.exports = {
  up: async queryInterface => {
    await queryInterface.sequelize.query("ALTER TYPE enum_surveys_type ADD VALUE 'courseUnit'")
  },
  down: async () => {},
}
