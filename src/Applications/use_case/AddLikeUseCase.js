class AddLikeUseCase {
  constructor({ likeRepository, commentRepository, threadRepository }) {
    this._likeRepository = likeRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCaseParams, useCaseHeader) {
    const { threadId, commentId } = useCaseParams;
    const userId = useCaseHeader;

    await this._threadRepository.verifyThreadId(threadId);
    await this._commentRepository.verifyCommentId(commentId);
    await this._likeRepository.verifyLike(commentId, userId);
    return this._likeRepository.addLike(commentId, userId);
  }
}

module.exports = AddLikeUseCase;