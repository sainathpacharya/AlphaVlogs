import { Box, HStack, ImageBackground, Text } from "@/components";
import { forwardRef, useImperativeHandle, useRef } from "react";
import MapView, { Marker, Region } from "react-native-maps";
import emptyMarkerImage from "./emptymarket.png";
import markerImage from "./marker.png";
import selectedMarkerImage from "./selected-marker.png";

interface IMapProps {
  lat: number;
  lng: number;
  markers?: any[];
  selectedMarker?: number;
  handleIndexChange?: (index: number, moveCards?: boolean) => void;
  onRegionChangeComplete?: (region: Region) => void;
  setShowSearchThisAreaButton?: (showSearchThisAreaButton: boolean) => void;
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
  pitchEnabled?: boolean;
  rotateEnabled?: boolean;
}

const MapViewer = forwardRef<MapView, IMapProps>((props, ref) => {
  const {
    lat,
    lng,
    markers = [],
    selectedMarker,
    handleIndexChange,
    onRegionChangeComplete,
    setShowSearchThisAreaButton,
    scrollEnabled = true,
    zoomEnabled = true,
    pitchEnabled = true,
    rotateEnabled = true,
  } = props;
  const mapRef = useRef<MapView>(null);

  useImperativeHandle(ref, () => {
    const map = mapRef.current;
    if (!map) {
      throw new Error("MapView is not yet loaded");
    }
    // Aquí puedes añadir propiedades adicionales si es necesario
    return map; // Esto garantiza que siempre devuelvas un objeto MapView, nunca null
  });

  return (
    <MapView
      zoomEnabled={zoomEnabled}
      pitchEnabled={pitchEnabled}
      rotateEnabled={rotateEnabled}
      scrollEnabled={scrollEnabled}
      onPanDrag={() =>
        scrollEnabled &&
        setShowSearchThisAreaButton &&
        setShowSearchThisAreaButton(true)
      }
      showsUserLocation
      mapType="standard"
      userInterfaceStyle="light"
      ref={mapRef}
      onRegionChangeComplete={(region) =>
        onRegionChangeComplete && onRegionChangeComplete(region)
      }
      onMapReady={() => {
        mapRef.current?.fitToSuppliedMarkers(
          markers.map((_, index) => `marker_${index}`),
          {
            edgePadding: {
              top: 50,
              right: 50,
              bottom: 50,
              left: 50,
            },
          }
        );
      }}
      style={{
        flex: 1,
      }}
      initialRegion={{
        latitude: lat || 0,
        longitude: lng || 0,
        latitudeDelta: 0.5,
        longitudeDelta: 0.3,
      }}
    >
      {markers.map((marker, index) => {
        const isMultiple = marker.providers?.length > 1;
        let image =
          index !== selectedMarker ? markerImage : selectedMarkerImage;

        if (isMultiple) image = emptyMarkerImage;

        return (
          <Marker
            onPress={() => handleIndexChange && handleIndexChange(index, true)}
            key={`marker_${index}`}
            identifier={`marker_${index}`}
            coordinate={{
              latitude: marker.lat || 0,
              longitude: marker.lng || 0,
            }}
            style={{
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
            }}
          >
            <Box h={50} w={35} position="relative">
              <ImageBackground
                source={image}
                style={{ flex: 1, justifyContent: "center" }}
              ></ImageBackground>
              {isMultiple && (
                <HStack
                  w={35}
                  h={40}
                  top={0}
                  left={0}
                  alignItems="center"
                  justifyContent="center"
                  position="absolute"
                >
                  <Text fontWeight={500} fontSize="$md" color="white">
                    {marker?.providers?.length}
                  </Text>
                </HStack>
              )}
            </Box>
          </Marker>
        );
      })}
    </MapView>
  );
});

export default MapViewer;
