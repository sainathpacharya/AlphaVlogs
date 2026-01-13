import { Text } from '@/components';
import { useUserCachedStore } from '@/stores/user-cached-store';
import { checkHtmlTags } from '@/utils/textEnrichedResp';
import { FC } from 'react';
import { Linking, useWindowDimensions } from 'react-native';
import { RenderHTML } from 'react-native-render-html';
import { classStyle, mixedStyle } from './constants';
import { customHTMLElementModels } from './customModels';
import {
  ARender,
  IframeRender,
  ImageRender,
  LiRender,
  OLRender,
  TDRender,
  THRender,
  TableRender,
} from './renders';

interface RenderHtml {
  sourceHtml: string;
  fontSize?: string;
}

const renderers = {
  ol: OLRender,
  li: LiRender,
  a: ARender,
  iframe: IframeRender,
  img: ImageRender,
  table: TableRender,
  td: TDRender,
  th: THRender,
};

const RenderHtml: FC<RenderHtml> = ({ fontSize = '16px', sourceHtml }) => {
  const { width } = useWindowDimensions();

  const parseTextWithLinks = (text: string) => {
    const urlPattern = /(https?:\/\/[^\s]+)/g;

    const parts = text.split(urlPattern);

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <Text
            key={`render_link_${index}`}
            onPress={() => Linking.openURL(part)}
            color="$chTeal120"
          >
            {part}
          </Text>
        );
      } else {
        return <Text key={`render_text_${index}`}>{part}</Text>;
      }
    });
  };

  if (!checkHtmlTags(sourceHtml)) {
    return <Text>{parseTextWithLinks(sourceHtml)}</Text>;
  }

  const html = sourceHtml
    ?.replaceAll('<li>\n<p>', '<li>')
    ?.replaceAll('</p>\n</li>', '</li>')
    ?.replaceAll(
      'data-href="',
      `href=\"${useUserCachedStore.getState().apiUrl?.replace('/api', '')}`
    )
    ?.replaceAll(/(\s*height\s*:\s*[^;]*;?\s*)+?/g, '')
    ?.replaceAll('<li>\n<div>', "<li class='custom-li'>");

  return (
    <RenderHTML
      contentWidth={width}
      source={{
        html,
      }}
      tagsStyles={mixedStyle(fontSize)}
      classesStyles={classStyle}
      customHTMLElementModels={customHTMLElementModels}
      renderers={renderers}
    />
  );
};

export default RenderHtml;
