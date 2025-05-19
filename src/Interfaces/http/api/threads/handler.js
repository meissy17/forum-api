const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetDetailThreadUseCase = require('../../../../Applications/use_case/GetDetailThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getDetailThreadHandler = this.getDetailThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);

    //console.log(owner);

    const addedThread = await addThreadUseCase.execute({
      ...request.payload,
      owner,
    });

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getDetailThreadHandler(request, h) {
    const { threadId } = request.params;
    const getDetailThreadUseCase = this._container.getInstance(GetDetailThreadUseCase.name);

    const detailThread = await getDetailThreadUseCase.execute({ threadId });

    const response = h.response({
      status: 'success',
      data: {
        thread: detailThread,
      },
    });
    response.code(200);
    return response;

    // try {
    //   const detailThread = await getDetailThreadUseCase.execute({ threadId });

    //   const response = h.response({
    //     status: 'success',
    //     data: {
    //       detailThread,
    //     },
    //   });
    //   response.code(201);
    //   return response;
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

module.exports = ThreadsHandler;