const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 201 and add likes if no existing likes found', async () => {
      // Arrange
      const server = await createServer(container);
      const { id, accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThreads({ id: threadId = 'thread-123', owner: id });
      await CommentsTableTestHelper.addComments({ id: commentId = 'comment-123', threadId: 'thread-123', owner: id });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 201 and delete likes if existing likes found', async () => {
      // Arrange
      const server = await createServer(container);
      const { id, accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThreads({ id: threadId = 'thread-123', owner: id });
      await CommentsTableTestHelper.addComments({ id: commentId = 'comment-123', threadId: 'thread-123', owner: id });
      await LikesTableTestHelper.addLike({ id: 'like-123', userId: id });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 401 when tried to like comment without login', async () => {
      // Arrange
      const server = await createServer(container);

      await UsersTableTestHelper.addUser(id = 'user-123');
      await ThreadsTableTestHelper.addThreads({ id: threadId = 'thread-123', owner: id = 'user-123' });
      await CommentsTableTestHelper.addComments({ id: commentId = 'comment-123', threadId: 'thread-123', owner: id });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 401 when tried to dislike comment without login', async () => {
      // Arrange
      const server = await createServer(container);

      await UsersTableTestHelper.addUser(id = 'user-123');
      await ThreadsTableTestHelper.addThreads({ id: threadId = 'thread-123', owner: id = 'user-123' });
      await CommentsTableTestHelper.addComments({ id: commentId = 'comment-123', threadId: 'thread-123', owner: id });
      await LikesTableTestHelper.addLike({ id: 'like-123', userId: 'user-123' });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when tried to like comment with invalid threadId', async () => {
      // Arrange
      const server = await createServer(container);
      const { id, accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThreads({ id: threadId = 'thread-123', owner: id });
      await CommentsTableTestHelper.addComments({ id: commentId = 'comment-123', threadId: 'thread-123', owner: id });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/xxx/comments/${commentId}/likes`,
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

    it('should response 404 when tried to like comment with invalid commentId', async () => {
      // Arrange
      const server = await createServer(container);
      const { id, accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThreads({ id: threadId = 'thread-123', owner: id });
      await CommentsTableTestHelper.addComments({ id: commentId = 'comment-123', threadId: 'thread-123', owner: id });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/xxx/likes`,
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

    it('should response 404 when tried to dislike comment with invalid threadId', async () => {
      // Arrange
      const server = await createServer(container);
      const { id, accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThreads({ id: threadId = 'thread-123', owner: id });
      await CommentsTableTestHelper.addComments({ id: commentId = 'comment-123', threadId: 'thread-123', owner: id });
      await LikesTableTestHelper.addLike({ id: 'like-123', userId: id });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/xxx/comments/${commentId}/likes`,
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

    it('should response 404 when tried to dislike comment with invalid commentId', async () => {
      // Arrange
      const server = await createServer(container);
      const { id, accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThreads({ id: threadId = 'thread-123', owner: id });
      await CommentsTableTestHelper.addComments({ id: commentId = 'comment-123', threadId: 'thread-123', owner: id });
      await LikesTableTestHelper.addLike({ id: 'like-123', userId: id });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/xxx/likes`,
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
  });
});

