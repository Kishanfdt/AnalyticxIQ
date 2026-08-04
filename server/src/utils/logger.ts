export class Logger {
  private static format(level: 'INFO' | 'WARN' | 'ERROR', message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` | Meta: ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaString}`;
  }

  static info(message: string, meta?: any) {
    console.log(this.format('INFO', message, meta));
  }

  static warn(message: string, meta?: any) {
    console.warn(this.format('WARN', message, meta));
  }

  static error(message: string, error?: any, meta?: any) {
    let errorDetail = '';
    if (error instanceof Error) {
      errorDetail = ` | Error: ${error.message}\nStack: ${error.stack}`;
    } else if (error) {
      errorDetail = ` | Error: ${JSON.stringify(error)}`;
    }
    console.error(this.format('ERROR', message, meta) + errorDetail);
  }
}
export default Logger;
