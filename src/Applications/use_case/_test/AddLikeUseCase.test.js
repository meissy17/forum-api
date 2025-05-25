const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const AddLikeUseCase = require('../AddLikeUseCase');

describe('AddLikeUseCase', () => {
  it('should orchestrate the add like action correctly when like doesnt exist', async () => {
    // Arrange
    const userId = 'user-123';
    const useCaseParams = {
      commentId: 'comment-123',
      threadId: 'thread-123',
    };

    const mockLikeRepository = new LikeRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // Mocking
    mockThreadRepository.verifyThreadId = jest.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentId = jest.fn().mockResolvedValue();
    mockLikeRepository.verifyLikeExisting = jest.fn().mockResolvedValue(false);
    mockLikeRepository.addLike = jest.fn().mockResolvedValue({
      commentId: 'comment-123',
      userId: 'user-123',
    });

    const addLikeUseCase = new AddLikeUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const result = await addLikeUseCase.execute(useCaseParams, userId);

    // Assert
    expect(mockThreadRepository.verifyThreadId).toBeCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.verifyCommentId).toBeCalledWith(useCaseParams.commentId);
    expect(mockLikeRepository.verifyLikeExisting).toBeCalledWith({
      commentId: useCaseParams.commentId,
      userId
    });
    expect(mockLikeRepository.addLike).toBeCalledWith({
      commentId: useCaseParams.commentId,
      userId
    });
    expect(result).toEqual({
      commentId: 'comment-123',
      userId: 'user-123',
    });
  });

  it('should orchestrate the delete like action correctly when like already exists', async () => {
    // Arrange
    const userId = 'user-123';
    const useCaseParams = {
      commentId: 'comment-123',
      threadId: 'thread-123',
    };

    const mockLikeRepository = new LikeRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // Mocking
    mockThreadRepository.verifyThreadId = jest.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentId = jest.fn().mockResolvedValue();
    mockLikeRepository.verifyLikeExisting = jest.fn().mockResolvedValue(true);
    mockLikeRepository.deleteLike = jest.fn().mockResolvedValue({
      commentId: 'comment-123',
      userId: 'user-123',
    });

    const addLikeUseCase = new AddLikeUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const result = await addLikeUseCase.execute(useCaseParams, userId);

    // Assert
    expect(mockThreadRepository.verifyThreadId).toBeCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.verifyCommentId).toBeCalledWith(useCaseParams.commentId);
    expect(mockLikeRepository.verifyLikeExisting).toBeCalledWith({
      commentId: useCaseParams.commentId,
      userId
    });
    expect(mockLikeRepository.deleteLike).toBeCalledWith({
      commentId: useCaseParams.commentId,
      userId
    });
    expect(result).toEqual({
      commentId: 'comment-123',
      userId: 'user-123',
    });
  });
});