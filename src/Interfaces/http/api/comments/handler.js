const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { threadId } = request.params;
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);

    const addedComment = await addCommentUseCase.execute({
      ...request.payload,
      threadId,
      owner,
    });

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;

    //       console.log(addedComment);
    //       console.log(threadId);

    //       const addedComment = await addCommentUseCase.execute({
    //     ...request.payload,
    //     threadId,
    //     owner,
    //   });

    //   const response = h.response({
    //     status: 'success',
    //     data: {
    //       addedComment,
    //     },
    //   });
    //   response.code(201);
    //   return response;

    // try {
    //   const addedComment = await addCommentUseCase.execute({
    //     ...request.payload,
    //     threadId,
    //     owner,
    //   });

    //   const response = h.response({
    //     status: 'success',
    //     data: {
    //       addedComment,
    //     },
    //   });
    //   response.code(201);
    //   return response;
    // } catch (error) {
    //   console.error(error); // 👈 Make sure this is here
    //   return h.response({
    //     status: 'fail',
    //     message: error.message,
    //   }).code(500);
    // }

    // try {
    //   const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    //   const useCasePayload = {
    //     content: request.payload.content,
    //     threadId: request.params.threadId,
    //     owner: request.auth.credentials.id,
    //   };

    //   const addedComment = await addCommentUseCase.execute(useCasePayload);

    //   return h.response({
    //     status: 'success',
    //     data: {
    //       addedComment,
    //     },
    //   }).code(201);
    // } catch (error) {
    //   console.error('Post Comment Error:', error); // 🔍 Debug log
    //   return h.response({
    //     status: 'fail',
    //     message: error.message,
    //   }).code(500);
    // }
  }

  async deleteCommentHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);

    await deleteCommentUseCase.execute(
      { threadId, commentId },
      owner,
    );

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = CommentsHandler;