/* eslint-disable no-console */
const log: typeof console.log = value => {
    if (process.env.NODE_ENV === "development") console.log(value);
}

const info: typeof console.info = value => {
    if (process.env.NODE_ENV === "development") console.info(value);
}

const error: typeof console.error = value => {
    if (process.env.NODE_ENV === "development") console.error(value);
}

export {
    log,
    info,
    error
}