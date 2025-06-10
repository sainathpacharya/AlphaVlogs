import { Image, SafeAreaView } from "@/components";
import { useUserCachedStore } from "@/stores/user-cached-store";
import { useUserStore } from "@/stores/user-store";
import {
  API_URL_ENVIROMENTS,
  DEFAULT_ENVIROMENT,
  Envs,
  IS_FIRST_TIME_INIT,
  LANGUAGES_REVERT,
} from "@/utils/constants";
import logger from "@/utils/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Config from "react-native-config";
import SplashScreen from "react-native-splash-screen";

const LoadingPage = () => {
  const { isInitialized } = useUserStore();
  const { replace } = useNavigation<StackNavigationProp<ParamListBase>>();
  const { userId, setApiUrl, apiUrl, clearUser, env, preferredLanguage } =
    useUserCachedStore();

  const { i18n } = useTranslation();

  const validateAlreadyOpened = async (): Promise<boolean> => {
    try {
      const alreadyOpened = await AsyncStorage.getItem(IS_FIRST_TIME_INIT);
      if (!alreadyOpened || !apiUrl || !env) {
        clearUser(true);
        setApiUrl(
          API_URL_ENVIROMENTS[Config.env as Envs] ||
            API_URL_ENVIROMENTS[DEFAULT_ENVIROMENT]
        );
        try {
          await AsyncStorage.setItem(IS_FIRST_TIME_INIT, "false");
        } catch (error) {
          logger.error("Error saving data:", error);
        }
      } else {
        setApiUrl(API_URL_ENVIROMENTS[env as Envs]);
      }
      return !!alreadyOpened;
    } catch (error) {
      logger.error("Error getting data:", error);
    }
    return false;
  };

  const handleInit = async () => {
    const alreadyOpened = await validateAlreadyOpened();
    if (alreadyOpened) {
      i18n.changeLanguage(LANGUAGES_REVERT[preferredLanguage]);
      if (userId) {
        replace("AuthStack", { screen: "UnlockPage" });
      } else {
        replace("AuthStack");
      }
    } else {
      replace("AuthStack");
    }
    SplashScreen.hide();
  };

  useEffect(() => {
    if (!!API_URL_ENVIROMENTS && isInitialized) {
      handleInit();
    }
  }, [API_URL_ENVIROMENTS, isInitialized]);

  return (
    <SafeAreaView
      bg="$chBlack120"
      h="$full"
      alignItems="center"
      justifyContent="center"
    >
      <Image
        source={require("../../assets/png/Mark.png")}
        width={128}
        height={139.64}
        alt="splash-logo"
      />
    </SafeAreaView>
  );
};

export default LoadingPage;
