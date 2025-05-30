const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const addComment = new AddComment(useCasePayload);
    const result = await this._threadRepository.verifyThreadId(addComment.threadId);
    return this._commentRepository.addComment(addComment);
  }
}

module.exports = AddCommentUseCase;