const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'Reply Content',
      };


      const server = await createServer(container);
      const { id, accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThreads({ id: threadId = 'thread-123', owner: id });
      await CommentsTableTestHelper.addComments({ id: commentId = 'comment-123', threadId: 'thread-123', owner: id });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {};
      const server = await createServer(container);

      const { id, accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThreads({ id: threadId = 'thread-123', owner: id });
      await CommentsTableTestHelper.addComments({ id: commentId = 'comment-123', threadId: 'thread-123', owner: id });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: 123,
      };
      const server = await createServer(container);

      const { id, accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThreads({ id: threadId = 'thread-123', owner: id });
      await CommentsTableTestHelper.addComments({ id: commentId = 'comment-123', threadId: 'thread-123', owner: id });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena tipe data tidak sesuai');
    });

    it('should response 401 when tried to add reply without login', async () => {
      // Arrange
      const requestPayload = {
        content: 'Reply Content'
      };
      const server = await createServer(container);

      await UsersTableTestHelper.addUser(id = 'user-123');
      await ThreadsTableTestHelper.addThreads({ id: threadId = 'thread-123', owner: id = 'user-123' });
      await CommentsTableTestHelper.addComments({ id: commentId = 'comment-123', threadId: 'thread-123', owner: id });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when tried to add reply with invalid threadId', async () => {
      // Arrange
      const requestPayload = {
        content: 'Reply Content',
      };


      const server = await createServer(container);
      const { id, accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThreads({ id: threadId = 'thread-123', owner: id });
      await CommentsTableTestHelper.addComments({ id: commentId = 'comment-123', threadId: 'thread-123', owner: id });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/xxx/comments/${commentId}/replies`,
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

    it('should response 404 when tried to add reply with invalid commentId', async () => {
      // Arrange
      const requestPayload = {
        content: 'Reply Content',
      };


      const server = await createServer(container);
      const { id, accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThreads({ id: threadId = 'thread-123', owner: id });
      await CommentsTableTestHelper.addComments({ id: commentId = 'comment-123', threadId: 'thread-123', owner: id });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/xxx/replies`,
        payload: requestPayload,
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

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 and deleted comment', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';


      const server = await createServer(container);
      const { id, accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThreads({ id: threadId, owner: id });
      await CommentsTableTestHelper.addComments({ id: commentId, threadId: threadId, owner: id });
      await RepliesTableTestHelper.addReplies({ id: replyId, threadId: threadId, commentId: commentId, owner: id });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
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
      const replyId = 'reply-123';


      const server = await createServer(container);
      const { id, accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThreads({ id: threadId, owner: id });
      await CommentsTableTestHelper.addComments({ threadId: threadId, owner: id });
      await RepliesTableTestHelper.addReplies({ id: replyId, threadId: threadId, commentId: 'comment-123', owner: id });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/comment-234/replies/${replyId}`,
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
      const replyId = 'reply-123';


      const server = await createServer(container);
      const { id, accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThreads({ id: threadId, owner: id });
      await CommentsTableTestHelper.addComments({ threadId: threadId, owner: id });
      await RepliesTableTestHelper.addReplies({ id: replyId, threadId: threadId, commentId: commentId, owner: id });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/thread-234/comments/${commentId}/replies/${replyId}`,
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

    it('should response 404 when replyId not found', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';


      const server = await createServer(container);
      const { id, accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThreads({ id: threadId, owner: id });
      await CommentsTableTestHelper.addComments({ threadId: threadId, owner: id });
      await RepliesTableTestHelper.addReplies({ id: replyId, threadId: threadId, commentId: commentId, owner: id });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/xxx`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Reply tidak ditemukan');
    });


    it('should response 401 when tried to delete comment without login', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';


      const server = await createServer(container);
      const { id } = await AuthenticationsTableTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThreads({ id: threadId, owner: id });
      await CommentsTableTestHelper.addComments({ threadId: threadId, owner: id });
      await RepliesTableTestHelper.addReplies({ id: replyId, threadId: threadId, commentId: commentId, owner: id });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
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
    const replyId = 'reply-123';


    const server = await createServer(container);
    await UsersTableTestHelper.addUser({ id: 'user-234', username: 'johndoe', password: 'secret', fullname: 'John Doe' });
    const { id, accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
    await ThreadsTableTestHelper.addThreads({ id: threadId, owner: id });
    await CommentsTableTestHelper.addComments({ threadId: threadId, owner: id });
    await RepliesTableTestHelper.addReplies({ id: replyId, threadId: threadId, commentId: commentId, owner: 'user-234' });

    // Action
    const response = await server.inject({
      method: 'DELETE',
      url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(403);
    expect(responseJson.status).toEqual('fail');
    expect(responseJson.message).toEqual('Anda tidak dapat menghapus reply ini');
  });
});

