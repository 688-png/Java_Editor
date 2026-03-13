import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Download, Upload, Trash2, Smartphone, Monitor } from 'lucide-react';

const DEFAULT_CODE = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello JavaLab");
    }
}`;

export default function App() {
  const [code, setCode] = useState(localStorage.getItem('javalab_code') || DEFAULT_CODE);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'console'>('editor');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('javalab_code', code);
  }, [code]);

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Compiling and running...\n');
    setActiveTab('console');
    
    try {
      const response = await fetch('http://localhost:5000/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      setOutput(data.output || data.error || 'No output');
    } catch (err) {
      setOutput('Error: Backend not reachable. Ensure server.js is running locally.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Main.java';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCode(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-editor font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center font-bold text-white">J</div>
          <h1 className="text-xl font-bold tracking-tight hidden sm:block">JavaLab</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-slate-800 rounded text-slate-400"
            title="Upload File"
          >
            <Upload size={20} />
          </button>
          <button 
            onClick={handleDownload}
            className="p-2 hover:bg-slate-800 rounded text-slate-400"
            title="Download File"
          >
            <Download size={20} />
          </button>
          <button 
            onClick={() => setOutput('')}
            className="p-2 hover:bg-slate-800 rounded text-slate-400"
            title="Clear Console"
          >
            <Trash2 size={20} />
          </button>
          <button
            onClick={runCode}
            disabled={isRunning}
            className={`flex items-center gap-2 px-4 py-1.5 rounded font-medium transition ${
              isRunning ? 'bg-slate-700' : 'bg-green-600 hover:bg-green-500'
            }`}
          >
            <Play size={18} fill="currentColor" />
            <span>{isRunning ? 'Running...' : 'Run'}</span>
          </button>
        </div>
      </header>

      {/* Main UI */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Mobile Tabs */}
        <div className="flex md:hidden bg-slate-900 border-b border-white/10">
          <button 
            onClick={() => setActiveTab('editor')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'editor' ? 'border-orange-500 text-white' : 'border-transparent text-slate-400'}`}
          >
            Code Editor
          </button>
          <button 
            onClick={() => setActiveTab('console')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'console' ? 'border-orange-500 text-white' : 'border-transparent text-slate-400'}`}
          >
            Output Console
          </button>
        </div>

        {/* Editor Area */}
        <div className={`flex-1 relative ${activeTab === 'editor' ? 'block' : 'hidden md:block'} border-r border-white/5`}>
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
              scrollBeyondLastLine: false,
              padding: { top: 16 },
              bracketPairColorization: { enabled: true }
            }}
          />
        </div>

        {/* Console Area */}
        <div className={`flex-1 md:w-1/3 flex flex-col bg-black overflow-hidden ${activeTab === 'console' ? 'block' : 'hidden md:flex'}`}>
          <div className="px-4 py-2 bg-zinc-900 text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5 shrink-0">
            Console Output
          </div>
          <pre className="flex-1 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap text-green-400 selection:bg-zinc-700">
            {output || '> Program output will appear here...'}
          </pre>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept=".java" 
      />
    </div>
  );
}