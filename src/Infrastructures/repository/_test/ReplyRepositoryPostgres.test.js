const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');

describe('ReplyRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding', password: 'secret_password', fullname: 'Dicoding Indonesia' });
    await ThreadsTableTestHelper.addThreads({ id: 'thread-123', title: 'Title #1', body: 'Body #1', owner: 'user-123' });
    await CommentsTableTestHelper.addComments({ id: 'comment-123', threadId: 'thread-123', content: 'Comment #1', owner: 'user-123' });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('verifyReplyId function', () => {
    it('should throw NotFoundError when id not available', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyId('reply-234')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when id available', async () => {
      // Arrange
      const addReply = new AddReply({
        commentId: 'comment-123',
        content: 'Reply Content',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      await replyRepositoryPostgres.addReply(addReply);

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyId('reply-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    beforeEach(async () => {
      await RepliesTableTestHelper.addReplies({ id: 'reply-123', commentId: 'comment-123', content: 'Reply Content', owner: 'user-123' });
    });

    it('should throw AuthorizationError when deleted by not owner', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-234')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when deleted by owner', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123')).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('addReply function', () => {
    it('should persist add reply', async () => {
      // Arrange
      const addReply = new AddReply({
        commentId: 'comment-123',
        content: 'Reply Content',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepositoryPostgres.addReply(addReply);

      // Assert
      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies).toHaveLength(1);
    });

    it('should return added reply correctly', async () => {
      // Arrange
      const addReply = new AddReply({
        commentId: 'comment-123',
        content: 'Reply Content',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(addReply);

      // Assert
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        commentId: 'comment-123',
        content: 'Reply Content',
        owner: 'user-123',
      }));
    });
  });

  describe('deleteReply function', () => {
    beforeEach(async () => {
      await RepliesTableTestHelper.addReplies({ id: 'reply-123', commentId: 'comment-123', content: 'Reply Content', owner: 'user-123' });
    });

    it('should persist delete reply', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);

      // Action
      await replyRepositoryPostgres.deleteReply('reply-123');

      // Assert
      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies).toHaveLength(1);
    });

    it('should update the is_deleted column correctly', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);

      // Action
      await replyRepositoryPostgres.deleteReply('reply-123');

      // Assert
      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies[0].is_deleted).toEqual(true);
    });
  });

  describe('getReplyByCommentId function', () => {
    it('should persist get reply by commentId', async () => {
      // Arrange
      await RepliesTableTestHelper.addReplies({ id: 'reply-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReplies({ id: 'reply-234', threadId: 'thread-123', content: 'Reply Content #2', owner: 'user-123' });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);

      // Action
      const replies = await replyRepositoryPostgres.getReplyByCommentId('comment-123');

      // Assert
      expect(replies).toHaveLength(2);
    });

    it('should return detail reply correctly', async () => {
      // Arrange
      const expectedReply = {
        id: 'reply-123',
        content: 'reply test',
        username: 'dicoding',
        date: '2025-05-05',
        isDeleted: false,
      };
      await RepliesTableTestHelper.addReplies({ id: 'reply-123', threadId: 'thread-123', owner: 'user-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);

      // Action
      const replies = await replyRepositoryPostgres.getReplyByCommentId('comment-123');

      // Assert
      expect(replies[0]).toEqual(expectedReply);
    });
  });
});