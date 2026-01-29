import type { Theme } from '@/types';

interface VideoFeedProps {
  theme: Theme;
  isRecording?: boolean;
  resolution?: string;
}

export function VideoFeed({
  theme,
  isRecording = true,
  resolution = '1080p 30fps',
}: VideoFeedProps) {
  return (
    <div
      className="relative rounded-lg overflow-hidden"
      style={{
        backgroundColor: theme === 'dark' ? '#0d1117' : '#e2e8f0',
        aspectRatio: '16/9',
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div style={{ fontSize: '32px', opacity: 0.3 }}>📹</div>
          <div style={{ fontSize: '11px', opacity: 0.5 }}>Video Feed</div>
        </div>
      </div>
      {isRecording && (
        <div
          className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs animate-pulse"
          style={{ backgroundColor: '#ff4466', color: '#ffffff' }}
        >
          ● REC
        </div>
      )}
      <div
        className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-xs"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#ffffff' }}
      >
        {resolution}
      </div>
    </div>
  );
}
