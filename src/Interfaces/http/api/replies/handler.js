const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class ReplyHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);

    const addedReply = await addReplyUseCase.execute({
      ...request.payload,
      commentId,
      owner,
      threadId
    });

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId, replyId } = request.params;
    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);

    await deleteReplyUseCase.execute(
      { threadId, commentId, replyId },
      owner,
    );

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;

    //     try {
    //       const { id: owner } = request.auth.credentials;
    //       const { threadId, commentId, replyId } = request.params;
    //       const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);

    //           await deleteReplyUseCase.execute(
    //             { threadId, commentId, replyId },
    //             owner,
    //           );

    //           const response = h.response({
    //             status: 'success',
    //           });
    //           response.code(200);
    //           return response;
    // } catch (error) {
    //   console.error('Error in getDetailThreadHandler:', error);
    //   // Optional: return more descriptive error if needed
    //   const response = h.response({
    //     status: 'fail',
    //     message: error.message,
    //   });
    //   response.code(500);
    //   return response;
    // }
  }
}

module.exports = ReplyHandler;