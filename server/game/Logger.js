export class Logger {
  constructor(writer) {
    if (Logger.instance instanceof Logger) {
      return Logger.instance;
    }
    this._writer = writer;
    if (!this._writer) {
      throw new Error("Writer is required");
    }
    if (
      !this._writer.log ||
      !this._writer.error ||
      !this._writer.warn ||
      !this._writer.debug ||
      !this._writer.trace
    ) {
      throw new Error(
        "Writer must implement log, error, warn, debug, and trace",
      );
    }
  }

  info(message) {
    this._writer.log(`[INFO] ${message}`);
  }

  error(message) {
    this._writer.error(`[ERROR] ${message}`);
  }

  warn(message) {
    this._writer.warn(`[WARN] ${message}`);
  }

  debug(message) {
    this._writer.debug(`[DEBUG] ${message}`);
  }

  log(message) {
    this._writer.log(`[LOG] ${message}`);
  }

  trace(message) {
    this._writer.trace(`[TRACE] ${message}`);
  }
}
