type LogLevel = "debug" | "info" | "warn" | "error"

type LogFields = Record<string, unknown>

function emit(level: LogLevel, message: string, fields?: LogFields) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    msg: message,
    service: "queveohoy",
    ...fields,
  }

  const line = JSON.stringify(payload)

  if (level === "error") {
    console.error(line)
    return
  }
  if (level === "warn") {
    console.warn(line)
    return
  }
  if (level === "debug" && process.env.NODE_ENV === "production") {
    return
  }
  console.log(line)
}

export const log = {
  debug: (message: string, fields?: LogFields) => emit("debug", message, fields),
  info: (message: string, fields?: LogFields) => emit("info", message, fields),
  warn: (message: string, fields?: LogFields) => emit("warn", message, fields),
  error: (message: string, fields?: LogFields) => emit("error", message, fields),
}
