declare module 'react-native-maps' {
  import { Component } from 'react';
  import { ViewStyle } from 'react-native';

  export interface Region {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }

  export interface MapViewProps {
    region?: Region;
    style?: ViewStyle;
    onRegionChangeComplete?: (region: Region) => void;
    children?: React.ReactNode;
  }

  export class MapView extends Component<MapViewProps> {}
  export class Marker extends Component<any> {}
  export default MapView;
}
