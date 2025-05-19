const DetailReply = require('../DetailReply');

describe('an DetailReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'ABC',
    };

    // Action and Assert
    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: 'reply abc',
      date: [],
      username: 'user-123',
    };

    // Action and Assert
    expect(() =>  new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create detailComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'Reply #1',
      date: '2024-05-01',
      username: 'user-123',
    };

    // Action
    const detailReply = new DetailReply(payload);

    // Assert
    expect(detailReply.id).toEqual(payload.id);
    expect(detailReply.content).toEqual(payload.content);
    expect(detailReply.date).toEqual(payload.date);
    expect(detailReply.username).toEqual(payload.username);
  });
  it('should mapped detailReply.content correctly if isDeleted = true', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'Reply #1',
      date: '2024-05-01',
      username: 'user-123',
      isDeleted: true,
    };

    // Action
    const detailReply = new DetailReply(payload);

    // Assert
    expect(detailReply.id).toEqual(payload.id);
    expect(detailReply.content).toEqual('**balasan telah dihapus**');
    expect(detailReply.date).toEqual(payload.date);
    expect(detailReply.username).toEqual(payload.username);
  });
});