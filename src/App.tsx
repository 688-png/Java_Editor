import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Download, Upload, Trash2, Terminal as TerminalIcon, Code2 } from 'lucide-react';

const DEFAULT_JAVA = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello JavaLab!");
        for(int i = 1; i <= 5; i++) {
            System.out.println("Iteration: " + i);
        }
    }
}`;

export default function App() {
  const [code, setCode] = useState(localStorage.getItem('javalab_code') || DEFAULT_JAVA);
  const [output, setOutput] = useState<string[]>(['Welcome to JavaLab. Press Run to execute your code.']);
  const [isRunning, setIsRunning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('javalab_code', code);
  }, [code]);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(['> Compiling and running...']);
    
    try {
      const response = await fetch('http://localhost:5000/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOutput(data.output.split('\n'));
      } else {
        setOutput([`Error:\n${data.error}`]);
      }
    } catch (err) {
      setOutput(['Error: Backend server not reachable. Ensure server.js is running on port 5000.']);
    } finally {
      setIsRunning(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([code], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "Main.java";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCode(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-gray-200">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-[#1e293b] border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Code2 className="text-blue-400" />
          <h1 className="text-xl font-bold tracking-tight text-white">JavaLab</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            className="hidden" 
            accept=".java,.txt"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-slate-700 rounded-md transition-colors"
            title="Import Java File"
          >
            <Upload size={20} />
          </button>
          <button 
            onClick={handleDownload}
            className="p-2 hover:bg-slate-700 rounded-md transition-colors"
            title="Download Code"
          >
            <Download size={20} />
          </button>
          <button 
            onClick={handleRun}
            disabled={isRunning}
            className={`flex items-center gap-2 px-6 py-1.5 rounded-md font-semibold transition-all ${
              isRunning ? 'bg-slate-600' : 'bg-green-600 hover:bg-green-500'
            } text-white shadow-lg`}
          >
            <Play size={16} fill="currentColor" />
            {isRunning ? 'Running...' : 'Run'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Editor Section */}
        <section className="flex-1 min-h-[50%] md:min-h-0 border-r border-slate-700 relative">
          <Editor
            height="100%"
            defaultLanguage="java"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 10 },
              wordWrap: 'on'
            }}
          />
        </section>

        {/* Console Section */}
        <section className="w-full md:w-[400px] flex flex-col bg-black overflow-hidden border-t md:border-t-0 border-slate-700">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              <TerminalIcon size={14} />
              Console Output
            </div>
            <button 
              onClick={() => setOutput([])}
              className="p-1 hover:text-white text-slate-500 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
          
          <div className="flex-1 p-4 font-mono text-sm overflow-y-auto whitespace-pre-wrap selection:bg-blue-500/30">
            {output.map((line, i) => (
              <div key={i} className={line.startsWith('Error:') ? 'text-red-400' : 'text-green-400'}>
                {line}
              </div>
            ))}
            {output.length === 0 && <span className="text-slate-600">No output yet...</span>}
          </div>
        </section>
      </main>
    </div>
  );
}