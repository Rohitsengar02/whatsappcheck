import React, { useState } from 'react';
import {
  Webhook,
  Radio,
  Play,
  Copy,
  Check,
  Terminal,
  Activity,
  Code2,
  Filter,
  RefreshCw,
  Server,
  Zap,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { WebhookEventLog, WhatsAppConfig } from '../../types/dashboard';
import { INITIAL_WEBHOOK_LOGS } from '../../data/mockData';

interface WebhooksManagerViewProps {
  config: WhatsAppConfig;
}

export const WebhooksManagerView: React.FC<WebhooksManagerViewProps> = ({ config }) => {
  const [logs, setLogs] = useState<WebhookEventLog[]>(INITIAL_WEBHOOK_LOGS);
  const [selectedLog, setSelectedLog] = useState<WebhookEventLog>(INITIAL_WEBHOOK_LOGS[0]);
  const [eventFilter, setEventFilter] = useState<'all' | string>('all');
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const instanceName = config.instance || 'user_active_channel';
  const registerEndpoint = `${config.baseUrl || 'https://whatsappapi-1n7u.onrender.com'}/webhook/set/${instanceName}`;

  const handleSimulateEvent = (type: 'MESSAGES_UPSERT' | 'MESSAGES_UPDATE' | 'CONNECTION_UPDATE' | 'CALL_OFFER') => {
    const newLog: WebhookEventLog = {
      id: 'wh_' + Date.now(),
      event: type,
      senderPhone: '+919761304821',
      senderName: 'Rohit Sengar',
      messageText: type === 'MESSAGES_UPSERT'
        ? 'Hi! Can you share the latest product catalog?'
        : type === 'MESSAGES_UPDATE'
        ? '[Receipt: Double Blue Tick Read]'
        : type === 'CONNECTION_UPDATE'
        ? 'Instance connection state healthy: OPEN'
        : 'Incoming voice call offer',
      timestamp: new Date().toLocaleTimeString(),
      instance: instanceName,
      rawPayload: {
        event: type.toLowerCase().replace('_', '.'),
        instance: instanceName,
        sender: '+919761304821',
        timestamp: Math.floor(Date.now() / 1000),
        data: {
          key: { remoteJid: '919761304821@s.whatsapp.net', fromMe: false },
          message: { conversation: 'Simulated live event test' },
        },
      },
    };

    setLogs([newLog, ...logs]);
    setSelectedLog(newLog);
  };

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(registerEndpoint);
    setCopiedEndpoint(true);
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(selectedLog.rawPayload, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const filteredLogs = logs.filter((l) => (eventFilter === 'all' ? true : l.event === eventFilter));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <Webhook className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Webhooks Live Receiver & Event Stream</h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Monitor real-time inbound WhatsApp events, customer replies, read receipts, and incoming voice call notifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Listener Active • Port 3000</span>
          </div>
        </div>
      </div>

      {/* Webhook Endpoint Configuration Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 mt-0.5">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Evolution API Webhook Register Endpoint
            </div>
            <div className="text-xs font-mono font-bold text-slate-900 mt-0.5 break-all">
              {registerEndpoint}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Sends automatic HTTP POST payloads to your server whenever a customer texts or reads a message.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyEndpoint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            {copiedEndpoint ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedEndpoint ? 'Copied URL!' : 'Copy Register URL'}</span>
          </button>
        </div>
      </div>

      {/* Quick Simulate Trigger Bar */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-800">Simulate Test Inbound Event:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSimulateEvent('MESSAGES_UPSERT')}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
          >
            + Inbound Message (MESSAGES_UPSERT)
          </button>
          <button
            onClick={() => handleSimulateEvent('MESSAGES_UPDATE')}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
          >
            + Read Receipt (MESSAGES_UPDATE)
          </button>
          <button
            onClick={() => handleSimulateEvent('CONNECTION_UPDATE')}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
          >
            + Status Change (CONNECTION_UPDATE)
          </button>
        </div>
      </div>

      {/* Main Grid: Stream Feed + JSON Payload Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Event Stream Feed (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>Real-Time Inbound Stream ({filteredLogs.length})</span>
            </h3>
            <div className="flex gap-1">
              {(['all', 'MESSAGES_UPSERT', 'MESSAGES_UPDATE', 'CONNECTION_UPDATE'] as const).map((ev) => (
                <button
                  key={ev}
                  onClick={() => setEventFilter(ev)}
                  className={`px-2 py-0.5 text-[11px] rounded font-medium cursor-pointer transition ${
                    eventFilter === ev ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {ev === 'all' ? 'All' : ev.replace('MESSAGES_', '')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredLogs.map((log) => {
              const isSelected = selectedLog.id === log.id;
              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/60 border-indigo-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                        log.event === 'MESSAGES_UPSERT'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.event === 'MESSAGES_UPDATE'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {log.event}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                  </div>

                  <div className="text-xs font-semibold text-slate-900">{log.senderName} ({log.senderPhone})</div>
                  <div className="text-xs text-slate-600 mt-1 line-clamp-1 font-sans">{log.messageText}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: JSON Payload Inspector (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-600" />
              <span>Event Payload Inspector</span>
            </h3>
            <button
              onClick={handleCopyPayload}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
            >
              {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPayload ? 'Copied JSON!' : 'Copy Payload'}</span>
            </button>
          </div>

          {selectedLog ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono">
                <div>
                  <span className="text-slate-400">Event:</span> <strong className="text-indigo-600">{selectedLog.event}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Instance:</span> <span className="text-slate-700">{selectedLog.instance}</span>
                </div>
                <div>
                  <span className="text-slate-400">Sender:</span> <span className="text-slate-700">{selectedLog.senderPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400">Received:</span> <span className="text-slate-700">{selectedLog.timestamp}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Raw JSON Callback Body</label>
                <pre className="p-4 bg-slate-950 text-emerald-400 text-xs font-mono rounded-xl overflow-x-auto max-h-80 leading-relaxed border border-slate-800">
                  {JSON.stringify(selectedLog.rawPayload, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select an event on the left to inspect its raw JSON payload.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
