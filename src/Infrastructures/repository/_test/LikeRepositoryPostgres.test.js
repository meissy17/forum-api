const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const AddLike = require('../../../Domains/likes/entities/AddLike');

describe('LikeRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding', password: 'secret_password', fullname: 'Dicoding Indonesia' });
    await UsersTableTestHelper.addUser({ id: 'user-234', username: 'dicodingg', password: 'secret_password', fullname: 'Dicoding' });
    await ThreadsTableTestHelper.addThreads({ id: 'thread-123', title: 'Title #1', body: 'Body #1', owner: 'user-123' });
    await CommentsTableTestHelper.addComments({ id: 'comment-123', threadId: 'thread-123', content: 'Comment #1', owner: 'user-123' });
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('verifyLikeExisting function', () => {
    it('should throw false when like not exist', async () => {
      await LikesTableTestHelper.cleanTable();
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const result = await likeRepositoryPostgres.verifyLikeExisting({ commentId: 'comment-123', userId: 'user-123' });

      // Assert
      expect(result).toEqual(false);
    });
    it('should throw true when like exist', async () => {
      // Arrange
      await LikesTableTestHelper.addLike({ id: 'like-123' });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const result = await likeRepositoryPostgres.verifyLikeExisting({ commentId: 'comment-123', userId: 'user-123' });

      // Assert
      expect(result).toEqual(true);
    });
  });

  describe('addLike function', () => {
    it('should persist add like', async () => {
      // Arrange
      const addLike = new AddLike({
        commentId: 'comment-123',
        userId: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.addLike(addLike);

      // Assert
      const likes = await LikesTableTestHelper.findLikeById('like-123');
      expect(likes).toHaveLength(1);
    });

    it('should return added reply correctly', async () => {
      // Arrange
      const addLike = new AddLike({
        commentId: 'comment-123',
        userId: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedLike = await likeRepositoryPostgres.addLike(addLike);

      // Assert
      expect(addedLike[0].id).toEqual('like-123');
    });
  });

  describe('deleteLike function', () => {
    beforeEach(async () => {
      await LikesTableTestHelper.addLike({ id: 'like-123' });
    });

    it('should persist delete likes', async () => {
      // Arrange
      const likeData = new AddLike({
        commentId: 'comment-123',
        userId: 'user-123',
      });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);

      // Action
      await likeRepositoryPostgres.deleteLike(likeData);

      // Assert
      const likes = await LikesTableTestHelper.findLikeById('like-123');
      expect(likes).toHaveLength(0);
    });

  });

  describe('getLikeCountByCommentId function', () => {
    it('should persist get likes count by commentId', async () => {
      // Arrange
      await LikesTableTestHelper.addLike({ id: 'like-123' });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);

      // Action
      const likes = await likeRepositoryPostgres.getLikeCountByCommentId('comment-123');

      // Assert
      expect(likes).toHaveLength(1);
    });
  });
});