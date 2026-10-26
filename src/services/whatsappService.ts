import { ApiLogEntry, ConnectionStateData, WhatsAppConfig, WhatsAppNumberVerification } from '../types/whatsapp';

export function sanitizePhoneNumber(phone: string): string {
  // Keeps only digits. If has leading +, strips non-digits.
  return phone.replace(/\D/g, '');
}

export function formatPhoneDisplay(phone: string): string {
  const cleaned = sanitizePhoneNumber(phone);
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  if (cleaned.startsWith('1') && cleaned.length === 11) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  if (phone.startsWith('+')) {
    return phone;
  }
  return cleaned ? `+${cleaned}` : '';
}

export function normalizeApiKey(key: string): string {
  if (!key) return '';
  let clean = key.trim();
  if (clean.toLowerCase().startsWith('wapi_live_')) {
    clean = clean.slice('wapi_live_'.length);
  } else if (clean.toLowerCase().startsWith('wapi_')) {
    clean = clean.slice('wapi_'.length);
  }
  // Evolution API on Render requires the uppercase hex key (429683C4C977415CAAFCCE10F7D57E11)
  return clean.toUpperCase();
}

function getRequestUrl(config: WhatsAppConfig, endpointPath: string): { fetchUrl: string; displayUrl: string } {
  const cleanBase = config.baseUrl.replace(/\/+$/, '');
  const path = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;
  const displayUrl = `${cleanBase}${path}`;

  // If proxy enabled and running in browser, proxy through /whatsapp-api
  if (config.useProxy) {
    return {
      fetchUrl: `/whatsapp-api${path}`,
      displayUrl,
    };
  }

  return {
    fetchUrl: displayUrl,
    displayUrl,
  };
}

export function generateCurlCommand(
  method: 'GET' | 'POST' | 'DELETE' | 'PUT',
  url: string,
  apiKey: string,
  body?: any
): string {
  const effectiveKey = normalizeApiKey(apiKey);
  let curl = `curl -X ${method} "${url}" \\\n  -H "apikey: ${effectiveKey}"`;
  if (body) {
    curl += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(body, null, 2)}'`;
  }
  return curl;
}

export async function executeWhatsAppRequest<T = any>(
  config: WhatsAppConfig,
  method: 'GET' | 'POST' | 'DELETE' | 'PUT',
  endpointPath: string,
  body?: any,
  title = 'WhatsApp API Request'
): Promise<{ success: boolean; data?: T; error?: string; log: ApiLogEntry }> {
  const { fetchUrl, displayUrl } = getRequestUrl(config, endpointPath);
  const startTime = performance.now();
  const effectiveKey = normalizeApiKey(config.apiKey);
  const headers: Record<string, string> = {
    apikey: effectiveKey,
  };

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  const curl = generateCurlCommand(method, displayUrl, effectiveKey, body);

  let responseStatus = 0;
  let responseStatusText = '';
  let responseData: any = null;
  let errorMessage: string | undefined;

  try {
    const response = await fetch(fetchUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    responseStatus = response.status;
    responseStatusText = response.statusText;

    const text = await response.text();
    try {
      responseData = text ? JSON.parse(text) : {};
    } catch {
      responseData = { rawText: text };
    }

    if (!response.ok) {
      errorMessage = responseData?.message || responseData?.error || `HTTP ${response.status}: ${response.statusText}`;
    }
  } catch (err: any) {
    responseStatus = 0;
    responseStatusText = 'Network Error';
    errorMessage = err?.message || 'Failed to connect. Check network connection or CORS configuration.';
    responseData = {
      error: errorMessage,
      hint: config.useProxy
        ? 'Proxy request failed. Verify the backend server is reachable.'
        : 'Direct request failed. Likely browser CORS restriction. Try enabling "Use Local Proxy" in Settings.',
    };
  }

  const durationMs = Math.round(performance.now() - startTime);

  const log: ApiLogEntry = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toLocaleTimeString(),
    title,
    method,
    endpoint: endpointPath,
    fullUrl: displayUrl,
    requestHeaders: headers,
    requestBody: body,
    status: responseStatus,
    statusText: responseStatusText,
    durationMs,
    responseBody: responseData,
    isError: responseStatus < 200 || responseStatus >= 300,
    curl,
  };

  return {
    success: responseStatus >= 200 && responseStatus < 300,
    data: responseData as T,
    error: errorMessage,
    log,
  };
}

