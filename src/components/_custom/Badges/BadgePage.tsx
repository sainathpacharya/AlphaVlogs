import {SafeAreaView} from '@/components/safe-area-view';
import {ScrollView} from '@/components/scroll-view';
import {VStack, HStack, Text, Pressable, Box} from '@/components/vstack';
import {AppStackParamList} from '@/navigation/AppStack/types';
import {navigateHelpArticle} from '@/utils/navigation';
import {redirectBadgeUrl} from '@/utils/provider-badges';
import {useLinkTo, useNavigation} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Markdown from 'react-native-markdown-display';
import {useThemeColors} from '@/utils/colors';

const BadgePage = ({
  route,
}: NativeStackScreenProps<AppStackParamList, 'BadgePage'>) => {
  const linkTo = useLinkTo();
  const handleOpenArticleModal = ({
    articleId,
    sectionId,
  }: {
    sectionId: number;
    articleId: number;
  }) => {
    navigateHelpArticle({
      sectionId,
      id: articleId,
      icon: 'arrow',
      label: 'Additional medical coverage',
    });
  };

  return (
    <SafeAreaView>
      {/* Custom Header with Back Button */}
      <HStack
        alignItems="center"
        justifyContent="space-between"
        px="$5"
        pt="$2"
        pb="$2"
        style={{backgroundColor: colors.primaryBackground}}>
        <Pressable
          onPress={() => navigation.goBack()}
          p="$2"
          borderRadius="$md"
          style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
          <Text style={{color: colors.white, fontSize: 18}}>←</Text>
        </Pressable>
        <Text
          style={{
            color: colors.primaryText,
            fontSize: 20,
            fontWeight: 'bold',
            flex: 1,
            textAlign: 'center',
          }}>
          Badge Details
        </Text>
        <Box w="$10" />
      </HStack>

      <VStack px={'$5'} pt={'$2'} gap={'$2'}>
        {route?.params?.header}

        <ScrollView>
          <Markdown
            onLinkPress={(url: string) => {
              return redirectBadgeUrl(url, linkTo, handleOpenArticleModal);
            }}
            style={{
              image: {
                resizeMode: 'cover',
                height: 64,
                width: '50%',
              },
              paragraph: {
                color: '#232121',
              },
              link: {
                color: '#007E8C',
                textDecorationLine: 'none',
                fontStyle: 'normal',
              },
            }}>
            {atob(route?.params?.description || '')}
          </Markdown>
        </ScrollView>
      </VStack>
    </SafeAreaView>
  );
};

export default BadgePage;
