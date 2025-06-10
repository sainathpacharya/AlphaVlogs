import { ReactElement } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const IS_IPHONE_X = SCREEN_HEIGHT === 812 || SCREEN_HEIGHT === 896;
const STATUS_BAR_HEIGHT = Platform.OS === "ios" ? (IS_IPHONE_X ? 44 : 20) : 0;
const NAV_BAR_HEIGHT = Platform.OS === "ios" ? (IS_IPHONE_X ? 88 : 64) : 64;

const SCROLL_EVENT_THROTTLE = 16;
const DEFAULT_HEADER_MAX_HEIGHT = 170;
const DEFAULT_HEADER_MIN_HEIGHT = NAV_BAR_HEIGHT;
const DEFAULT_EXTRA_SCROLL_HEIGHT = 30;
const DEFAULT_BACKGROUND_IMAGE_SCALE = 1.5;

const DEFAULT_NAVBAR_COLOR = "#3498db";
const DEFAULT_BACKGROUND_COLOR = "#303F9F";
const DEFAULT_TITLE_COLOR = "white";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: DEFAULT_NAVBAR_COLOR,
    overflow: "hidden",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: null,
    height: DEFAULT_HEADER_MAX_HEIGHT,
    resizeMode: "cover",
  },
  bar: {
    backgroundColor: "transparent",
    height: DEFAULT_HEADER_MIN_HEIGHT,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  headerTitle: {
    backgroundColor: "transparent",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: STATUS_BAR_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    color: DEFAULT_TITLE_COLOR,
    textAlign: "center",
    fontSize: 16,
  },
});

