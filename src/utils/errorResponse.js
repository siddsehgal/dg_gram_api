export default function ErrorResponse(obj, statusCode, res) {
  res.status(statusCode).json({
    success: false,
    ...obj,
  });
}
