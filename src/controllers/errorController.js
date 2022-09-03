export default (err, req, res, next) => {
    console.log(err);

    res.status(400).send({
        message: 'Something went wrong on our end.',
        error: err.toString(),
        status: 'fail',
    });
};
