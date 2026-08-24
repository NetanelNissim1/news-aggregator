import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const data = await request.json();
    const { type, message, level = 'info', stack = '', path: urlPath = '' } = data;

    // Validate level
    const validLevels = ['info', 'warning', 'error'];
    const safeLevel = validLevels.includes(level.toLowerCase()) ? level.toLowerCase() : 'info';

    // Construct log file path based on level
    const logFileName = `${safeLevel}.log`;
    const logFilePath = path.join(process.cwd(), logFileName);

    // Format the log entry
    let logEntry = `[${type.toUpperCase()}] [URL: ${urlPath}] - ${message}`;
    if (stack) {
      logEntry += `\nStack Trace:\n${stack}`;
    }

    // In production (Firebase/Vercel), local file writing is not supported.
    // We use standard console logging, which Firebase automatically captures in its Logs Viewer.
    if (process.env.NODE_ENV === 'production') {
      if (safeLevel === 'error') console.error(logEntry);
      else if (safeLevel === 'warning') console.warn(logEntry);
      else console.log(logEntry);
    } else {
      // In local development, write to physical .log files
      const logFileName = `${safeLevel}.log`;
      const logFilePath = path.join(process.cwd(), logFileName);
      const timestamp = new Date().toISOString();
      await fs.promises.appendFile(logFilePath, `[${timestamp}] ${logEntry}\n`, 'utf8');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to write to log file:', error);
    return NextResponse.json({ error: 'Failed to write log' }, { status: 500 });
  }
}
