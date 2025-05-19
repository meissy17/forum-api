const DetailThread = require('../DetailThread');

describe('an DetailThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'ABC',
      username: 'user-123',
    };

    // Action and Assert
    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: 'Title #1',
      body: true,
      date: true,
      username: 'user-123',
      comments: 'aabbcc',
    };

    // Action and Assert
    expect(() =>  new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addedThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Title #1',
      body: 'Body Title',
      date: '2024-01-01',
      username: 'user-123',
      comments: ['abc', 'def'],
    };

    // Action
    const detailThread = new DetailThread(payload);

    // Assert
    expect(detailThread.id).toEqual(payload.id);
    expect(detailThread.title).toEqual(payload.title);
    expect(detailThread.body).toEqual(payload.body);
    expect(detailThread.date).toEqual(payload.date);
    expect(detailThread.username).toEqual(payload.username);
    expect(detailThread.comments).toEqual(payload.comments);
  });
});