/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');
const UsersTableTestHelper = require('./UsersTableTestHelper');

const ThreadsTableTestHelper = {
  async addThreads({
    id = 'threads-123', title = 'threads title test', body = 'threads body test', owner = 'user-123', date = '2025-05-05'
  }) {
    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5)',
      values: [id, title, body, owner, date],
    };

    await pool.query(query);
  },

  async findThreadsById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM threads WHERE 1=1');
  },
};

module.exports = ThreadsTableTestHelper;