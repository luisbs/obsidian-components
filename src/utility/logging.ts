export type LogLevelValue = 0b00 | 0b01 | 0b10 | 0b11
export const LogLevel: Record<string, LogLevelValue> = {
  DEBUG: 0b00,
  INFO: 0b01,
  WARN: 0b10,
  ERROR: 0b11,
}

export interface LogEntry {
  level: LogLevelValue
  data: unknown[]
}

export class Logger {
  static formatTimestamp(timestamp: Date): string {
    //2021-05-04 13:14:15.012
    return (
      //timestamp.getFullYear() +
      //'-' +
      //String(timestamp.getMonth() + 1).padStart(2, '0') +
      //'-' +
      //String(timestamp.getDate()).padStart(2, '0') +
      //' ' +
      String(timestamp.getHours()).padStart(2, '0') +
      ':' +
      String(timestamp.getMinutes()).padStart(2, '0') +
      ':' +
      String(timestamp.getSeconds()).padStart(2, '0') +
      '.' +
      String(timestamp.getMilliseconds()).padStart(3, '0')
    )
  }

  static withTs(data: unknown[]): unknown[] {
    data.unshift(Logger.formatTimestamp(new Date()))
    return data
  }

  group(...data: unknown[]): LoggingGroup {
    return LoggingGroup.make(...data)
  }

  debug(...data: unknown[]): void {
    console.debug(...Logger.withTs(data))
  }
  info(...data: unknown[]): void {
    console.log(...Logger.withTs(data))
  }
  warn(...data: unknown[]): void {
    console.warn(...Logger.withTs(data))
  }
  error(...data: unknown[]): void {
    console.error(...Logger.withTs(data))
  }

  log(level: LogLevelValue, data: unknown[]): void {
    switch (level) {
      case LogLevel.ERROR:
        return console.error(...data)
      case LogLevel.WARN:
        return console.warn(...data)
      case LogLevel.INFO:
        return console.log(...data)
      default:
        return console.debug(...data)
    }
  }
}

export class LoggingGroup extends Logger {
  #logs: LogEntry[] = []

  static make(...data: unknown[]): LoggingGroup {
    const self = new LoggingGroup()
    self.info(...data)
    return self
  }

  debug(...data: unknown[]): void {
    this.#logs.push({ level: LogLevel.DEBUG, data: Logger.withTs(data) })
  }
  info(...data: unknown[]): void {
    this.#logs.push({ level: LogLevel.INFO, data: Logger.withTs(data) })
  }
  warn(...data: unknown[]): void {
    this.#logs.push({ level: LogLevel.WARN, data: Logger.withTs(data) })
  }
  error(...data: unknown[]): void {
    this.#logs.push({ level: LogLevel.ERROR, data: Logger.withTs(data) })
  }

  flush(...data: unknown[]): void {
    console.groupCollapsed(...Logger.withTs(data))
    for (const entry of this.#logs) {
      this.log(entry.level, entry.data)
    }
    console.groupEnd()
  }
}
