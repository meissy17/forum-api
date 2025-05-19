class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCaseParams, useCaseHeader) {
    const { threadId, commentId: id } = useCaseParams;
    const owner = useCaseHeader;

    await this._threadRepository.verifyThreadId(threadId);
    await this._commentRepository.verifyCommentId(id);
    await this._commentRepository.verifyCommentOwner(id, owner);

    return this._commentRepository.deleteComment(id);
  }
}

module.exports = DeleteCommentUseCase;