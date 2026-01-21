const notFound = (req, res, next) => {
    console.log(req.originalUrl);
    const error = new Error(`ไม่พบหน้าเว็บที่ต้องการ - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    console.log(err);

    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        message = 'ไม่พบข้อมูล: รูปแบบ ID ไม่ถูกต้อง';
    }

    //production
    res.status(statusCode).json({
        message: message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

export { notFound, errorHandler };