exports.response = (res, status, reason, message, developerMessage, data) =>{
  res.send({
    status: status,
    reason: reason,
    message: message,
    developerMessage: developerMessage,
    data: data,
  });
}
