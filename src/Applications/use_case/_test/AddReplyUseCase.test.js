const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AddReplyUseCase = require('../AddReplyUseCase');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddReplyUseCase', () => {
  it('should orchestrate the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Reply Comment #1',
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const mockAddedReply = new AddedReply({
      id: 'reply-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
      content: useCasePayload.content,
      owner: 'user-123',
    });

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadId = jest.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentId = jest.fn().mockResolvedValue();
    mockReplyRepository.addReply = jest.fn(() =>
      Promise.resolve(new AddedReply({
        id: 'reply-123',
        content: 'Reply Comment #1',
        commentId: 'comment-123',
        owner: 'user-123',
      }))
    );

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(useCasePayload);

    // Assert
    expect(addedReply).toBeInstanceOf(AddedReply);
    expect(addedReply).toStrictEqual(mockAddedReply);
    expect(mockThreadRepository.verifyThreadId).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentId).toBeCalledWith(useCasePayload.commentId);
    expect(mockReplyRepository.addReply).toBeCalledWith(new AddReply({
      content: useCasePayload.content,
      commentId: useCasePayload.commentId,
      threadId: useCasePayload.threadId,
      owner: useCasePayload.owner,
    }));
  });
});