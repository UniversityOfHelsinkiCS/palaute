import { sequelize } from './dbConnection'

const IS_TEACHER = `
  CREATE OR REPLACE FUNCTION is_teacher(access_status text) RETURNS boolean 
  AS $$
    SELECT access_status = 'TEACHER' OR access_status = 'RESPONSIBLE_TEACHER' 
  $$
  LANGUAGE SQL;
`

export const initializeFunctions = async () => {
  await sequelize.query(IS_TEACHER)
}
