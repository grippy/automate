import {
  addColors,
  createLogger,
  format,
  Logger,
  transports,
} from 'npm:winston@3';

const { combine, timestamp, label, printf, colorize } = format;

const logLevel = Deno.env.get('AUTOMATE_LOG_LEVEL') || 'info';
const logTimestamp = Deno.env.get('AUTOMATE_LOG_TIMESTAMP') || 'false';

const customFormat = printf(({ level, message, label, timestamp }) => {
  if (logTimestamp === 'false') {
    return `[${level}] ${label}: ${message}`;
  } else {
    return `[${level}] ${timestamp} ${label}: ${message}`;
  }
});

export function Category(category: string): Logger {
  return createLogger({
    format: combine(
      colorize(),
      label({ label: category }),
      timestamp(),
      customFormat,
    ),
    transports: [new transports.Console({ level: logLevel })],
  });
}
