import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActionSheetIOS,
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
import Modal from "react-native-modal";

const WHITE = "#e0e2e1";
const BORDER_COLOR = "#cfd1d0";

export interface IActionItem {
  id: number | string;
  label: string;
  onPress: () => void;
}

interface Props {
  display: boolean;
  showActions: boolean;
  actionItems: IActionItem[];
  onClose: () => void;
  title?: string;
  message?: string;
  actionTextColor?: string;
}

const ActionSheet = (props: Props) => {
  const { display, showActions, actionItems, title, message, onClose } = props;
  const { t } = useTranslation();
  const [displayModal, setDisplayModal] = useState<boolean>(false);
  const isIOS = Platform.OS === "ios";

  const actionSheetItems = [
    ...actionItems,
    {
      id: "#cancel",
      label: t("COMMON.CANCEL"),
      onPress: props?.onClose,
    },
  ];

  useEffect(() => {
    if (showActions) {
      if (isIOS) {
        showIosActions();
      } else {
        setDisplayModal(true);
      }
    }
  }, [showActions]);

  useEffect(() => {
    if (displayModal && !display && !isIOS) {
      setDisplayModal(false);
    }
  }, [display]);

  const showIosActions = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: title,
        message: message,
        options: [t("COMMON.CANCEL"), ...actionItems.map((item) => item.label)],
        cancelButtonIndex: 0,
        userInterfaceStyle: "light",
      },
      (buttonIndex) => {
        const selectedItem = actionItems.find(({ id }) => id === buttonIndex);

        if (selectedItem && buttonIndex > 0) {
          selectedItem.onPress();
        }

        onClose();
      }
    );
  };

  return (
    <Modal
      isVisible={displayModal}
      style={{
        margin: 0,
        justifyContent: "flex-end",
      }}
      onBackdropPress={() => {
        setDisplayModal(false);
        onClose();
      }}
    >
      <View style={styles.modalContent}>
        {(props.title || props.message) && (
          <View style={styles.actionSheetHeader}>
            <Text style={styles.actionSheetTitle}>{props.title}</Text>
            <Text style={styles.actionSheetMessage}>{props.message}</Text>
          </View>
        )}

        {actionSheetItems.map((actionItem, index) => {
          return (
            <TouchableHighlight
              testID="action-sheet-item"
              style={[
                styles.actionSheetView,
                index === 0 &&
                  !props.title &&
                  !props.message && {
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                  },
                index === actionSheetItems?.length - 2 && {
                  borderBottomLeftRadius: 12,
                  borderBottomRightRadius: 12,
                },
                index === actionSheetItems?.length - 1 && {
                  borderBottomWidth: 0,
                  backgroundColor: WHITE,
                  marginTop: 8,
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  borderBottomLeftRadius: 12,
                  borderBottomRightRadius: 12,
                },
              ]}
              underlayColor={"#f7f7f7"}
              key={index}
              onPress={actionItem.onPress}
            >
              <Text
                allowFontScaling={false}
                style={[
                  styles.actionSheetText,
                  index === actionSheetItems?.length - 1 && {
                    fontWeight: "bold",
                  },
                ]}
              >
                {actionItem.label}
              </Text>
            </TouchableHighlight>
          );
        })}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginLeft: 8,
    marginRight: 8,
    marginBottom: 20,
    zIndex: 99999999999,
  },
  actionSheetText: {
    fontSize: 18,
    color: "rgb(0,98,255)",
  },
  actionSheetHeader: {
    backgroundColor: WHITE,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 26,
    borderBottomWidth: 1,
    borderColor: BORDER_COLOR,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  actionSheetTitle: {
    color: "#808280",
    fontWeight: "600",
    marginBottom: 4,
    fontSize: 16,
  },
  actionSheetMessage: {
    color: "#808280",
    fontWeight: "400",
    fontSize: 14,
    textAlign: "center",
  },
  actionSheetView: {
    backgroundColor: WHITE,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: BORDER_COLOR,
  },
});
export default ActionSheet;
