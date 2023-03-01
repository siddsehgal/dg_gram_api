export default (err, req, res, next) => {
  // Handle Global unhandled exceptions
  console.log('----Global Error Controller----');
  console.log(err);

  // Sending Error Response
  res.status(500).send({
    message: 'Something went wrong on our end.',
    error: err.toString(),
    status: 'fail',
  });
};
