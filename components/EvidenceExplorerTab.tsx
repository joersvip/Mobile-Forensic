'use client';

import React, { useState, useMemo } from 'react';
import { FolderTree, FileText, Search, Sliders, Image as ImageIcon, Download, Check, HelpCircle, Eye, FileDigit, Database, ArrowRight, MapPin } from 'lucide-react';
import { EvidenceFile, ConnectionStatus } from '../types/forensic';
import HexViewer from './HexViewer';

interface EvidenceExplorerTabProps {
  evidenceFiles: EvidenceFile[];
  status: ConnectionStatus;
  onAnalyzeDatabase: (dbName: string) => void;
  onLogActivity: (module: string, activity: string) => void;
}

// Tree node definition
interface FolderNode {
  name: string;
  path: string;
  children: { [key: string]: FolderNode };
  files: EvidenceFile[];
}

export default function EvidenceExplorerTab({
  evidenceFiles,
  status,
  onAnalyzeDatabase,
  onLogActivity
}: EvidenceExplorerTabProps) {
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [expandedFolders, setExpandedFolders] = useState<{ [key: string]: boolean }>({
    'root': true,
    'root/sdcard': true,
    'root/data': true
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [selectedFile, setSelectedFile] = useState<EvidenceFile | null>(null);
  const [previewMode, setPreviewMode] = useState<'preview' | 'hex' | 'metadata'>('preview');

  // Parse folder tree structure from file paths
  const folderTree = useMemo(() => {
    const root: FolderNode = { name: 'Root', path: 'root', children: {}, files: [] };

    evidenceFiles.forEach(file => {
      const parts = file.path.split('/').filter(Boolean);
      let current = root;
      let pathAccumulator = 'root';

      // We skip the file name itself (the last part) to build directory tree
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        pathAccumulator += '/' + part;
        if (!current.children[part]) {
          current.children[part] = {
            name: part,
            path: pathAccumulator,
            children: {},
            files: []
          };
        }
        current = current.children[part];
      }
      current.files.push(file);
    });

    return root;
  }, [evidenceFiles]);

  const toggleFolderExpand = (path: string) => {
    setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };

  // Filter and search files
  const filteredFiles = useMemo(() => {
    return evidenceFiles.filter(file => {
      // Folder filtering
      if (selectedFolder !== 'all') {
        const fileFolder = file.path.substring(0, file.path.lastIndexOf('/'));
        const targetFolderName = selectedFolder.replace('root/', '/');
        if (!fileFolder.includes(targetFolderName)) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== 'all' && file.category !== categoryFilter) {
        return false;
      }

      // Size filter
      if (sizeFilter !== 'all') {
        const sizeBytes = file.sizeBytes;
        if (sizeFilter === 'small' && sizeBytes > 1024 * 100) return false; // > 100KB
        if (sizeFilter === 'medium' && (sizeBytes <= 1024 * 100 || sizeBytes > 1024 * 1024 * 2)) return false; // 100KB to 2MB
        if (sizeFilter === 'large' && sizeBytes <= 1024 * 1024 * 2) return false; // < 2MB
      }

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = file.name.toLowerCase().includes(query);
        const matchesHash = file.sha256.toLowerCase().includes(query);
        const matchesMime = file.mimeType.toLowerCase().includes(query);
        const matchesContent = file.content?.toLowerCase().includes(query) || false;
        return matchesName || matchesHash || matchesMime || matchesContent;
      }

      return true;
    });
  }, [evidenceFiles, selectedFolder, categoryFilter, sizeFilter, searchQuery]);

  const handleFileSelect = (file: EvidenceFile) => {
    setSelectedFile(file);
    setPreviewMode('preview');
    onLogActivity('Evidence Explorer', `Viewed file artifact details: "${file.name}"`);
  };

  const handleExportFile = (file: EvidenceFile) => {
    // Simulated trigger of local download of the file contents
    const textToSave = file.content || `CRYPTO_HASH: ${file.sha256}\nMIME_TYPE: ${file.mimeType}\nSIZE: ${file.size}`;
    const blob = new Blob([textToSave], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Acquired_${file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onLogActivity('Evidence Explorer', `Exported and downloaded file copy: "${file.name}"`);
  };

  // Rendering folder branch recursively
  const renderFolderBranch = (node: FolderNode, depth = 0) => {
    const isExpanded = expandedFolders[node.path];
    const hasSubfolders = Object.keys(node.children).length > 0;
    
    return (
      <div key={node.path} className="select-none">
        <div 
          onClick={() => setSelectedFolder(node.path)}
          className={`flex items-center justify-between py-1 px-2 rounded-lg cursor-pointer text-xs transition-all ${
            selectedFolder === node.path
              ? 'bg-blue-500/10 text-blue-400 font-bold'
              : 'hover:bg-zinc-900/60 text-zinc-300'
          }`}
          style={{ paddingLeft: `${depth * 10 + 8}px` }}
        >
          <div className="flex items-center space-x-2 truncate">
            {hasSubfolders ? (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolderExpand(node.path);
                }} 
                className="text-zinc-500 hover:text-zinc-300 font-mono text-[10px] w-3 h-3 flex items-center justify-center border border-zinc-850 rounded bg-zinc-950 cursor-pointer"
              >
                {isExpanded ? '-' : '+'}
              </button>
            ) : (
              <span className="w-3" />
            )}
            <FolderTree className="w-3.5 h-3.5 shrink-0 text-blue-500" />
            <span className="truncate">{node.name}</span>
          </div>
          {node.files.length > 0 && (
            <span className="text-[9px] font-mono font-bold bg-zinc-950 border border-zinc-850 text-zinc-500 px-1.5 py-0.5 rounded-full shrink-0">
              {node.files.length}
            </span>
          )}
        </div>

        {isExpanded && hasSubfolders && (
          <div className="border-l border-zinc-900 ml-3.5 mt-0.5 space-y-0.5">
            {Object.values(node.children).map(child => renderFolderBranch(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 h-full">
      {status === 'DISCONNECTED' || evidenceFiles.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-lg h-80">
          <FolderTree className="w-12 h-12 text-zinc-700 mb-3 animate-pulse" />
          <h2 className="text-lg font-bold font-sans tracking-tight text-zinc-300">Evidence Browser Empty</h2>
          <p className="text-xs text-zinc-500 max-w-sm mt-1">
            Perform a logical acquisition to dump Android directories, database blocks, media caches, and index files.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-stretch h-full">
          {/* Column 1: Folder Tree Selection */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg flex flex-col h-[650px] overflow-hidden">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5 shrink-0">
              <FolderTree className="w-4 h-4 text-blue-500" />
              DIRECTORY TREE
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              <button
                onClick={() => setSelectedFolder('all')}
                className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
                  selectedFolder === 'all'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'bg-zinc-950 border border-zinc-900 text-zinc-400 hover:border-zinc-800'
                }`}
              >
                <span>📂 All Extracted Files</span>
              </button>
              
              <div className="pt-2 border-t border-zinc-900">
                {renderFolderBranch(folderTree)}
              </div>
            </div>
          </div>

          {/* Column 2: Files Grid and filtering */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg flex flex-col h-[650px] overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-4 border-b border-zinc-800/80 pb-3 shrink-0">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-500" />
                ACQUIRED ARTIFACTS ({filteredFiles.length})
              </h3>

              {/* Filters list */}
              <div className="flex flex-wrap gap-2 text-[10px]">
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-300 font-medium outline-none cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="picture">Pictures</option>
                  <option value="video">Videos</option>
                  <option value="document">Documents</option>
                  <option value="database">Databases</option>
                  <option value="audio">Audios</option>
                  <option value="download">Downloads</option>
                </select>

                <select 
                  value={sizeFilter}
                  onChange={(e) => setSizeFilter(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-300 font-medium outline-none cursor-pointer"
                >
                  <option value="all">All Sizes</option>
                  <option value="small">Small (&lt;100KB)</option>
                  <option value="medium">Medium (100KB-2MB)</option>
                  <option value="large">Large (&gt;2MB)</option>
                </select>
              </div>
            </div>

            {/* Search component */}
            <div className="relative mb-3 shrink-0">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-zinc-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search file name, hash logs, or text contents..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-200 outline-none focus:border-blue-500 transition-colors placeholder-zinc-700 font-sans"
              />
            </div>

            {/* Files grid list */}
            <div className="flex-1 overflow-y-auto border border-zinc-950 rounded-lg max-h-[480px]">
              <table className="w-full border-collapse text-left font-sans">
                <thead>
                  <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-500 font-bold text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">File Name</th>
                    <th className="py-2.5 px-3 hidden sm:table-cell">Size</th>
                    <th className="py-2.5 px-3 hidden md:table-cell">MIME Type</th>
                    <th className="py-2.5 px-3">Verified Hash (SHA-256)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file) => (
                    <tr 
                      key={file.id}
                      onClick={() => handleFileSelect(file)}
                      className={`border-b border-zinc-800/40 text-xs cursor-pointer transition-colors ${
                        selectedFile?.id === file.id
                          ? 'bg-blue-500/5 text-blue-400 hover:bg-blue-500/10'
                          : 'hover:bg-zinc-950 text-zinc-300'
                      }`}
                    >
                      <td className="py-3 px-3 flex items-center space-x-2 font-medium">
                        {file.category === 'picture' && <ImageIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                        {file.category === 'database' && <Database className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                        {!(file.category === 'picture' || file.category === 'database') && <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        <span className="truncate max-w-[120px]" title={file.name}>{file.name}</span>
                      </td>
                      <td className="py-3 px-3 hidden sm:table-cell font-mono text-zinc-500 text-[10px]">{file.size}</td>
                      <td className="py-3 px-3 hidden md:table-cell text-zinc-500 font-mono text-[10px]">{file.mimeType.split(';')[0]}</td>
                      <td className="py-3 px-3 font-mono text-[9px] text-zinc-400 truncate max-w-[140px] select-all" title={file.sha256}>
                        {file.sha256}
                      </td>
                    </tr>
                  ))}
                  {filteredFiles.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-zinc-600 italic">
                        No files matching selection filters found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Column 3: File Details and ASCII / HEX / MAP Preview */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg flex flex-col h-[650px] overflow-hidden xl:col-span-2">
            {selectedFile ? (
              <div className="flex flex-col h-full overflow-hidden justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3 shrink-0">
                    <div className="truncate pr-4">
                      <span className="text-[9px] font-bold text-blue-500 font-mono uppercase tracking-widest">{selectedFile.category}</span>
                      <h4 className="text-sm font-bold font-sans text-zinc-200 truncate" title={selectedFile.name}>{selectedFile.name}</h4>
                    </div>
                    
                    <button
                      onClick={() => handleExportFile(selectedFile)}
                      className="p-1.5 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white rounded transition-colors shrink-0 cursor-pointer"
                      title="Export Copied File"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Toggle Preview Buttons */}
                  <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 mt-3 shrink-0">
                    {(['preview', 'hex', 'metadata'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => setPreviewMode(mode)}
                        className={`flex-1 py-1 text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer ${
                          previewMode === mode
                            ? 'bg-zinc-800 text-blue-400 border border-zinc-800 shadow-sm font-extrabold'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {mode === 'preview' && <span className="flex items-center justify-center gap-1"><Eye className="w-3 h-3" /> Preview</span>}
                        {mode === 'hex' && <span className="flex items-center justify-center gap-1"><FileDigit className="w-3 h-3" /> HEX stream</span>}
                        {mode === 'metadata' && <span className="flex items-center justify-center gap-1"><HelpCircle className="w-3 h-3" /> Meta log</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-panels display container */}
                <div className="flex-1 my-4 overflow-hidden">
                  {/* PREVIEW PANEL */}
                  {previewMode === 'preview' && (
                    <div className="h-full overflow-y-auto">
                      {selectedFile.category === 'picture' && (
                        <div className="space-y-4">
                          {/* Image box */}
                          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex justify-center items-center h-48 relative overflow-hidden select-none">
                            <ImageIcon className="w-16 h-16 text-blue-500/10 absolute" />
                            <div className="text-zinc-500 font-mono text-[10px] z-10 border border-zinc-800/80 p-2.5 rounded bg-zinc-950/80 text-center uppercase tracking-wider">
                              <ImageIcon className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                              <span>{selectedFile.mimeType}</span>
                              <div className="text-[8px] text-zinc-600 mt-0.5 font-sans font-normal">{selectedFile.exif?.resolution}</div>
                            </div>
                          </div>

                          {/* EXIF details */}
                          {selectedFile.exif && (
                            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-2 text-xs">
                              <h5 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest font-mono border-b border-zinc-900 pb-1.5">EXIF METADATA</h5>
                              <div className="grid grid-cols-2 gap-2 text-[11px] leading-relaxed">
                                <div><span className="text-zinc-500 block">Camera:</span> <span className="text-zinc-300 font-medium">{selectedFile.exif.camera || '-'}</span></div>
                                <div><span className="text-zinc-500 block">Lens model:</span> <span className="text-zinc-300 font-medium">{selectedFile.exif.lens || '-'}</span></div>
                                <div><span className="text-zinc-500 block">Date Taken:</span> <span className="text-zinc-300 font-medium font-mono">{selectedFile.exif.dateTaken || '-'}</span></div>
                                <div><span className="text-zinc-500 block">Resolution:</span> <span className="text-zinc-300 font-medium font-mono">{selectedFile.exif.resolution || '-'}</span></div>
                              </div>

                              {/* Simulated Satellite tracking Map coordinate block */}
                              {selectedFile.exif.gps && (
                                <div className="mt-3 bg-zinc-900 border border-zinc-800 rounded p-3 text-[10px]">
                                  <div className="flex items-center justify-between text-blue-500 mb-2 font-mono font-bold uppercase">
                                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Satellite Coordinates</span>
                                    <span>{selectedFile.exif.gps}</span>
                                  </div>
                                  
                                  {/* Map mockup */}
                                  <div className="h-24 bg-zinc-950 border border-zinc-900 rounded relative overflow-hidden flex items-center justify-center font-mono">
                                    <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />
                                    {/* Concentric rings */}
                                    <div className="absolute w-16 h-16 border border-blue-500/20 rounded-full animate-ping" />
                                    <div className="absolute w-24 h-24 border border-blue-500/10 rounded-full" />
                                    {/* Tracking pin */}
                                    <div className="z-10 flex flex-col items-center">
                                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444] animate-pulse" />
                                      <span className="text-[8px] bg-zinc-950 border border-zinc-800/80 text-zinc-300 px-1 py-0.5 rounded mt-1 shadow-lg font-sans">
                                        {selectedFile.exif.gps.includes('-6') ? 'Monas Sector Map' : 'Paris Eiffel Grid'}
                                      </span>
                                    </div>
                                    <div className="absolute top-1 left-2 text-[8px] text-zinc-600">LAT: {selectedFile.exif.gps.split(', ')[0]}</div>
                                    <div className="absolute bottom-1 right-2 text-[8px] text-zinc-600">LNG: {selectedFile.exif.gps.split(', ')[1]}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {selectedFile.category === 'database' && (
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 flex flex-col items-center justify-center text-center h-48">
                          <Database className="w-10 h-10 text-blue-500 mb-2" />
                          <h5 className="text-xs font-bold text-zinc-300 uppercase">SQLite Database Detected</h5>
                          <p className="text-[10px] text-zinc-500 max-w-xs mt-1 leading-normal">
                            To inspect structured schemas, browse data records, run query commands, or export tables.
                          </p>
                          <button
                            onClick={() => onAnalyzeDatabase(selectedFile.name)}
                            className="mt-4 px-4 py-2 bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            Open SQLite Analyzer <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {!(selectedFile.category === 'picture' || selectedFile.category === 'database') && (
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 h-full overflow-y-auto select-text font-mono text-[11px] text-zinc-300 whitespace-pre-wrap max-h-[350px]">
                          {selectedFile.content || 'Binary data block. Open "HEX Stream" to view bytes.'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* HEX PANEL */}
                  {previewMode === 'hex' && (
                    <div className="h-full overflow-hidden">
                      <HexViewer content={selectedFile.content || `CRYPTO_HASH:${selectedFile.sha256}`} fileName={selectedFile.name} />
                    </div>
                  )}

                  {/* METADATA PANEL */}
                  {previewMode === 'metadata' && (
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3 text-xs h-full overflow-y-auto max-h-[380px]">
                      <h5 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest font-mono border-b border-zinc-900 pb-1.5">CRYPTOGRAPHIC VERIFICATION FILE CARD</h5>
                      
                      <div className="space-y-2 font-mono text-[10px]">
                        <div className="border-b border-zinc-900 pb-1"><span className="text-zinc-500 block">File Name:</span> <span className="text-zinc-300 font-sans">{selectedFile.name}</span></div>
                        <div className="border-b border-zinc-900 pb-1"><span className="text-zinc-500 block">File Path:</span> <span className="text-blue-500 font-sans text-[11px] leading-tight break-all">{selectedFile.path}</span></div>
                        <div className="border-b border-zinc-900 pb-1"><span className="text-zinc-500 block">File Size:</span> <span className="text-zinc-300 font-sans">{selectedFile.size} ({selectedFile.sizeBytes} Bytes)</span></div>
                        <div className="border-b border-zinc-900 pb-1"><span className="text-zinc-500 block">MIME Type:</span> <span className="text-zinc-300">{selectedFile.mimeType}</span></div>
                        <div className="border-b border-zinc-900 pb-1"><span className="text-zinc-500 block">SHA-256 Hash Signature:</span> <span className="text-zinc-300 select-all font-bold break-all">{selectedFile.sha256}</span></div>
                        <div className="border-b border-zinc-900 pb-1"><span className="text-zinc-500 block">MD5 Signature:</span> <span className="text-zinc-300 select-all font-bold break-all">{selectedFile.md5}</span></div>
                        <div className="border-b border-zinc-900 pb-1"><span className="text-zinc-500 block">Created (MAC-C):</span> <span className="text-zinc-400">{new Date(selectedFile.createdTime).toUTCString()}</span></div>
                        <div className="border-b border-zinc-900 pb-1"><span className="text-zinc-500 block">Modified (MAC-M):</span> <span className="text-zinc-400">{new Date(selectedFile.modifiedTime).toUTCString()}</span></div>
                        <div><span className="text-zinc-500 block">Accessed (MAC-A):</span> <span className="text-zinc-400">{new Date(selectedFile.accessTime).toUTCString()}</span></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-[10px] text-zinc-500 leading-normal font-sans shrink-0">
                  ⚠️ <strong>Disclaimer:</strong> Physical sector hashes are cryptographically computed in the local sandbox immediately upon directory acquisition. Alterations to folder names will invalidate audit logs.
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full border border-dashed border-zinc-800 rounded-lg p-5">
                <FileText className="w-10 h-10 text-zinc-700 mb-2 animate-pulse" />
                <p className="text-xs text-zinc-500 text-center uppercase font-bold">AWAITING ARTIFACT SELECTION</p>
                <p className="text-[10px] text-zinc-600 text-center mt-1">Select any acquired file from the central browser grid to load previews, parse EXIF meta-tags, dump raw hex, or run database SQL queries.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
