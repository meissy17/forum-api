const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding', password: 'secret_password', fullname: 'Dicoding Indonesia' });
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist add thread', async () => {
      // Arrange
      const addThread = new AddThread({
        title: 'Title #1',
        body: 'Body #1',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(addThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const addThread = new AddThread({
        title: 'Title #1',
        body: 'Body #1',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(addThread);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'Title #1',
        owner: 'user-123',
      }));
    });
  });

  describe('verifyThreadId function', () => {
    it('should throw NotFoundError when threadId not available', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadId('thread-234')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when threadId available', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThreads({ id: 'thread-123', title: 'Title #1', body: 'Body #1', owner: 'user-123' });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadId('thread-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getThreadById function', () => {
    it('should persist get thread by id and return detail thread correctly', async () => {
      // Arrange
      const expectedThread = {
        id: 'thread-123',
        title: 'threads title test',
        body: 'threads body test',
        date: '2025-05-05',
        username: 'dicoding',
      };
      await ThreadsTableTestHelper.addThreads({ id: 'thread-123', owner: 'user-123' });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action
      const threads = await threadRepositoryPostgres.getThreadbyId('thread-123');

      // Assert
      expect(threads).toBeDefined();
      expect(threads).toEqual(expectedThread);
    });
  });
});