/**
 * Checks WhatsApp instance connection status:
 * GET /instance/connectionState/{instance}
 */
export async function fetchConnectionState(
  config: WhatsAppConfig
): Promise<{ state: ConnectionStateData; log: ApiLogEntry }> {
  const endpoint = `/instance/connectionState/${encodeURIComponent(config.instance)}`;
  const res = await executeWhatsAppRequest<{
    instance?: { instanceName?: string; state?: string };
    state?: string;
  }>(config, 'GET', endpoint, undefined, 'Check Connection State');

  let status: ConnectionStateData['status'] = 'unknown';
  let stateText = 'Unknown';
  let instanceName = config.instance;

  if (res.success && res.data) {
    const rawState = res.data.instance?.state || res.data.state;
    instanceName = res.data.instance?.instanceName || config.instance;

    if (rawState === 'open') {
      status = 'open';
      stateText = 'Connected (open)';
    } else if (rawState === 'connecting') {
      status = 'connecting';
      stateText = 'Connecting...';
    } else if (rawState === 'close') {
      status = 'close';
      stateText = 'Disconnected (closed)';
    } else if (rawState === 'refused') {
      status = 'refused';
      stateText = 'Connection Refused';
    } else if (rawState) {
      status = 'unknown';
      stateText = String(rawState);
    }
  } else {
    status = 'error';
    stateText = res.error || 'Connection check failed';
  }

  const stateData: ConnectionStateData = {
    status,
    stateText,
    instanceName,
    lastChecked: Date.now(),
    latencyMs: res.log.durationMs,
    rawResponse: res.data,
    error: res.error,
  };

  return { state: stateData, log: res.log };
}

/**
 * Verify WhatsApp number:
 * POST /chat/whatsappNumbers/{instance}
 */
export async function verifyNumber(
  config: WhatsAppConfig,
  phone: string
): Promise<{ verification: WhatsAppNumberVerification; log: ApiLogEntry }> {
  const cleanPhone = sanitizePhoneNumber(phone);
  const formattedWithPlus = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
  const endpoint = `/chat/whatsappNumbers/${encodeURIComponent(config.instance)}`;

  const body = {
    numbers: [formattedWithPlus],
  };

  const res = await executeWhatsAppRequest<any>(
    config,
    'POST',
    endpoint,
    body,
    `Verify Number (${formattedWithPlus})`
  );

  let exists = false;
  let jid: string | undefined;
  let name: string | undefined;

  if (res.success && res.data) {
    const list = Array.isArray(res.data) ? res.data : (res.data.numbers || [res.data]);
    const firstMatch = list[0];
    if (firstMatch) {
      exists = Boolean(firstMatch.exists || firstMatch.isInWhatsapp || firstMatch.jid);
      jid = firstMatch.jid || firstMatch.number;
      name = firstMatch.name || firstMatch.pushName;
    }
  }

  return {
    verification: {
      number: formattedWithPlus,
      exists,
      jid,
      name,
      raw: res.data,
    },
    log: res.log,
  };
}

/**
 * Send Plain Text Message:
 * POST /message/sendText/{instance}
 */
export async function sendTextMessage(
  config: WhatsAppConfig,
  toPhone: string,
  text: string
): Promise<{ success: boolean; data?: any; error?: string; log: ApiLogEntry }> {
  const cleanPhone = sanitizePhoneNumber(toPhone);
  const endpoint = `/message/sendText/${encodeURIComponent(config.instance)}`;
  const body = {
    number: cleanPhone,
    text: text.trim(),
  };

  return executeWhatsAppRequest(config, 'POST', endpoint, body, `Send Text to ${cleanPhone}`);
}

