class DeleteReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCaseParams, useCaseHeader) {
    const { threadId, commentId, replyId: id } = useCaseParams;
    const owner = useCaseHeader;

    await this._threadRepository.verifyThreadId(threadId);
    await this._commentRepository.verifyCommentId(commentId);
    await this._replyRepository.verifyReplyId(id);
    await this._replyRepository.verifyReplyOwner(id, owner);
    return this._replyRepository.deleteReply(id);
  }
}

module.exports = DeleteReplyUseCase;