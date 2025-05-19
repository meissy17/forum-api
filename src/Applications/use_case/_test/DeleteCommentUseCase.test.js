const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCaseHeader = 'user-123';
    const useCaseParams = {
      id: 'comment-123',
      threadId: 'thread-123',
    };

    const { threadId, commentId: id } = useCaseParams;
    const owner = useCaseHeader;

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();


    mockThreadRepository.verifyThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteCommentUseCase.execute(useCaseParams, useCaseHeader);

    // Assert
    expect(mockThreadRepository.verifyThreadId).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentId).toBeCalledWith(id);
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(id, owner);
    expect(mockCommentRepository.deleteComment).toBeCalledWith(id);
  });
});