/**
 * Send Media Message (Image, Document, Video, Audio):
 * POST /message/sendMedia/{instance}
 */
export async function sendMediaMessage(
  config: WhatsAppConfig,
  params: {
    toPhone: string;
    mediaUrl: string;
    mediaType: 'image' | 'video' | 'audio' | 'document';
    caption?: string;
    fileName?: string;
    mimetype?: string;
  }
): Promise<{ success: boolean; data?: any; error?: string; log: ApiLogEntry }> {
  const cleanPhone = sanitizePhoneNumber(params.toPhone);
  const endpoint = `/message/sendMedia/${encodeURIComponent(config.instance)}`;

  let mimetype = params.mimetype;
  if (!mimetype) {
    if (params.mediaType === 'document') mimetype = 'application/pdf';
    else if (params.mediaType === 'video') mimetype = 'video/mp4';
    else if (params.mediaType === 'audio') mimetype = 'audio/mp3';
    else mimetype = 'image/jpeg';
  }

  const defaultFileName = params.fileName || (
    params.mediaType === 'document' ? 'document.pdf' :
    params.mediaType === 'video' ? 'video.mp4' :
    params.mediaType === 'audio' ? 'audio.mp3' : 'image.jpg'
  );

  const body = {
    number: cleanPhone,
    mediatype: params.mediaType,
    mimetype,
    media: params.mediaUrl,
    caption: params.caption || '',
    fileName: defaultFileName,
  };

  return executeWhatsAppRequest(
    config,
    'POST',
    endpoint,
    body,
    `Send ${params.mediaType.toUpperCase()} to ${cleanPhone}`
  );
}

/**
 * Create Instance and return initial QR Code (if generated)
 * POST /instance/create
 */
export async function createInstance(
  config: WhatsAppConfig,
  instanceName: string,
  token?: string
): Promise<{
  success: boolean;
  data?: any;
  qrcode?: { base64?: string; code?: string; pairingCode?: string };
  error?: string;
  log: ApiLogEntry;
}> {
  const endpoint = '/instance/create';
  const body = {
    instanceName: instanceName.trim(),
    token: token || config.apiKey,
    qrcode: true,
    integration: 'WHATSAPP-BAILEYS',
  };

  const res = await executeWhatsAppRequest<any>(
    config,
    'POST',
    endpoint,
    body,
    `Create Instance (${instanceName})`
  );

  let qrcode: { base64?: string; code?: string; pairingCode?: string } | undefined;
  if (res.data?.qrcode) {
    qrcode = {
      base64: res.data.qrcode.base64,
      code: res.data.qrcode.code,
      pairingCode: res.data.qrcode.pairingCode,
    };
  }

  return {
    success: res.success,
    data: res.data,
    qrcode,
    error: res.error,
    log: res.log,
  };
}

/**
 * Fetch Live QR Code for Instance:
 * GET /instance/connect/{instance}
 */
export async function fetchInstanceQrCode(
  config: WhatsAppConfig,
  instanceName: string
): Promise<{
  success: boolean;
  qrcode?: { base64?: string; code?: string; pairingCode?: string };
  error?: string;
  log: ApiLogEntry;
}> {
  const endpoint = `/instance/connect/${encodeURIComponent(instanceName.trim())}`;
  const res = await executeWhatsAppRequest<any>(
    config,
    'GET',
    endpoint,
    undefined,
    `Fetch QR Code (${instanceName})`
  );

  let qrcode: { base64?: string; code?: string; pairingCode?: string } | undefined;
  if (res.data) {
    qrcode = {
      base64: res.data.base64 || res.data.qrcode?.base64,
      code: res.data.code || res.data.qrcode?.code,
      pairingCode: res.data.pairingCode || res.data.qrcode?.pairingCode,
    };
  }

  return {
    success: res.success && Boolean(qrcode?.base64 || qrcode?.code),
    qrcode,
    error: res.error,
    log: res.log,
  };
}

