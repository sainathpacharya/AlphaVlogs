import { SafeAreaView } from "@/components/safe-area-view";
import { ScrollView } from "@/components/scroll-view";
import { VStack } from "@/components/vstack";
import { AppStackParamList } from "@/navigation/AppStack/types";
import { navigateHelpArticle } from "@/utils/navigation";
import { redirectBadgeUrl } from "@/utils/provider-badges";
import { useLinkTo } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Markdown from "react-native-markdown-display";

const BadgePage = ({
  route,
}: NativeStackScreenProps<AppStackParamList, "BadgePage">) => {
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
      icon: "arrow",
      label: "Additional medical coverage",
    });
  };

  return (
    <SafeAreaView>
      <VStack px={"$5"} pt={"$2"} gap={"$2"}>
        {route?.params?.header}

        <ScrollView>
          <Markdown
            onLinkPress={(url: string) => {
              return redirectBadgeUrl(url, linkTo, handleOpenArticleModal);
            }}
            style={{
              image: {
                resizeMode: "cover",
                height: 64,
                width: "50%",
              },
              paragraph: {
                color: "#232121",
              },
              link: {
                color: "#007E8C",
                textDecorationLine: "none",
                fontStyle: "normal",
              },
            }}
          >
            {atob(route?.params?.description || "")}
          </Markdown>
        </ScrollView>
      </VStack>
    </SafeAreaView>
  );
};

export default BadgePage;
