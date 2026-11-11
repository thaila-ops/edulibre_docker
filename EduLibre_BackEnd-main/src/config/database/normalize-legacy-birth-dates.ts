import sequelize from './index';

export default async function normalizeLegacyBirthDates() {
  try {
    await sequelize.query(`
      ALTER TABLE Users
      MODIFY COLUMN dataNascimento DATE NULL
    `);

    await sequelize.query(`
      UPDATE Users
      SET dataNascimento = NULL
      WHERE dataNascimento = '0000-00-00'
    `);
  } catch {
    // Banco novo ou schema antigo sem a coluna ainda.
  }
}
