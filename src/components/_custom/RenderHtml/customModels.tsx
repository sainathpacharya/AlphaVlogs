import { iframeModel } from "@native-html/iframe-plugin";
import { Element, defaultHTMLElementModels } from "react-native-render-html";

export const customHTMLElementModels = {
  iframe: iframeModel,
  a: defaultHTMLElementModels.a.extend({
    getMixedUAStyles(node) {
      if (node.hasClass("callToAction")) {
        return {
          color: "#fff",
          textDecorationLine: "none",
          fontStyle: "normal",
          fontWeight: "700",
        };
      }

      return {
        color: "#006373",
        textDecorationLine: "none",
        fontStyle: "normal",
      };
    },
  }),
  p: defaultHTMLElementModels.p.extend({
    getMixedUAStyles(node, element) {
      const callButtons = element.children.filter(
        (child) => (child as Element).attribs?.class == "callToAction"
      );

      if (callButtons?.length) {
        return {
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
        };
      }

      const textAlign = node.hasClass("wysiwyg-text-align-center")
        ? "center"
        : node.hasClass("wysiwyg-text-align-right")
          ? "right"
          : node.hasClass("wysiwyg-text-align-justify")
            ? "justify"
            : "left";

      const showDecoration =
        element.children?.length && (element.children[0] as Element).attribs;

      const indentation = node.hasClass("wysiwyg-indent1")
        ? 8
        : node.hasClass("wysiwyg-indent2")
          ? 16
          : 0;

      return {
        color: "#525252",
        textAlign,
        paddingLeft: indentation,
        textDecorationLine: showDecoration ? "underline" : "none",
      };
    },
  }),
  th: defaultHTMLElementModels.th.extend({
    getMixedUAStyles(_, element) {
      const callButton = element.parentNode;

      try {
        if ((callButton?.parentNode as Element)?.name === "thead") {
          return {
            backgroundColor: "#EEEEEE",
            borderColor: "red",
          };
        }
      } catch {}
    },
  }),
};
