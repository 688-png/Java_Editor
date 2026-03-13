import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Download, Upload, Trash2, Cpu, FileCode, Terminal, Code2, Menu, X } from 'lucide-react';
import axios from 'axios';

const DEFAULT_CODE = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello JavaLab");
        
        for(int i = 1; i <= 5; i++) {
            System.out.println("Line: " + i);
        }
    }
}`;

type LogEntry = {
  type: 'out' | 'err' | 'info';
  text: string;
};

export default function App() {
  const [code, setCode] = useState(() => localStorage.getItem('javalab_code') || DEFAULT_CODE);
  const [output, setOutput] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'terminal'>('editor');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('javalab_code', code);
  }, [code]);

  const runCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setActiveTab('terminal'); 
    setOutput([{ type: 'info', text: 'Compiling Main.java...' }]);

    try {
      const response = await axios.post('http://localhost:5000/run', { code });
      const { success, output: runOutput, error } = response.data;
      
      if (success) {
        setOutput(prev => [...prev, { type: 'out', text: runOutput || 'Program executed successfully.' }]);
      } else {
        setOutput(prev => [...prev, { type: 'err', text: error }]);
      }
    } catch (err: any) {
      setOutput(prev => [...prev, { type: 'err', text: 'Connection Error: Is the backend server running?' }]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content && confirm('Import file and replace current code?')) {
        setCode(content);
        setIsMobileMenuOpen(false);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Main.java';
    a.click();
    URL.revokeObjectURL(url);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden">
      {/* Header */}
      <nav className="h-14 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Cpu className="text-white w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white">JavaLab</h1>
        </div>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-2">
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 rounded text-slate-300 transition-colors">
            <Upload size={18} /> <span className="text-sm font-medium">Import</span>
          </button>
          <button onClick={downloadCode} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 rounded text-slate-300 transition-colors">
            <Download size={18} /> <span className="text-sm font-medium">Download</span>
          </button>
          <div className="w-px h-6 bg-slate-800 mx-2" />
          <button onClick={runCode} disabled={isRunning} className={`flex items-center gap-2 px-6 py-1.5 rounded font-bold transition-all ${isRunning ? 'bg-slate-700' : 'bg-green-600 hover:bg-green-500 text-white'}`}>
            <Play size={16} fill="currentColor" /> {isRunning ? 'RUNNING' : 'RUN'}
          </button>
        </div>

        {/* Mobile Toggle & Run */}
        <div className="flex md:hidden items-center gap-2">
          <button onClick={runCode} disabled={isRunning} className="p-2 bg-green-600 rounded text-white">
            <Play size={20} fill="currentColor" />
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-300">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Hidden File Input */}
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".java" />

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-14 bg-slate-900/95 z-40 flex flex-col p-6 gap-4 md:hidden">
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-3 p-4 bg-slate-800 rounded-xl text-lg">
            <Upload size={24} /> Import Java File
          </button>
          <button onClick={downloadCode} className="flex items-center justify-center gap-3 p-4 bg-slate-800 rounded-xl text-lg">
            <Download size={24} /> Download Main.java
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Mobile Tab Switcher */}
        <div className="md:hidden flex bg-slate-900 border-b border-slate-800">
          <button 
            onClick={() => setActiveTab('editor')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'editor' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500'}`}
          >
            <Code2 size={18} /> Editor
          </button>
          <button 
            onClick={() => setActiveTab('terminal')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'terminal' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500'}`}
          >
            <Terminal size={18} /> Terminal
          </button>
        </div>

        {/* Editor (Shown if desktop OR mobile editor tab active) */}
        <div className={`flex-1 flex flex-col min-w-0 ${activeTab !== 'editor' ? 'hidden md:flex' : 'flex'}`}>
           <div className="hidden md:flex h-9 bg-slate-900 border-b border-slate-800 items-center px-4 gap-2">
             <FileCode size={14} className="text-blue-400" />
             <span className="text-xs text-slate-400 font-medium">Main.java</span>
           </div>
           <div className="flex-1 overflow-hidden">
             <Editor
               height="100%"
               defaultLanguage="java"
               theme="vs-dark"
               value={code}
               onChange={(val) => setCode(val || '')}
               options={{
                 fontSize: 14,
                 minimap: { enabled: false },
                 automaticLayout: true,
                 padding: { top: 16 },
                 lineNumbers: 'on',
                 scrollBeyondLastLine: false,
                 fixedOverflowWidgets: true
               }}
             />
           </div>
        </div>

        {/* Terminal (Shown if desktop OR mobile terminal tab active) */}
        <div className={`w-full md:w-[400px] flex flex-col bg-black border-l border-slate-800 ${activeTab !== 'terminal' ? 'hidden md:flex' : 'flex'}`}>
          <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Output Console</span>
            <button onClick={() => setOutput([])} className="p-1 hover:text-red-400 text-slate-600 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm leading-relaxed">
            {output.length === 0 && (
              <div className="text-slate-700 italic">{'>'} Output will appear here...</div>
            )}
            {output.map((line, i) => (
              <div key={i} className={`mb-1 break-words ${line.type === 'err' ? 'text-red-400' : line.type === 'info' ? 'text-blue-400' : 'text-slate-200'}`}>
                {line.type === 'err' ? 'error: ' : line.type === 'info' ? '➜ ' : ''}
                <span className="whitespace-pre-wrap">{line.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}