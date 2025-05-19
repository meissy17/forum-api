const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const addReply = new AddReply(useCasePayload);
    await this._threadRepository.verifyThreadId(addReply.threadId);
    await this._commentRepository.verifyCommentId(addReply.commentId);
    return this._replyRepository.addReply(addReply);
  }
}

module.exports = AddReplyUseCase;