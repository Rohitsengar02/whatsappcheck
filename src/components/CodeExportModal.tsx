import React, { useState } from 'react';
import { X, Copy, Check, Code2, Terminal, Globe, Smartphone, FileCode2 } from 'lucide-react';
import { WhatsAppConfig } from '../types/whatsapp';

interface CodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WhatsAppConfig;
  targetPhone: string;
  messageText: string;
}

export const CodeExportModal: React.FC<CodeExportModalProps> = ({
  isOpen,
  onClose,
  config,
  targetPhone,
  messageText,
}) => {
  const [activeTab, setActiveTab] = useState<'ts' | 'curl' | 'node' | 'widget'>('ts');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const cleanPhone = targetPhone.replace(/\D/g, '') || '1234567890';
  const cleanBaseUrl = (config.baseUrl || 'https://your-evolution-api.example.com').replace(/\/+$/, '');
  const activeInstance = config.instance || 'YOUR_INSTANCE_NAME';
  const activeApiKey = config.apiKey || 'YOUR_API_KEY';

  const tsCode = `// WhatsApp Hub Evolution API Client
export class WhatsAppHubClient {
  private baseUrl: string = '${cleanBaseUrl}';
  private instance: string = '${activeInstance}';
  private apiKey: string = '${activeApiKey}';

  async sendText(toPhone: string, text: string) {
    const cleanPhone = toPhone.replace(/\\D/g, '');
    const res = await fetch(\`\${this.baseUrl}/message/sendText/\${encodeURIComponent(this.instance)}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.apiKey,
      },
      body: JSON.stringify({ number: cleanPhone, text: text.trim() }),
    });
    return res.json();
  }

  async sendMedia(
    toPhone: string,
    mediaUrl: string,
    caption?: string,
    mediaType: 'image' | 'video' | 'document' = 'image'
  ) {
    const cleanPhone = toPhone.replace(/\\D/g, '');
    const res = await fetch(\`\${this.baseUrl}/message/sendMedia/\${encodeURIComponent(this.instance)}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.apiKey,
      },
      body: JSON.stringify({
        number: cleanPhone,
        mediatype: mediaType,
        mimetype: mediaType === 'document' ? 'application/pdf' : mediaType === 'video' ? 'video/mp4' : 'image/jpeg',
        media: mediaUrl,
        caption: caption || '',
        fileName: mediaType === 'document' ? 'document.pdf' : 'media.jpg',
      }),
    });
    return res.json();
  }

  async checkStatus() {
    const res = await fetch(\`\${this.baseUrl}/instance/connectionState/\${encodeURIComponent(this.instance)}\`, {
      headers: { apikey: this.apiKey },
    });
    return res.json();
  }
}

// Example Usage:
const client = new WhatsAppHubClient();
await client.sendText('${cleanPhone}', ${JSON.stringify(messageText || 'Hello from WhatsApp API!')});`;

  const curlCode = `# 1. Check Connection Status
curl -X GET "${cleanBaseUrl}/instance/connectionState/${activeInstance}" \\
  -H "apikey: ${activeApiKey}"

# 2. Verify WhatsApp Number
curl -X POST "${cleanBaseUrl}/chat/whatsappNumbers/${activeInstance}" \\
  -H "apikey: ${activeApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"numbers": ["+${cleanPhone}"]}'

# 3. Send Text Message
curl -X POST "${cleanBaseUrl}/message/sendText/${activeInstance}" \\
  -H "apikey: ${activeApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "number": "+${cleanPhone}",
    "text": ${JSON.stringify(messageText || 'Hello! Order confirmed.')}
  }'

# 4. Send Document / PDF
curl -X POST "${cleanBaseUrl}/message/sendMedia/${activeInstance}" \\
  -H "apikey: ${activeApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "number": "+${cleanPhone}",
    "mediatype": "document",
    "mimetype": "application/pdf",
    "media": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    "fileName": "Invoice_Sample.pdf"
  }'`;

  const nodeWebhook = `// Webhooks Receiver (Node.js / Express Example)
const express = require('express');
const app = express();
app.use(express.json());

// Register at: POST ${cleanBaseUrl}/webhook/set/${activeInstance}
app.post('/api/webhooks/whatsapp', (req, res) => {
  const { event, instance, data } = req.body;
  console.log(\`Received WhatsApp Event: \${event} for instance: \${instance}\`);

  if (event === 'MESSAGES_UPSERT') {
    const sender = data.key?.remoteJid;
    const messageText = data.message?.conversation || data.message?.extendedTextMessage?.text;
    const senderName = data.pushName || 'Customer';

    console.log(\`New message from \${senderName} (\${sender}): \${messageText}\`);
    // TODO: Process order status, trigger AI chatbot, or update database
  }

  res.status(200).json({ received: true });
});

app.listen(3000, () => console.log('WhatsApp Webhook server listening on port 3000'));`;

  const widgetCode = `<!-- 1-Line Embed Widget -->
<script src="${cleanBaseUrl}/sdk/whatsapp-widget.js"
        data-instance="${activeInstance}"
        data-phone="${config.connectedNumber || '+1234567890'}"
        data-brand="WhatsApp Support"
        data-greeting="Hi! How can we help you today?">
</script>`;

  const getCurrentCode = () => {
    switch (activeTab) {
      case 'ts':
        return tsCode;
      case 'curl':
        return curlCode;
      case 'node':
        return nodeWebhook;
      case 'widget':
        return widgetCode;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800 shrink-0">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Developer Integration Snippets</h2>
            <p className="text-xs text-zinc-400">Copy pre-configured code for TypeScript, cURL, Webhooks, or Website Widget</p>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex items-center gap-2 mt-4 shrink-0 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('ts')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'ts' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>TypeScript Client</span>
          </button>
          <button
            onClick={() => setActiveTab('curl')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'curl' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>cURL Commands</span>
          </button>
          <button
            onClick={() => setActiveTab('node')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'node' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Express Webhook</span>
          </button>
          <button
            onClick={() => setActiveTab('widget')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'widget' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>1-Line HTML Widget</span>
          </button>
        </div>

        {/* Code Box */}
        <div className="mt-3 flex-1 overflow-y-auto bg-black/70 rounded-xl p-4 border border-zinc-800 font-mono text-xs relative group">
          <button
            onClick={() => copyToClipboard(getCurrentCode(), 'modal-copy')}
            className="absolute top-3 right-3 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition"
          >
            {copiedKey === 'modal-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'modal-copy' ? 'Copied!' : 'Copy Code'}</span>
          </button>
          <pre className="text-zinc-300 whitespace-pre-wrap pr-16">{getCurrentCode()}</pre>
        </div>
      </div>
    </div>
  );
};
