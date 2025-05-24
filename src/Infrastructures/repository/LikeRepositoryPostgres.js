const LikeRepository = require('../../Domains/likes/LikeRepository');


class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyLikeExisting({ commentId, userId }) {
    const query = {
      text: 'SELECT id FROM comments_like WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);


    if (!result.rowCount) {
      return false;
    } else {
      return true;
    }

  }

  async addLike(addLike) {
    const { commentId, userId } = addLike;
    const id = `like-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments_like VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, commentId, userId, date],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deleteLike(likeData) {
    const { commentId, userId } = likeData;
    const query = {
      text: 'DELETE FROM comments_like WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    await this._pool.query(query);
  }

  async getLikeCountByCommentId(commentId) {
    const query = {
      text: `SELECT count(id) as like_count
      FROM comments_like
      WHERE comment_id = $1
      GROUP BY id`,
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = LikeRepositoryPostgres;