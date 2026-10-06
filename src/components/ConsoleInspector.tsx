import React, { useState } from 'react';
import {
  Terminal,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Trash2,
  Code2,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { ApiLogEntry } from '../types/whatsapp';

interface ConsoleInspectorProps {
  logs: ApiLogEntry[];
  onClearLogs: () => void;
}

export const ConsoleInspector: React.FC<ConsoleInspectorProps> = ({ logs, onClearLogs }) => {
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'response' | 'request' | 'curl' | 'all'>('response');

  const activeLog = (selectedLogId ? logs.find((l) => l.id === selectedLogId) : logs[0]) || null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Live API Request & Response Inspector</h3>
              <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-300 font-mono">
                {logs.length} calls
              </span>
            </div>
            <p className="text-xs text-zinc-400">Full headers, JSON payloads, responses & cURL for Evolution API</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeLog && (
            <button
              onClick={() => copyToClipboard(activeLog.curl, 'active-curl')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition border border-zinc-700/80"
              title="Copy cURL command for this call"
            >
              {copiedKey === 'active-curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy cURL</span>
            </button>
          )}

          {logs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="p-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-rose-400 rounded-xl transition text-xs flex items-center gap-1"
              title="Clear call history"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 flex flex-col items-center justify-center">
          <Terminal className="w-8 h-8 mb-2 opacity-40 text-emerald-400" />
          <p className="text-sm font-medium text-zinc-400">No API calls recorded yet</p>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm">
            Click &quot;Ping Status&quot;, &quot;Verify Number&quot;, or &quot;Trigger WhatsApp Message&quot; above to inspect live traffic.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Log Entry Selector */}
          <div className="lg:col-span-4 space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {logs.map((log) => {
              const isSelected = activeLog?.id === log.id;
              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLogId(log.id)}
                  className={`p-2.5 rounded-xl border transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-zinc-800 border-emerald-500/50 shadow-sm'
                      : 'bg-zinc-950/50 border-zinc-800/80 hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 text-xs mb-1">
                    <span
                      className={`font-mono font-bold text-[10px] px-1.5 py-0.5 rounded ${
                        log.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {log.method}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                        log.status >= 200 && log.status < 300
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {log.status ? `${log.status} ${log.statusText}` : 'ERROR'}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-zinc-200 truncate" title={log.title}>
                    {log.title}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1">
                    <span className="font-mono truncate max-w-[140px]">{log.endpoint}</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-2.5 h-2.5" /> {log.durationMs}ms
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Inspector */}
          {activeLog && (
            <div className="lg:col-span-8 bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                {/* Meta details bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                        activeLog.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {activeLog.method}
                    </span>
                    <span className="text-white font-mono text-xs">{activeLog.endpoint}</span>
                  </div>

                  <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        activeLog.status >= 200 && activeLog.status < 300
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {activeLog.status} {activeLog.statusText}
                    </span>
                    <span>{activeLog.durationMs}ms</span>
                    <span>{activeLog.timestamp}</span>
                  </div>
                </div>

                {/* Tab selector */}
                <div className="flex items-center gap-2 mt-3 mb-2 text-xs">
                  <button
                    onClick={() => setActiveTab('response')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                      activeTab === 'response' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Response Body
                  </button>
                  <button
                    onClick={() => setActiveTab('request')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                      activeTab === 'request' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Request Payload
                  </button>
                  <button
                    onClick={() => setActiveTab('curl')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                      activeTab === 'curl' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    cURL Command
                  </button>
                </div>

                {/* Tab Content */}
                <div className="bg-black/60 rounded-xl p-3 border border-zinc-800/80 font-mono text-xs max-h-64 overflow-y-auto">
                  {activeTab === 'response' && (
                    <pre className="text-emerald-400 whitespace-pre-wrap">
                      {JSON.stringify(activeLog.responseBody, null, 2)}
                    </pre>
                  )}

                  {activeTab === 'request' && (
                    <div>
                      <div className="text-[11px] text-zinc-500 mb-1.5 font-sans">
                        <strong>Request Headers:</strong>
                        <div className="text-zinc-400 font-mono mt-0.5">
                          apikey: {activeLog.requestHeaders.apikey?.slice(0, 15)}...
                          {activeLog.requestHeaders['Content-Type'] && (
                            <div>Content-Type: {activeLog.requestHeaders['Content-Type']}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-[11px] text-zinc-500 mb-1 font-sans">
                        <strong>JSON Body:</strong>
                      </div>
                      <pre className="text-teal-300 whitespace-pre-wrap">
                        {activeLog.requestBody
                          ? JSON.stringify(activeLog.requestBody, null, 2)
                          : '// No body payload (GET request)'}
                      </pre>
                    </div>
                  )}

                  {activeTab === 'curl' && (
                    <div className="relative">
                      <button
                        onClick={() => copyToClipboard(activeLog.curl, 'curl-tab')}
                        className="absolute top-0 right-0 p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300"
                        title="Copy to terminal"
                      >
                        {copiedKey === 'curl-tab' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <pre className="text-yellow-300 whitespace-pre-wrap pr-8">
                        {activeLog.curl}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Status footer info */}
              <div className="mt-3 text-[11px] text-zinc-500 flex items-center justify-between">
                <span>URL: {activeLog.fullUrl}</span>
                <span className="text-zinc-400">Evolution API v2</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
