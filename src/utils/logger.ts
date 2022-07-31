/* eslint-disable func-names, no-console */
type DebuggerFunctionT = {
    log: typeof console.log;
    info: typeof console.info;
    error: typeof console.error;
};

declare global {
    interface Window { debug: DebuggerFunctionT }
}

function setDebug() {
    if (process.env.NODE_ENV === "development") {
      window.debug = {
        log: window.console.log.bind(window.console),
        error: window.console.error.bind(window.console),
        info: window.console.info.bind(window.console),
      };
    } else {
      const noop = function() {};
  
      window.debug = {
        log: noop,
        error: noop,
        info: noop
      }
    }
  }

export default setDebug;