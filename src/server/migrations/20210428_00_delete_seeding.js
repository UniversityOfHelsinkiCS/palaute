/* eslint-disable */
const questions = [
  ['LIKERT', `{ "label": { "fi": "Opintojakson tavoitteet olivat selkeät" } }`],
  [
    'TEXT',
    `{ "content": { "fi": "1 = Täysin eri mieltä, 2 = Jokseenkin eri mieltä, 3 = Siltä väliltä, 4 = Jokseenkin samaa mieltä, 5 = Täysin samaa mieltä" } }`,
  ],
  ['OPEN', `{ "label": { "fi": "Miten opintojaksoa tulisi mielestäsi kehittää?" } }`],
  [
    'SINGLE_CHOICE',
    `{ "label": { "fi": "Haluaisitko että kurssilla olisi enemmän ohjausta?" }, "options": [ { "id": "a", "label": { "fi": "Kyllä" } }, { "id": "b", "label": { "fi": "Ei" } } ] }`,
  ],
  [
    'MULTIPLE_CHOICE',
    `{ "label": { "fi": "Valitse seuraavista ne kanavat joiden kautta suosit ohjaajan tukea." }, "options": [ { "id": "a", "label": { "fi": "Moodle" } }, { "id": "b", "label": { "fi": "Sosiaalinen media" } }, { "id": "c", "label": { "fi": "Luentojen tai laskarien yhteydessä" } } ] }`,
  ],
]

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`DELETE FROM surveys WHERE type = 'university'`)

    await queryInterface.sequelize.query(
      `INSERT INTO surveys (type, type_id, question_ids, created_at, updated_at) VALUES ('university', 'HY', '{}', NOW(), NOW())`
    )

    for (const [_, question] of questions) {
      await queryInterface.sequelize.query(`DELETE FROM questions where data = '${question}'`)
    }
  },
  down: async ({ context: queryInterface }) => {
    const ids = []
    for (const [type, question] of questions) {
      await queryInterface.sequelize.query(
        `INSERT INTO questions (type, data, created_at, updated_at) VALUES ('${type}', '${question}', NOW(), NOW())`
      )
      const [[{ id }]] = await queryInterface.sequelize.query(`SELECT id FROM questions where data = '${question}'`)
      ids.push(id)
    }

    await queryInterface.sequelize.query(`DELETE FROM surveys WHERE type = 'university'`)

    await queryInterface.sequelize.query(
      `INSERT INTO surveys (type, type_id, question_ids, created_at, updated_at) VALUES ('university', 'HY', '{${ids.join(
        ','
      )}}', NOW(), NOW())`
    )
  },
}
