import { exec } from 'child_process';
import { NextRequest, NextResponse } from 'next/server';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const { ipAddress } = await req.json();
    if (!ipAddress) {
      return NextResponse.json({ success: false, error: 'IP Address is required' }, { status: 400 });
    }
    
    // Sanitize the input to prevent command injection
    const sanitizedIp = ipAddress.replace(/[^a-zA-Z0-9.:_-]/g, '');
    
    // Execute adb connect <ip>
    const { stdout, stderr } = await execAsync(`adb connect ${sanitizedIp}`);
    
    if (stdout.includes('failed') || stderr) {
      return NextResponse.json({ 
        success: false, 
        message: stdout.trim(), 
        error: stderr || 'Connection failed' 
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: stdout.trim() 
    });
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: err.message || String(err) 
    }, { status: 500 });
  }
}
