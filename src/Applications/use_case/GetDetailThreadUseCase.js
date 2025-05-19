const DetailComment = require('../../Domains/comments/entities/DetailComment');
const DetailThread = require('../../Domains/threads/entities/DetailThread');
const DetailReply = require('../../Domains/replies/entities/DetailReply');

class GetDetailThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCaseParams) {
    const { threadId } = useCaseParams;

    const detailThread = await this._threadRepository.getThreadbyId(threadId);
    const comments = await this._commentRepository.getCommentByThreadId(threadId);

    detailThread.comments = await Promise.all(
      comments.map(async (comment) => {
        const replies = await this._replyRepository.getReplyByCommentId(comment.id);

        const mappedReplies = replies.map((reply) => new DetailReply(reply));

        return new DetailComment({
          ...comment,
          replies: mappedReplies,
        });
      })
    );


    return new DetailThread(detailThread);
  }
}

module.exports = GetDetailThreadUseCase;