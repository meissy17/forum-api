const AddLikeUseCase = require('../../../../Applications/use_case/AddLikeUseCase');

class LikeHandler {
  constructor(container) {
    this._container = container;

    this.putLikeHandler = this.putLikeHandler.bind(this);
    //this.deleteLikeHandler = this.deleteLikeHandler.bind(this);
  }

  async putLikeHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const addLikeUseCase = this._container.getInstance(AddLikeUseCase.name);

    await addLikeUseCase.execute(
      { threadId, commentId },
      userId,
    );

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;

    //       try {
    //          const { id: userId } = request.auth.credentials;
    //   const { threadId, commentId } = request.params;
    //   const addLikeUseCase = this._container.getInstance(AddLikeUseCase.name);

    //   await addLikeUseCase.execute(
    //     { threadId, commentId },
    //     userId,
    //   );

  //   const response = h.response({
  //     status: 'success',
  //   });
  //   response.code(200);
  //   return response;
  //   } catch (error) {
  //     console.error('Error in putLikeHandler:', error);
  //     // Optional: return more descriptive error if needed
  //     const response = h.response({
  //       status: 'fail',
  //       message: error.message,
  //     });
  //     response.code(500);
  //     return response;
  //   }
  }


}

module.exports = LikeHandler;