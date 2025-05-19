class AddReply {
  constructor({ content, commentId, owner, threadId }) {
    if (!content) {
      throw new Error('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string') {
      throw new Error('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    this.content = content;
    this.commentId = commentId;
    this.owner = owner;
    this.threadId = threadId;
  }
}

module.exports = AddReply;