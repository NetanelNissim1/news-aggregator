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

    // Format the date
    const now = new Date();
    const timestamp = now.toISOString();

    // Format the log entry
    let logEntry = `[${timestamp}] [${type.toUpperCase()}] [URL: ${urlPath}] - ${message}\n`;
    if (stack) {
      logEntry += `Stack Trace:\n${stack}\n`;
    }

    // Append to the correct file
    await fs.promises.appendFile(logFilePath, logEntry, 'utf8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to write to log file:', error);
    return NextResponse.json({ error: 'Failed to write log' }, { status: 500 });
  }
}
