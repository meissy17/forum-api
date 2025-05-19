const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const AddedReply = require('../../Domains/replies/entities/AddedReply');


class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyReplyId(id) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Reply tidak ditemukan');
    }
  }

  async verifyReplyOwner(id, owner) {
    const query = {
      text: 'SELECT id, owner FROM replies WHERE id = $1 AND owner = $2',
      values: [id, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('Anda tidak dapat menghapus reply ini');
    }
  }

  async addReply(addReply) {
    const { commentId, content, owner } = addReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, commentId, content, owner, date],
    };

    const result = await this._pool.query(query);

    return new AddedReply({ ...result.rows[0] });
  }

  async deleteReply(id) {
    const query = {
      text: 'UPDATE replies SET is_deleted = true WHERE id = $1',
      values: [id],
    };

    await this._pool.query(query);
  }

  async getReplyByCommentId(commentId) {
    const query = {
      text: `SELECT replies.id, replies.content, replies.date, users.username, replies.is_deleted as "isDeleted" FROM replies
      INNER JOIN users ON replies.owner = users.id
      WHERE replies.comment_id = $1
      ORDER BY replies.date ASC`,
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = ReplyRepositoryPostgres;