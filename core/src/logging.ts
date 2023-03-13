import { winston } from '../deps.ts';

const { combine, timestamp, label, printf, colorize } = winston.format;

const logLevel = Deno.env.get('AUTOMATE_LOG_LEVEL') || 'info';
const logTimestamp = Deno.env.get('AUTOMATE_LOG_TIMESTAMP') || 'false';

const customFormat = printf(({ level, message, label, timestamp }) => {
  if (logTimestamp === 'false') {
    return `[${level}] ${label}: ${message}`;
  } else {
    return `[${level}] ${timestamp} ${label}: ${message}`;
  }
});

export function Category(category: string): winston.Logger {
  return winston.createLogger({
    format: combine(
      colorize(),
      label({ label: category }),
      timestamp(),
      customFormat,
    ),
    transports: [new winston.transports.Console({ level: logLevel })],
  });
}