/**
 * Restart WhatsApp instance:
 * POST /instance/restart/{instance}
 */
export async function restartInstance(
  config: WhatsAppConfig,
  instanceName: string
): Promise<{ success: boolean; data?: any; error?: string; log: ApiLogEntry }> {
  const endpoint = `/instance/restart/${encodeURIComponent(instanceName.trim())}`;
  return executeWhatsAppRequest(config, 'POST', endpoint, undefined, `Restart Instance (${instanceName})`);
}

/**
 * Logout WhatsApp session:
 * DELETE /instance/logout/{instance}
 */
export async function logoutInstance(
  config: WhatsAppConfig,
  instanceName: string
): Promise<{ success: boolean; data?: any; error?: string; log: ApiLogEntry }> {
  const endpoint = `/instance/logout/${encodeURIComponent(instanceName.trim())}`;
  return executeWhatsAppRequest(config, 'DELETE', endpoint, undefined, `Logout Instance (${instanceName})`);
}

/**
 * Delete WhatsApp instance:
 * DELETE /instance/delete/{instance}
 */
export async function deleteInstance(
  config: WhatsAppConfig,
  instanceName: string
): Promise<{ success: boolean; data?: any; error?: string; log: ApiLogEntry }> {
  const endpoint = `/instance/delete/${encodeURIComponent(instanceName.trim())}`;
  return executeWhatsAppRequest(config, 'DELETE', endpoint, undefined, `Delete Instance (${instanceName})`);
}

/**
 * Send Interactive Buttons Message:
 * POST /message/sendButtons/{instance}
 */
export async function sendButtonsMessage(
  config: WhatsAppConfig,
  params: {
    toPhone: string;
    title: string;
    description: string;
    footer?: string;
    thumbnailUrl?: string;
    buttons: {
      id?: string;
      displayText: string;
      type: 'reply' | 'url' | 'call';
      url?: string;
      phoneNumber?: string;
    }[];
  }
): Promise<{ success: boolean; data?: any; error?: string; log: ApiLogEntry }> {
  const cleanPhone = sanitizePhoneNumber(params.toPhone);
  const effectiveInstance = (config.instance || 'user_rjx6ebs').trim();
  const endpoint = `/message/sendButtons/${encodeURIComponent(effectiveInstance)}`;

  // Ensure all buttons conform to Evolution API's native button specification
  // Note: Reply buttons cannot be mixed with URL buttons in WhatsApp native flow
  const hasReply = params.buttons.some((b) => b.type === 'reply' || !b.type);
  const formattedButtons = params.buttons.map((b, idx) => {
    // If reply buttons are present, enforce all as reply to avoid WhatsApp mixing error
    const resolvedType = hasReply ? 'reply' : (b.type || 'reply');
    return {
      type: resolvedType,
      displayText: b.displayText.trim(),
      id: b.id || `btn_${Date.now()}_${idx}`,
      url: resolvedType === 'url' ? b.url : undefined,
      phoneNumber: resolvedType === 'call' ? b.phoneNumber : undefined,
    };
  });

  const body: any = {
    number: cleanPhone,
    title: params.title || 'Message',
    description: params.description || '',
    footer: params.footer || '',
    buttons: formattedButtons,
  };

  if (params.thumbnailUrl && params.thumbnailUrl.trim().length > 0) {
    body.thumbnailUrl = params.thumbnailUrl.trim();
  }

  return executeWhatsAppRequest(
    config,
    'POST',
    endpoint,
    body,
    `Send Native Buttons Message to ${cleanPhone}`
  );
}

/**
 * Send Interactive Clickable Option Buttons (WhatsApp Poll Cards):
 * POST /message/sendPoll/{instance}
 * (100% Guaranteed to be received & clickable across all WhatsApp Mobile & Desktop apps)
 */
