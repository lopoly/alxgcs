import { useState } from 'react';
import type { Theme, Link, LinkType } from '@/types';

interface ConnectionManagerProps {
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
  connections: Link[];
  onConnect: (linkType: LinkType) => void;
  onDisconnect: (linkId: string) => void;
}

type ConnectionTab = 'active' | 'new';
type NewConnectionType = 'serial' | 'udp' | 'tcp';

const defaultPorts = [
  '/dev/ttyUSB0',
  '/dev/ttyACM0',
  'COM3',
  'COM4',
  '/dev/tty.usbserial',
];

const defaultBaudRates = [9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600];

export function ConnectionManager({
  theme,
  isOpen,
  onClose,
  connections,
  onConnect,
  onDisconnect,
}: ConnectionManagerProps) {
  const [activeTab, setActiveTab] = useState<ConnectionTab>('active');
  const [newConnectionType, setNewConnectionType] = useState<NewConnectionType>('serial');

  // Serial connection form state
  const [serialPort, setSerialPort] = useState('/dev/ttyUSB0');
  const [serialBaud, setSerialBaud] = useState(57600);

  // UDP connection form state
  const [udpHost, setUdpHost] = useState('127.0.0.1');
  const [udpPort, setUdpPort] = useState(14550);
  const [udpMode, setUdpMode] = useState<'client' | 'server'>('client');

  // TCP connection form state
  const [tcpHost, setTcpHost] = useState('127.0.0.1');
  const [tcpPort, setTcpPort] = useState(5760);

  if (!isOpen) return null;

  const colors =
    theme === 'dark'
      ? {
          bg: 'rgba(10, 15, 20, 0.98)',
          bgSecondary: '#0d1117',
          border: '#1a2332',
          text: '#8899aa',
          textPrimary: '#ffffff',
          accent: '#00d4ff',
          success: '#00ff88',
          warning: '#ffaa00',
          error: '#ff4466',
          inputBg: '#0a0f14',
        }
      : {
          bg: 'rgba(255, 255, 255, 0.98)',
          bgSecondary: '#f8fafc',
          border: '#e2e8f0',
          text: '#64748b',
          textPrimary: '#1e293b',
          accent: '#0066cc',
          success: '#16a34a',
          warning: '#d97706',
          error: '#dc2626',
          inputBg: '#ffffff',
        };

  const handleConnect = () => {
    let linkType: LinkType;

    switch (newConnectionType) {
      case 'serial':
        linkType = { type: 'Serial', port: serialPort, baud: serialBaud };
        break;
      case 'udp':
        linkType =
          udpMode === 'client'
            ? { type: 'UdpClient', host: udpHost, port: udpPort }
            : { type: 'UdpServer', bind: udpHost, port: udpPort };
        break;
      case 'tcp':
        linkType = { type: 'TcpClient', host: tcpHost, port: tcpPort };
        break;
    }

    onConnect(linkType);
  };

  const getConnectionIcon = (link: Link): string => {
    if ('port' in link.linkType && link.linkType.type === 'Serial') return '🔌';
    if (link.linkType.type === 'UdpClient' || link.linkType.type === 'UdpServer') return '📡';
    if (link.linkType.type === 'TcpClient') return '🌐';
    if (link.linkType.type === 'Bluetooth') return '📶';
    return '📡';
  };

  const getConnectionDetails = (link: Link): string => {
    const lt = link.linkType;
    if (lt.type === 'Serial') return `${lt.port} @ ${lt.baud} baud`;
    if (lt.type === 'UdpClient') return `UDP Client: ${lt.host}:${lt.port}`;
    if (lt.type === 'UdpServer') return `UDP Server: ${lt.bind}:${lt.port}`;
    if (lt.type === 'TcpClient') return `TCP: ${lt.host}:${lt.port}`;
    if (lt.type === 'Bluetooth') return `BT: ${lt.address}`;
    return 'Unknown';
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[9999]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={onClose}
    >
      <div
        className="rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden flex flex-col"
        style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: colors.border }}
        >
          <h2 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
            Connection Manager
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: colors.text }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: colors.border }}>
          <button
            onClick={() => setActiveTab('active')}
            className="flex-1 px-4 py-3 text-sm font-medium transition-colors"
            style={{
              backgroundColor: activeTab === 'active' ? colors.accent + '15' : 'transparent',
              color: activeTab === 'active' ? colors.accent : colors.text,
              borderBottom: activeTab === 'active' ? `2px solid ${colors.accent}` : '2px solid transparent',
            }}
          >
            Active ({connections.length})
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className="flex-1 px-4 py-3 text-sm font-medium transition-colors"
            style={{
              backgroundColor: activeTab === 'new' ? colors.accent + '15' : 'transparent',
              color: activeTab === 'new' ? colors.accent : colors.text,
              borderBottom: activeTab === 'new' ? `2px solid ${colors.accent}` : '2px solid transparent',
            }}
          >
            New Connection
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'active' ? (
            <div className="space-y-3">
              {connections.length === 0 ? (
                <div className="text-center py-8" style={{ color: colors.text }}>
                  <div className="text-4xl mb-2">📡</div>
                  <div>No active connections</div>
                  <button
                    onClick={() => setActiveTab('new')}
                    className="mt-3 text-sm"
                    style={{ color: colors.accent }}
                  >
                    Create a new connection
                  </button>
                </div>
              ) : (
                connections.map((link) => (
                  <div
                    key={link.id}
                    className="p-3 rounded-lg border"
                    style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getConnectionIcon(link)}</span>
                        <div>
                          <div className="font-medium flex items-center gap-2" style={{ color: colors.textPrimary }}>
                            {link.name}
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: link.connected ? colors.success : colors.error }}
                            />
                          </div>
                          <div className="text-xs" style={{ color: colors.text }}>
                            {getConnectionDetails(link)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onDisconnect(link.id)}
                        className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
                        style={{
                          backgroundColor: colors.error + '20',
                          color: colors.error,
                        }}
                      >
                        Disconnect
                      </button>
                    </div>
                    {/* Stats */}
                    {link.connected && (
                      <div className="mt-2 pt-2 border-t flex gap-4 text-xs" style={{ borderColor: colors.border }}>
                        <span style={{ color: colors.text }}>
                          TX: {(link.stats.bytesSent / 1024).toFixed(1)} KB
                        </span>
                        <span style={{ color: colors.text }}>
                          RX: {(link.stats.bytesReceived / 1024).toFixed(1)} KB
                        </span>
                        <span style={{ color: link.stats.latencyMs > 100 ? colors.warning : colors.success }}>
                          {link.stats.latencyMs}ms
                        </span>
                        <span style={{ color: link.stats.packetLossPercent > 5 ? colors.warning : colors.success }}>
                          Loss: {link.stats.packetLossPercent.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Connection Type Selector */}
              <div>
                <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: colors.text }}>
                  Connection Type
                </label>
                <div className="flex gap-2">
                  {(['serial', 'udp', 'tcp'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewConnectionType(type)}
                      className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: newConnectionType === type ? colors.accent : colors.bgSecondary,
                        color: newConnectionType === type ? '#000000' : colors.text,
                        border: `1px solid ${newConnectionType === type ? colors.accent : colors.border}`,
                      }}
                    >
                      {type === 'serial' && '🔌 Serial'}
                      {type === 'udp' && '📡 UDP'}
                      {type === 'tcp' && '🌐 TCP'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Serial Connection Form */}
              {newConnectionType === 'serial' && (
                <>
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: colors.text }}>
                      Serial Port
                    </label>
                    <select
                      value={serialPort}
                      onChange={(e) => setSerialPort(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm"
                      style={{
                        backgroundColor: colors.inputBg,
                        border: `1px solid ${colors.border}`,
                        color: colors.textPrimary,
                      }}
                    >
                      {defaultPorts.map((port) => (
                        <option key={port} value={port}>
                          {port}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: colors.text }}>
                      Baud Rate
                    </label>
                    <select
                      value={serialBaud}
                      onChange={(e) => setSerialBaud(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg text-sm"
                      style={{
                        backgroundColor: colors.inputBg,
                        border: `1px solid ${colors.border}`,
                        color: colors.textPrimary,
                      }}
                    >
                      {defaultBaudRates.map((baud) => (
                        <option key={baud} value={baud}>
                          {baud.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* UDP Connection Form */}
              {newConnectionType === 'udp' && (
                <>
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: colors.text }}>
                      Mode
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setUdpMode('client')}
                        className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        style={{
                          backgroundColor: udpMode === 'client' ? colors.accent + '20' : colors.bgSecondary,
                          color: udpMode === 'client' ? colors.accent : colors.text,
                          border: `1px solid ${udpMode === 'client' ? colors.accent : colors.border}`,
                        }}
                      >
                        Client (connect out)
                      </button>
                      <button
                        onClick={() => setUdpMode('server')}
                        className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        style={{
                          backgroundColor: udpMode === 'server' ? colors.accent + '20' : colors.bgSecondary,
                          color: udpMode === 'server' ? colors.accent : colors.text,
                          border: `1px solid ${udpMode === 'server' ? colors.accent : colors.border}`,
                        }}
                      >
                        Server (listen)
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: colors.text }}>
                      {udpMode === 'client' ? 'Host' : 'Bind Address'}
                    </label>
                    <input
                      type="text"
                      value={udpHost}
                      onChange={(e) => setUdpHost(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm"
                      style={{
                        backgroundColor: colors.inputBg,
                        border: `1px solid ${colors.border}`,
                        color: colors.textPrimary,
                      }}
                      placeholder={udpMode === 'client' ? '127.0.0.1' : '0.0.0.0'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: colors.text }}>
                      Port
                    </label>
                    <input
                      type="number"
                      value={udpPort}
                      onChange={(e) => setUdpPort(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg text-sm"
                      style={{
                        backgroundColor: colors.inputBg,
                        border: `1px solid ${colors.border}`,
                        color: colors.textPrimary,
                      }}
                      min={1}
                      max={65535}
                    />
                  </div>
                </>
              )}

              {/* TCP Connection Form */}
              {newConnectionType === 'tcp' && (
                <>
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: colors.text }}>
                      Host
                    </label>
                    <input
                      type="text"
                      value={tcpHost}
                      onChange={(e) => setTcpHost(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm"
                      style={{
                        backgroundColor: colors.inputBg,
                        border: `1px solid ${colors.border}`,
                        color: colors.textPrimary,
                      }}
                      placeholder="127.0.0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: colors.text }}>
                      Port
                    </label>
                    <input
                      type="number"
                      value={tcpPort}
                      onChange={(e) => setTcpPort(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg text-sm"
                      style={{
                        backgroundColor: colors.inputBg,
                        border: `1px solid ${colors.border}`,
                        color: colors.textPrimary,
                      }}
                      min={1}
                      max={65535}
                    />
                  </div>
                </>
              )}

              {/* Connect Button */}
              <button
                onClick={handleConnect}
                className="w-full px-4 py-3 rounded-lg font-medium transition-colors mt-4"
                style={{
                  backgroundColor: colors.accent,
                  color: '#000000',
                }}
              >
                Connect
              </button>
            </div>
          )}
        </div>

        {/* Footer with tips */}
        <div
          className="px-6 py-3 border-t text-center"
          style={{ borderColor: colors.border }}
        >
          <span className="text-xs" style={{ color: colors.text }}>
            {activeTab === 'active'
              ? 'Click on a connection to view detailed statistics'
              : 'Select a connection type and configure the parameters'}
          </span>
        </div>
      </div>
    </div>
  );
}
