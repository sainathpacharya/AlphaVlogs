import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useUserStore } from '@/stores';
import { NetworkStatus } from '@/types';

export const useNetwork = () => {
  const setNetworkStatus = useUserStore(state => state.setNetworkStatus);
  const [currentStatus, setCurrentStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
  });

  useEffect(() => {
    const getInitialNetworkState = async () => {
      const state = await NetInfo.fetch();
      const status: NetworkStatus = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
      };
      setNetworkStatus(status);
      setCurrentStatus(status);
    };

    getInitialNetworkState();

    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const status: NetworkStatus = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
      };
      setNetworkStatus(status);
      setCurrentStatus(status);
    });

    return () => {
      unsubscribe();
    };
  }, [setNetworkStatus]);

  return currentStatus;
};
