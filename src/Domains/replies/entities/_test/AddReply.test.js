const AddReply = require('../AddReply');

describe('an AddReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new AddReply(payload)).toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: true,
    };

    // Action and Assert
    expect(() => new AddReply(payload)).toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addReply object correctly', () => {
    // Arrange
    const payload = {
      content: 'Reply Test #1',
      commentId: 'comment-`123',
      owner: 'user-123',
      thread: 'thread-123',
    };

    // Action
    const { content, commentId, owner, threadId } = new AddReply(payload);

    // Assert
    expect(content).toEqual(payload.content);
    expect(commentId).toEqual(payload.commentId);
    expect(owner).toEqual(payload.owner);
    expect(threadId).toEqual(payload.threadId);
  });
});