export async function sendPollMessage(
  config: WhatsAppConfig,
  params: {
    toPhone: string;
    name: string;
    options: string[];
    selectableCount?: number;
  }
): Promise<{ success: boolean; data?: any; error?: string; log: ApiLogEntry }> {
  const cleanPhone = sanitizePhoneNumber(params.toPhone);
  const effectiveInstance = (config.instance || 'user_rjx6ebs').trim();
  const endpoint = `/message/sendPoll/${encodeURIComponent(effectiveInstance)}`;

  const validOptions = params.options
    .map((o) => o?.trim())
    .filter((o) => Boolean(o && o.length > 0));

  const body = {
    number: cleanPhone,
    name: params.name || 'How would you like to proceed?',
    selectableCount: params.selectableCount || 1,
    values: validOptions.length > 0 ? validOptions : ['Option 1', 'Option 2'],
  };

  return executeWhatsAppRequest(
    config,
    'POST',
    endpoint,
    body,
    `Send WhatsApp Clickable Buttons (Poll) to ${cleanPhone}`
  );
}

/**
 * Send Interactive List Menu:
 * POST /message/sendList/{instance}
 */
export async function sendListMessage(
  config: WhatsAppConfig,
  params: {
    toPhone: string;
    title: string;
    description: string;
    buttonText: string;
    footerText?: string;
    sections: {
      title: string;
      rows: {
        title: string;
        description?: string;
        rowId: string;
      }[];
    }[];
  }
): Promise<{ success: boolean; data?: any; error?: string; log: ApiLogEntry }> {
  const cleanPhone = sanitizePhoneNumber(params.toPhone);
  const effectiveInstance = (config.instance || 'user_rjx6ebs').trim();
  const endpoint = `/message/sendList/${encodeURIComponent(effectiveInstance)}`;

  const body = {
    number: cleanPhone,
    title: params.title || 'Options Menu',
    description: params.description || '',
    buttonText: params.buttonText || 'View Options',
    footerText: params.footerText || '',
    sections: params.sections,
  };

  return executeWhatsAppRequest(
    config,
    'POST',
    endpoint,
    body,
    `Send WhatsApp List Menu to ${cleanPhone}`
  );
}

/**
 * Find/Fetch messages from Evolution API WhatsApp instance:
 * POST /chat/findMessages/{instance}
 */
export async function findMessages(
  config: WhatsAppConfig,
  query: { remoteJid?: string; limit?: number } = {}
): Promise<{ success: boolean; data?: any; error?: string }> {
  const effectiveInstance = (config.instance || 'default').trim();
  const endpoint = `/chat/findMessages/${encodeURIComponent(effectiveInstance)}`;

  const body: any = {
    where: {},
  };

  if (query.remoteJid) {
    const clean = sanitizePhoneNumber(query.remoteJid) || query.remoteJid.replace(/\D/g, '');
    const jid = clean.includes('@') ? clean : `${clean}@s.whatsapp.net`;
    body.where.key = {
      remoteJid: jid,
    };
  }

  if (query.limit) {
    body.limit = query.limit;
  }

  const res = await executeWhatsAppRequest(
    config,
    'POST',
    endpoint,
    body,
    `Find Messages for ${effectiveInstance}`
  );

  return {
    success: res.success,
    data: res.data,
    error: res.error,
  };
}

/**
 * Find/Fetch all active WhatsApp chats from Evolution API:
 * POST /chat/findChats/{instance}
 */
export async function findChats(
  config: WhatsAppConfig
): Promise<{ success: boolean; data?: any; error?: string }> {
  const effectiveInstance = (config.instance || 'default').trim();
  const endpoint = `/chat/findChats/${encodeURIComponent(effectiveInstance)}`;

  const res = await executeWhatsAppRequest(
    config,
    'POST',
    endpoint,
    {},
    `Find Chats for ${effectiveInstance}`
  );

  return {
    success: res.success,
    data: res.data,
    error: res.error,
  };
}

