/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComments({
    id = 'comment-123', threadId = 'thread-123', content = 'comment test', owner = 'user-123', isDeleted = 'f', date = '2025-05-05'
  }) {
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, threadId, content, owner, date, isDeleted],
    };

    await pool.query(query);
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async findCommentByThreadId(threadId) {
    const query = {
      text: 'SELECT * FROM comments WHERE thread_id = $1',
      values: [threadId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },


};

module.exports = CommentsTableTestHelper;