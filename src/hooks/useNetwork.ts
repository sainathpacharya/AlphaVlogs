import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useUserStore } from '@/stores';
import { NetworkStatus } from '@/types';

export const useNetwork = () => {
  const { setNetworkStatus, networkStatus } = useUserStore();
  const [currentStatus, setCurrentStatus] = useState<NetworkStatus>(networkStatus);

  useEffect(() => {
    // Initial network state
    const getInitialNetworkState = async () => {
      const state = await NetInfo.fetch();
      const networkStatus: NetworkStatus = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
      };
      setNetworkStatus(networkStatus);
      setCurrentStatus(networkStatus);
    };

    getInitialNetworkState();

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const networkStatus: NetworkStatus = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
      };
      setNetworkStatus(networkStatus);
      setCurrentStatus(networkStatus);
    });

    return () => {
      unsubscribe();
    };
  }, [setNetworkStatus]);

  return currentStatus; // Return the current network status
};
