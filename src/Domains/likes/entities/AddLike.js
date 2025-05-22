class AddLike {
  constructor({ commentId, userId }) {
    if (!commentId || !userId) {
      throw new Error('NEW_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof commentId !== 'string' || typeof userId !== 'string') {
      throw new Error('NEW_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    this.commentId = commentId;
    this.userId = userId;
  }
}

module.exports = AddLike;