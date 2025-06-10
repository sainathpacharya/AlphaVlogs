import { ExternalLink } from "@/assets/icons/ui";

import { HStack, Text, Button, ButtonSpinner, ButtonText } from "@/components";
import { apiPartner } from "@/services/partner-api";
import { useMutation } from "@tanstack/react-query";
import InAppBrowser from "react-native-inappbrowser-reborn";
import { Linking, Platform, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUserCachedStore } from "@/stores/user-cached-store";
import { IPartnerResponse } from "@/types/partner";
enum SSOButtonType {
  Link = "link",
  Button = "button",
}

interface Props {
  type?: SSOButtonType;
  label: string;
  partnerId: number;
  sponsorId: number;
  personId: number;
  onPress?: () => void;
  displayError?: () => void;
}

const SSOButton = ({
  type = SSOButtonType.Button,
  label,
  partnerId,
  sponsorId,
  personId,
  onPress,
  displayError,
}: Props) => {
  const { t } = useTranslation();
  const [isBrowserAvailable, setIsBrowserAvailable] = useState<boolean>(false);

  useEffect(() => {
    const checkBrowserAvailability = async () => {
      try {
        if (InAppBrowser?.isAvailable) {
          setIsBrowserAvailable(await InAppBrowser.isAvailable());
        }
      } catch (error) {
        setIsBrowserAvailable(false);
      }
    };

    checkBrowserAvailability();
  }, []);

  // Mutation for getting SSO link and opening browser
  const { mutate: openSSOLink, isPending: isLoading } = useMutation({
    mutationFn: async () => {
      const url = await apiPartner.getPartnerSSOLinkV2({
        partnerId: partnerId,
        sponsorId: sponsorId,
        personId: personId,
      });
      return url;
    },
    onSuccess: async (url) => {
      let fallbackToSystemBrowser = false;

      if (isBrowserAvailable) {
        try {
          await InAppBrowser.open(url.toString(), {
            showTitle: true,
            enableUrlBarHiding: true,
            enableDefaultShare: false,
            forceCloseOnRedirection: false,
            ...Platform.select({
              ios: {
                dismissButtonStyle: "Close",
                preferredBarTintColor: "#ffffff",
                preferredControlTintColor: "#000000",
              },
              android: {
                toolbarColor: "#ffffff",
                secondaryToolbarColor: "#000000",
                showInRecents: false,
              },
            }),
          });
        } catch (error) {
          fallbackToSystemBrowser = true;
        }
      } else {
        fallbackToSystemBrowser = true;
      }

      if (fallbackToSystemBrowser) {
        const canOpen = await Linking.canOpenURL(url.toString());
        if (canOpen) {
          await Linking.openURL(url.toString());
        } else {
          throw new Error("Cannot open URL with system browser");
        }
      }
    },
    onError: () => displayError?.(),
  });

  switch (type) {
    case SSOButtonType.Link:
      return (
        <TouchableOpacity
          onPress={() => {
            onPress?.();
            openSSOLink();
          }}
        >
          <HStack alignItems="center">
            <Text color="$chTeal120" fontSize="$sm" marginRight={8}>
              {label}
            </Text>
            <ExternalLink color="#007E8C" size={16} />
          </HStack>
        </TouchableOpacity>
      );
    case SSOButtonType.Button:
      return (
        <Button
          rounded="$full"
          mb="$2"
          onPress={() => {
            onPress?.();
            openSSOLink();
          }}
          isDisabled={false}
        >
          {isLoading && <ButtonSpinner mr="$1" />}
          <ButtonText>{label}</ButtonText>
        </Button>
      );
  }
};

export { SSOButton, SSOButtonType };
