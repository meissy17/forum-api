/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReplies({
    id = 'reply-123', commentId = 'comment-123', content = 'reply test', owner = 'user-123', isDeleted = 'f', date = '2025-05-05'
  }) {
    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, commentId, content, owner, date, isDeleted],
    };

    await pool.query(query);
  },

  async findReplyById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = RepliesTableTestHelper;