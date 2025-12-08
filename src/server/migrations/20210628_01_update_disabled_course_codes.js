module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
    UPDATE organisations
    SET disabled_course_codes = ARRAY(
    SELECT DISTINCT ON (course_units.course_code)
    course_units.course_code
    FROM course_units
    INNER JOIN course_units_organisations ON course_units.id = course_units_organisations.course_unit_id
    WHERE course_units_organisations.organisation_id = organisations.id);
    `)
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
    UPDATE organisations
    SET disabled_course_codes = '{}';
    `)
  },
}
