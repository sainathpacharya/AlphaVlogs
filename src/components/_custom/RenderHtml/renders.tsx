import { Box, HStack, Text, VStack } from "@/components";
import { handleUrl } from "@/navigation/lib";
import { useHelpStore } from "@/stores/help-store";
import { useLinkTo } from "@react-navigation/native";
import { parseDocument } from "htmlparser2";
import { useMemo } from "react";
import { TouchableOpacity, useWindowDimensions } from "react-native";
import {
  CustomBlockRenderer,
  CustomMixedRenderer,
  CustomTextualRenderer,
  TChildrenRenderer,
  domNodeToHTMLString,
  useInternalRenderer,
  useTNodeChildrenProps,
} from "react-native-render-html";
import { SvgUri } from "react-native-svg";
import CHWebView from "../CHWebView";

export const OLRender: CustomBlockRenderer = (props) => {
  const { tnode, TDefaultRenderer } = props;

  try {
    const tchildrenProps = useTNodeChildrenProps(props);

    return (
      <Box>
        {tnode.children?.map((child, index) => {
          return (
            <HStack
              key={`ol-child-${index}`}
              mb="$4"
              gap="$2"
              alignItems="flex-start"
            >
              <VStack
                bg="$trueGray300"
                borderRadius="$full"
                w={24}
                h={24}
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="$xs">{index + 1}</Text>
              </VStack>

              <VStack flexGrow={1} w="$5/6">
                <TChildrenRenderer {...tchildrenProps} tchildren={[child]} />
              </VStack>
            </HStack>
          );
        })}
      </Box>
    );
  } catch {
    return <TDefaultRenderer {...props} />;
  }
};

export const ARender: CustomTextualRenderer = ({
  TDefaultRenderer,
  ...props
}) => {
  try {
    const { tnode } = props;
    const linkUrl = tnode.attributes?.["href"];
    const { linking } = useHelpStore();
    const linkTo = useLinkTo();
    const validLinkTo = linking || linkTo;

    if (tnode.hasClass("callToAction")) {
      return (
        <HStack>
          <VStack
            bg="#F76056"
            py={10}
            px={18}
            justifyContent="center"
            alignItems="center"
            borderRadius="$full"
          >
            <TouchableOpacity onPress={() => handleUrl(linkUrl, validLinkTo)}>
              <TDefaultRenderer {...props} />
            </TouchableOpacity>
          </VStack>
          <Box w={6}></Box>
        </HStack>
      );
    }

    return (
      <TDefaultRenderer
        {...props}
        onPress={() => handleUrl(linkUrl, validLinkTo)}
      />
    );
  } catch {}

  return <TDefaultRenderer {...props} />;
};

export const IframeRender: CustomBlockRenderer = ({
  TDefaultRenderer,
  ...props
}) => {
  try {
    const { tnode } = props;
    const { src, width, height } = tnode.attributes;

    let url = src;
    const w = width && typeof width === "string" ? parseInt(width) : 560;
    const h = height && typeof height === "string" ? parseInt(height) : 315;

    if (!url.includes("http")) {
      url = "https:" + url;
    }

    return (
      <VStack w={w} h={h}>
        <CHWebView
          source={{
            html: `<iframe src="${url}"  width="${w}" height="${h}" frameborder="0" allowfullscreen=""></iframe>`,
          }}
        />
      </VStack>
    );
  } catch {
    return <TDefaultRenderer {...props} />;
  }
};

