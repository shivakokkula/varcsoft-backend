module.exports = (err, req, res, next) => {
    let { statusCode, message } = err;
    console.log(err);
    res.status(statusCode || 500).json(message ||  "Internal Server Error");
}
