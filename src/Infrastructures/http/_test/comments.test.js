const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'Comment #1',
      };

      const server = await createServer(container);
      const { id, accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThreads({ id: threadId = 'thread-123', owner: id });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {};
      const server = await createServer(container);

      const { id, accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThreads({ id: threadId = 'thread-123', owner: id });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: 123,
      };
      const server = await createServer(container);

      const { id, accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThreads({ id: threadId = 'thread-123', owner: id });


      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai');
    });

    it('should response 401 when tried to add comment without login', async () => {
      // Arrange
      const requestPayload = {
        content: 'Comment #1'
      };
      const server = await createServer(container);

      await UsersTableTestHelper.addUser(id = 'user-123');
      await ThreadsTableTestHelper.addThreads({ id: threadId = 'thread-123', owner: id = 'user-123' });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when tried to add comment with invalid threadId', async () => {
      // Arrange
      const requestPayload = {
        content: 'Comment #1',
      };

      const server = await createServer(container);
      const { accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/xxx/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and deleted comment', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';


      const server = await createServer(container);
      const { id, accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThreads({ id: threadId, owner: id });
      await CommentsTableTestHelper.addComments({ threadId: threadId, owner: id });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 404 when commentId not found', async () => {
      // Arrange
      const threadId = 'thread-123';


      const server = await createServer(container);
      const { id, accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThreads({ id: threadId, owner: id });
      await CommentsTableTestHelper.addComments({ threadId: threadId, owner: id });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/comment-234`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Comment tidak ditemukan');
    });

    it('should response 404 when threadId not found', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';


      const server = await createServer(container);
      const { id, accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThreads({ id: threadId, owner: id });
      await CommentsTableTestHelper.addComments({ threadId: threadId, owner: id });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/thread-234/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });


    it('should response 401 when tried to delete comment without login', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';


      const server = await createServer(container);
      const { id } = await AuthenticationsTableTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThreads({ id: threadId, owner: id });
      await CommentsTableTestHelper.addComments({ threadId: threadId, owner: id });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,

      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });

  it('should response 403 when tried to delete comment not by the owner of the comment', async () => {
    // Arrange
    const threadId = 'thread-123';
    const commentId = 'comment-123';


    const server = await createServer(container);
    await UsersTableTestHelper.addUser({ id: 'user-234', username: 'johndoe', password: 'secret', fullname: 'John Doe' });
    const { id, accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
    await ThreadsTableTestHelper.addThreads({ id: threadId, owner: id });
    await CommentsTableTestHelper.addComments({ threadId: threadId, owner: 'user-234' });

    // Action
    const response = await server.inject({
      method: 'DELETE',
      url: `/threads/${threadId}/comments/${commentId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(403);
    expect(responseJson.status).toEqual('fail');
    expect(responseJson.message).toEqual('Anda tidak dapat menghapus comment ini');
  });
});

