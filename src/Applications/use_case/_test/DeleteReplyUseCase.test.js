const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCaseHeader = 'user-123';
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
    };

    const { threadId, commentId, replyId: id } = useCaseParams;
    const owner = useCaseHeader;

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReply = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteReplyUseCase.execute(useCaseParams, useCaseHeader);

    // Assert
    expect(mockThreadRepository.verifyThreadId).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentId).toBeCalledWith(commentId);
    expect(mockReplyRepository.verifyReplyId).toBeCalledWith(id);
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(id, owner);
    expect(mockReplyRepository.deleteReply).toBeCalledWith(id);
  });
});