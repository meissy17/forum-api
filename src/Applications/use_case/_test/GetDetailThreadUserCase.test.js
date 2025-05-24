const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');

describe('GetDetailThreadUseCase', () => {
  it('should orchestrate the get detail thread action correctly', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
    };

    const expectedReply = [
      new DetailReply({
        id: 'reply-123',
        content: 'Reply Content',
        date: '2025-05-06T15:47:00.831Z',
        username: 'dicoding',
        isDeleted: false,
      })
    ];

    const expectedComment = [
      new DetailComment({
        id: 'comment-123',
        username: 'dicoding',
        date: '2025-05-05T15:47:00.831Z',
        replies: expectedReply,
        content: 'Comment Content',
        isDeleted: false,
        likeCount: 1,
      })
    ];

    const expectedDetailThread = new DetailThread({
      id: 'thread-123',
      title: 'Thread Title Test',
      body: 'Thread Body Test',
      date: '2025-05-04T15:47:00.831Z',
      username: 'dicoding',
      comments: expectedComment,
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.getThreadbyId = jest.fn(() => Promise.resolve({
      id: 'thread-123',
      title: 'Thread Title Test',
      body: 'Thread Body Test',
      date: '2025-05-04T15:47:00.831Z',
      username: 'dicoding',
    }));

    mockCommentRepository.getCommentByThreadId = jest.fn(() => Promise.resolve([
      {
        id: 'comment-123',
        username: 'dicoding',
        date: '2025-05-05T15:47:00.831Z',
        content: 'Comment Content',
        isDeleted: false,
      }
    ]));

    mockLikeRepository.getLikeCountByCommentId = jest.fn(() => Promise.resolve(1));

    mockReplyRepository.getReplyByCommentId = jest.fn(() => Promise.resolve([
      {
        id: 'reply-123',
        content: 'Reply Content',
        date: '2025-05-06T15:47:00.831Z',
        username: 'dicoding',
        isDeleted: false,
      }
    ]));

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const detailThread = await getDetailThreadUseCase.execute(useCaseParams);

    // Assert
    expect(detailThread).toEqual(expectedDetailThread);
    expect(mockThreadRepository.getThreadbyId).toBeCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(useCaseParams.threadId);
    expect(mockLikeRepository.getLikeCountByCommentId).toBeCalledWith('comment-123');
    expect(mockReplyRepository.getReplyByCommentId).toBeCalledWith('comment-123');
  });
});