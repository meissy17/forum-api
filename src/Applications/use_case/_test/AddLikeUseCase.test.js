const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const AddLike = require('../../../Domains/likes/entities/AddLike');
const AddLikeUseCase = require('../AddLikeUseCase');

describe('AddLikeUseCase', () => {
  it('should orchestrate the add like action correctly', async () => {
    // Arrange
    const useCaseHeader = 'user-123';
    const useCaseParams = {
      commentId: 'comment-123',
      threadId: 'thread-123',
    };

    const mockLikeRepository = new LikeRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadId = jest.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentId = jest.fn().mockResolvedValue();
    mockLikeRepository.verifyLike = jest.fn().mockResolvedValue();
    mockLikeRepository.addLike = jest.fn(() =>
      Promise.resolve(new AddLike({
        commentId: 'comment-123',
        userId: 'user-123',
      }))
    );

    const addLikeUseCase = new AddLikeUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await addLikeUseCase.execute(useCaseParams, useCaseHeader);

    // Assert
    expect(mockThreadRepository.verifyThreadId).toBeCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.verifyCommentId).toBeCalledWith(useCaseParams.commentId);
    expect(mockLikeRepository.verifyLike).toBeCalledWith(useCaseParams.commentId, useCaseHeader);
    expect(mockLikeRepository.addLike).toBeCalledWith(useCaseParams.commentId, useCaseHeader);
  });
});