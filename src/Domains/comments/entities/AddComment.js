class AddComment {
  constructor({ content, threadId, owner }) {
    if (!content) {
      throw new Error('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string') {
      throw new Error('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    this.content = content;
    this.threadId = threadId;
    this.owner = owner;
  }
}

module.exports = AddComment;