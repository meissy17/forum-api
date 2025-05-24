/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const LikesTableTestHelper = {
  async addLike({
    id = 'like-123', commentId = 'comment-123', userId = 'user-123', date = '2025-05-05'
  }) {
    const query = {
      text: 'INSERT INTO comments_like VALUES($1, $2, $3, $4)',
      values: [id, commentId, userId, date],
    };

    await pool.query(query);
  },

  async findLikeById(id) {
    const query = {
      text: 'SELECT * FROM comments_like WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments_like WHERE 1=1');
  },
};

module.exports = LikesTableTestHelper;