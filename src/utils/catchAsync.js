// export default function catchAsync(...args) {
//     try {
//         console.log('In CatchAsync');
//         console.log(args[0]);
//     } catch (error) {}
// }

export default (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