interface IPageHeaderProps {
  renderNavBar?: ReactElement;
  renderContent: ReactElement;
  searchBar?: ReactElement;
  backgroundColor?: string;
  backgroundImage?: string;
  navbarColor?: string;
  title: string | ReactElement;
  titleStyle?: TextStyle;
  headerTitleStyle?: TextStyle;
  headerMaxHeight?: number;
  headerMinHeight?: number;
  scrollEventThrottle?: number;
  extraScrollHeight?: number;
  backgroundImageScale?: number;
  contentContainerStyle?: TextStyle;
  innerContainerStyle?: TextStyle;
  scrollViewStyle?: TextStyle;
  containerStyle?: TextStyle;
  alwaysShowTitle?: boolean;
  alwaysShowNavBar?: boolean;
  statusBarColor?: string;
  scrollViewProps?: any;
  scrollEnabled?: boolean;
}
const PageHeader = (props: IPageHeaderProps) => {
  const {
    renderNavBar = <View />,
    renderContent = <View />,
    searchBar = undefined,
    navbarColor = DEFAULT_NAVBAR_COLOR,
    backgroundColor = DEFAULT_BACKGROUND_COLOR,
    backgroundImage = undefined,
    title = undefined,
    titleStyle = styles.headerText,
    headerTitleStyle = undefined,
    headerMaxHeight = DEFAULT_HEADER_MAX_HEIGHT,
    headerMinHeight = DEFAULT_HEADER_MAX_HEIGHT,
    scrollEventThrottle = SCROLL_EVENT_THROTTLE,
    extraScrollHeight = DEFAULT_EXTRA_SCROLL_HEIGHT,
    backgroundImageScale = DEFAULT_BACKGROUND_IMAGE_SCALE,
    contentContainerStyle = undefined,
    innerContainerStyle = undefined,
    scrollViewStyle = undefined,
    containerStyle = undefined,
    alwaysShowTitle = false,
    alwaysShowNavBar = true,
    statusBarColor = undefined,
    scrollViewProps = {},
    scrollEnabled = true,
  } = props;

  const scrollY = new Animated.Value(0);

  const getHeaderMaxHeight = () => {
    return headerMaxHeight;
  };

  const getHeaderMinHeight = () => {
    return headerMinHeight;
  };

  const getHeaderScrollDistance = () => {
    return getHeaderMaxHeight() - getHeaderMinHeight();
  };

  const getExtraScrollHeight = () => {
    return extraScrollHeight;
  };

  const getBackgroundImageScale = () => {
    return backgroundImageScale;
  };

  const getInputRange = () => {
    return [-getExtraScrollHeight(), 0, getHeaderScrollDistance()];
  };

  const getHeaderHeight = () => {
    return scrollY.interpolate({
      inputRange: getInputRange(),
      outputRange: [
        getHeaderMaxHeight() + getExtraScrollHeight(),
        getHeaderMaxHeight(),
        getHeaderMinHeight(),
      ],
      extrapolate: "clamp",
    });
  };

  const getImageOpacity = () => {
    return scrollY.interpolate({
      inputRange: getInputRange(),
      outputRange: [1, 1, 0],
      extrapolate: "clamp",
    });
  };

  const getImageTranslate = () => {
    return scrollY.interpolate({
      inputRange: getInputRange(),
      outputRange: [0, 0, -50],
      extrapolate: "clamp",
    });
  };

  const getImageScale = () => {
    return scrollY.interpolate({
      inputRange: getInputRange(),
      outputRange: [getBackgroundImageScale(), 1, 1],
      extrapolate: "clamp",
    });
  };

  const getTitleTranslateY = () => {
    return scrollY.interpolate({
      inputRange: getInputRange(),
      outputRange: [5, 0, 0],
      extrapolate: "clamp",
    });
  };

  const renderBackgroundImage = () => {
    const { backgroundImage } = props;
    const imageOpacity = getImageOpacity();
    const imageTranslate = getImageTranslate();
    const imageScale = getImageScale();

    return (
      <Animated.Image
        style={[
          styles.backgroundImage,
          {
            height: getHeaderMaxHeight(),
            opacity: imageOpacity,
            transform: [{ translateY: imageTranslate }, { scale: imageScale }],
          },
        ]}
        source={{ uri: backgroundImage }}
      />
    );
  };

  const renderPlainBackground = () => {
    const imageOpacity = getImageOpacity();
    const imageTranslate = getImageTranslate();
    const imageScale = getImageScale();

    return (
      <Animated.View
        style={{
          height: getHeaderMaxHeight(),
          backgroundColor,
          opacity: imageOpacity,
          transform: [{ translateY: imageTranslate }, { scale: imageScale }],
        }}
      />
    );
  };

  const renderNavbarBackground = () => {
    // const navBarOpacity = getNavBarOpacity();

    return (
      <Animated.View
        style={[
          styles.header,
          {
            height: getHeaderHeight(),
            backgroundColor: navbarColor,
            // opacity: navBarOpacity,
          },
        ]}
      />
    );
  };

  const renderHeaderBackground = () => {
    const imageOpacity = getImageOpacity();

    return (
      <Animated.View
        style={[
          styles.header,
          {
            height: getHeaderHeight(),
            opacity: imageOpacity,
            backgroundColor: backgroundImage ? "transparent" : backgroundColor,
          },
        ]}
      >
        {backgroundImage && renderBackgroundImage()}
        {!backgroundImage && renderPlainBackground()}
      </Animated.View>
    );
  };

  const renderHeaderTitle = () => {
    const titleTranslateY = getTitleTranslateY();
    // const titleOpacity = getTitleOpacity();

    return (
      <>
        <Animated.View
          style={[
            styles.headerTitle,
            {
              // transform: [{ translateY: titleTranslateY }],
              height: getHeaderHeight(),
              // opacity: titleOpacity,
            },
            headerTitleStyle,
          ]}
        >
          {typeof title === "string" && (
            <Text style={[styles.headerText, titleStyle]}>{title}</Text>
          )}
          {typeof title !== "string" && title}
          {searchBar}
        </Animated.View>
      </>
    );
  };

  const renderScrollView = () => {
    const { onScroll } = scrollViewProps;

    // remove scrollViewProps.onScroll in renderScrollViewProps so we can still get default scroll behavior
    // if a caller passes in `onScroll` prop
    const renderableScrollViewProps = Object.assign({}, scrollViewProps);
    delete renderableScrollViewProps.onScroll;

    return (
      <Animated.ScrollView
        style={[styles.scrollView, scrollViewStyle]}
        contentContainerStyle={contentContainerStyle}
        scrollEventThrottle={scrollEventThrottle}
        scrollEnabled={scrollEnabled}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: false,
            listener: onScroll,
          }
        )}
        {...renderableScrollViewProps}
      >
        <View
          style={[{ marginTop: getHeaderMaxHeight() }, innerContainerStyle]}
        >
          {renderContent}
        </View>
      </Animated.ScrollView>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <StatusBar backgroundColor={statusBarColor || navbarColor} />
      {renderScrollView()}
      {renderNavbarBackground()}
      {renderHeaderBackground()}
      {renderHeaderTitle()}
    </View>
  );
};

export default PageHeader;