export const LiRender: CustomTextualRenderer = ({
  TDefaultRenderer,
  ...props
}) => {
  try {
    const { tnode } = props;
    const html = useMemo(() => domNodeToHTMLString(tnode.domNode), [tnode]);

    if (html.match(/custom-li/g) && html.match(/<img/g)) {
      const parsedDocument = parseDocument(html);

      const customLI = parsedDocument.children[0].children;

      if (customLI) {
        return (
          <Text p={0} m={0}>
            {customLI.map((child, index) => {
              const { data, type, name, attribs } = child;

              if (type === "text") {
                return (
                  <Text fontSize={14} key={index}>
                    {data}
                  </Text>
                );
              } else if (
                type === "tag" &&
                name === "strong" &&
                child.children &&
                child.children?.length
              ) {
                return (
                  <Text fontSize={14} fontWeight="bold" key={index}>
                    {child.children[0].data}
                  </Text>
                );
              } else if (type === "tag" && name === "img") {
                const { height, src, width } = attribs;

                return (
                  <HStack w={width} h={height} key={index}>
                    <SvgUri
                      uri={src}
                      height={height}
                      width={width}
                      style={{ maxWidth: "100%" }}
                    />
                  </HStack>
                );
              }

              <Text fontSize={14} key={index}>
                {data || ""}
              </Text>;
            })}
          </Text>
        );
      }
    }
  } catch {}

  return (
    <VStack w="$full">
      <TDefaultRenderer {...props} />
    </VStack>
  );
};

export const TableRender: CustomTextualRenderer = ({
  TDefaultRenderer,
  ...props
}) => {
  try {
    const { tnode } = props;

    const html = useMemo(() => domNodeToHTMLString(tnode.domNode), [tnode]);
    const child = (html.match(/<tr/g) || [])?.length;

    return (
      <VStack w="$full" minHeight={child * 60} p="$2">
        <TDefaultRenderer {...props} />
      </VStack>
    );
  } catch {
    return (
      <VStack w="$full" minHeight={200} p="$2">
        <TDefaultRenderer {...props} />
      </VStack>
    );
  }
};

export const TDRender: CustomTextualRenderer = ({
  TDefaultRenderer,
  ...props
}) => {
  try {
    const { tnode } = props;
    const tchildrenProps = useTNodeChildrenProps(props);

    return (
      <VStack flex={1} p="$3" justifyContent="center">
        {tnode.children.map((child) => (
          <TChildrenRenderer {...tchildrenProps} tchildren={[child]} />
        ))}
      </VStack>
    );
  } catch {
    return <TDefaultRenderer {...props} />;
  }
};

export const THRender: CustomTextualRenderer = ({
  TDefaultRenderer,
  ...props
}) => {
  try {
    const { tnode } = props;
    const tchildrenProps = useTNodeChildrenProps(props);

    return (
      <VStack p="$0.5" overflow="hidden" flex={1}>
        <VStack flex={1} p="$2" bgColor="$chGray030" justifyContent="center">
          {tnode.children.map((child) => (
            <TChildrenRenderer {...tchildrenProps} tchildren={[child]} />
          ))}
        </VStack>
      </VStack>
    );
  } catch {
    return <TDefaultRenderer {...props} />;
  }
};

export const ImageRender: CustomMixedRenderer = (props) => {
  const { Renderer, rendererProps } = useInternalRenderer("img", props);
  const { width } = useWindowDimensions();

  try {
    const { tnode } = props;
    const { src, width, height } = tnode.attributes;

    if (src.includes(".svg")) {
      const injectedJavaScript = `
          (function() {
            function getSVGHeight() {
              var svg = document.querySelector('svg');
              if (svg) {
                window.ReactNativeWebView.postMessage('height:' + svg.getBoundingClientRect().height);
              }
            }
            window.addEventListener('load', getSVGHeight);
            window.addEventListener('resize', getSVGHeight);
          })();
        `;

      if (parseInt(height) > 124 || height === undefined) {
        return (
          <VStack
            w="$full"
            justifyContent="flex-start"
            h={parseInt(height) || 320}
            py="$1"
          >
            <CHWebView
              originWhitelist={["*"]}
              source={{
                uri: src,
              }}
              injectedJavaScript={injectedJavaScript}
            />
          </VStack>
        );
      }

      return (
        <HStack>
          <SvgUri
            uri={src}
            height={height}
            width={width}
            style={{ maxWidth: "100%" }}
          />
        </HStack>
      );
    }
  } catch {
    return (
      <HStack px="$4">
        <Renderer {...rendererProps} style={{ maxWidth: width - 48 }} />
      </HStack>
    );
  }

  return (
    <HStack px="$4">
      <Renderer {...rendererProps} style={{ maxWidth: width - 48 }} />
    </HStack>
  );
};
