import { useNavigation } from '@react-navigation/native';

interface HelpArticleParams {
  sectionId: number;
  id: number;
  icon: string;
  label: string;
}

export const navigateHelpArticle = (params: HelpArticleParams) => {
  // This function would typically navigate to a help article screen
  // For now, we'll create a placeholder implementation
  console.log('Navigate to help article:', params);
  
  // You can implement actual navigation logic here
  // Example:
  // navigation.navigate('HelpArticle', params);
};

// Hook version for use in components
export const useNavigateHelpArticle = () => {
  const navigation = useNavigation();
  
  return (params: HelpArticleParams) => {
    console.log('Navigate to help article:', params);
    // navigation.navigate('HelpArticle', params);
  };
};
