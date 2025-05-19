const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding', password: 'secret_password', fullname: 'Dicoding Indonesia' });
    await ThreadsTableTestHelper.addThreads({ id: 'thread-123', title: 'Title #1', body: 'Body #1', owner: 'user-123' });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('verifyCommentId function', () => {
    it('should throw NotFoundError when id not available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentId('comment-234')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when id available', async () => {
      // Arrange
      const addComment = new AddComment({
        threadId: 'thread-123',
        content: 'Comment Test #1',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await commentRepositoryPostgres.addComment(addComment);

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentId('comment-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    beforeEach(async () => {
      const addComment = new AddComment({
        threadId: 'thread-123',
        content: 'Comment Test #1',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await commentRepositoryPostgres.addComment(addComment);
    });

    it('should throw AuthorizationError when deleted by not owner', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-234')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when deleted by owner', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123')).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('addComment function', () => {
    it('should persist add comment', async () => {
      // Arrange
      const addComment = new AddComment({
        threadId: 'thread-123',
        content: 'Comment Test #1',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(addComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({
        threadId: 'thread-123',
        content: 'Comment Test #1',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(addComment);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'Comment Test #1',
        owner: 'user-123',
      }));
    });
  });

  describe('deleteComment function', () => {
    it('should persist delete comment', async () => {
      // Arrange
      const addComment = new AddComment({
        threadId: 'thread-123',
        content: 'Comment Test #1',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await commentRepositoryPostgres.addComment(addComment);

      // Action
      await commentRepositoryPostgres.deleteComment('comment-123');

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should update the is_deleted column correctly', async () => {
      // Arrange
      const addComment = new AddComment({
        threadId: 'thread-123',
        content: 'Comment Test #1',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await commentRepositoryPostgres.addComment(addComment);

      // Action
      await commentRepositoryPostgres.deleteComment('comment-123');

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments[0].is_deleted).toEqual(true);
    });
  });

  describe('getCommentByThreadId function', () => {
    it('should persist get comment by threadId', async () => {
      // Arrange
      await CommentsTableTestHelper.addComments({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComments({ id: 'comment-234', threadId: 'thread-123', content: 'Comment #2', owner: 'user-123' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // Action
      const comments = await commentRepositoryPostgres.getCommentByThreadId('thread-123');

      // Assert
      expect(comments).toHaveLength(2);
    });
    it('should return detail comment correctly', async () => {
      // Arrange
      const expectedComment = {
        id: 'comment-123',
        content: 'comment test',
        username: 'dicoding',
        date: '2025-05-05',
        isDeleted: false,
      };
      await CommentsTableTestHelper.addComments({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // Action
      const comments = await commentRepositoryPostgres.getCommentByThreadId('thread-123');

      // Assert
      expect(comments[0]).toEqual(expectedComment);
    });
  });
});