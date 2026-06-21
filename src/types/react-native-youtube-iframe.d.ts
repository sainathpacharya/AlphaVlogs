declare module 'react-native-youtube-iframe' {
  import type {Component} from 'react';

  export interface YoutubePlayerProps {
    height: number;
    width: number;
    videoId: string;
    play?: boolean;
    onChangeState?: (state: string) => void;
    onReady?: () => void;
    onError?: (error: string) => void;
    initialPlayerParams?: Record<string, unknown>;
  }

  export default class YoutubePlayer extends Component<YoutubePlayerProps> {
    seekTo(seconds: number, allowSeekAhead: boolean): void;
  }
}
