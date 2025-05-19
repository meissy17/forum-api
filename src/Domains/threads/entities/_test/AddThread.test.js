const AddThread = require('../AddThread');

describe('an AddThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'abc',
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      title: 'Title',
      body: true,
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create adddThread object correctly', () => {
    // Arrange
    const payload = {
      title: 'Title #1',
      body: 'Body #1',
      owner: 'user-123',
    };

    // Action
    const { title, body, owner } = new AddThread(payload);

    // Assert
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(owner).toEqual(payload.owner);
  });
});