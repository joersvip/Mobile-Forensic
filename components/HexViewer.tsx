'use client';

import React, { useMemo } from 'react';

interface HexViewerProps {
  content: string | Uint8Array;
  fileName: string;
}

export default function HexViewer({ content, fileName }: HexViewerProps) {
  const hexRows = useMemo(() => {
    let bytes: Uint8Array;
    if (typeof content === 'string') {
      bytes = new TextEncoder().encode(content);
    } else {
      bytes = content;
    }

    const rows: { offset: string; hex: string[]; ascii: string }[] = [];
    const chunkSize = 16;

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize);
      const offset = i.toString(16).padStart(8, '0').toUpperCase();
      
      const hexArr: string[] = [];
      let asciiStr = '';

      for (let j = 0; j < chunkSize; j++) {
        if (j < chunk.length) {
          const byte = chunk[j];
          hexArr.push(byte.toString(16).padStart(2, '0').toUpperCase());
          // Printable characters (ASCII 32 to 126)
          asciiStr += (byte >= 32 && byte <= 126) ? String.fromCharCode(byte) : '.';
        } else {
          hexArr.push('  ');
          asciiStr += ' ';
        }
      }

      rows.push({
        offset,
        hex: hexArr,
        ascii: asciiStr,
      });
    }

    return rows;
  }, [content]);

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 text-slate-400">
        <span className="truncate">HEX STREAM Viewer - {fileName}</span>
        <span className="text-cyan-500 text-[10px] uppercase font-semibold">Forensic Dump Mode</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 select-all text-slate-300 antialiased leading-relaxed max-h-[400px]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-slate-500 border-b border-slate-900 pb-1 block">
              <th className="text-left w-20 font-bold block">Offset</th>
              <th className="text-left flex-1 px-4 font-bold block">Hex Values (00-0F)</th>
              <th className="text-left w-36 font-bold block">ASCII</th>
            </tr>
          </thead>
          <tbody className="block pt-2">
            {hexRows.slice(0, 100).map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-900 flex py-0.5 leading-none">
                <td className="text-cyan-600 font-semibold w-20">{row.offset}</td>
                <td className="flex-1 px-4 text-slate-300 flex space-x-1">
                  {row.hex.map((val, hIdx) => (
                    <span 
                      key={hIdx} 
                      className={`inline-block w-5 text-center ${val === '00' ? 'text-slate-600' : 'text-slate-300'}`}
                    >
                      {val}
                    </span>
                  ))}
                </td>
                <td className="text-emerald-500 w-36 border-l border-slate-900 pl-4">{row.ascii}</td>
              </tr>
            ))}
            {hexRows.length > 100 && (
              <tr className="text-slate-500 italic py-2 text-center block">
                <td>... Truncated for performance ({hexRows.length - 100} remaining rows) ...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
