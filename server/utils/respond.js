export const respond = (res, message, statuscode, success, payload = null, errorCode = null) => {
    const response = { message, success, status: statuscode };
    if (payload !== null) response.payload = payload;
    if (errorCode !== null) response.errorCode = errorCode;
    res.status(response.status).json(response);
};