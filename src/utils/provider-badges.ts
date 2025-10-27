import { useLinkTo } from '@react-navigation/native';

interface OpenArticleModalParams {
  sectionId: number;
  articleId: number;
}

export const redirectBadgeUrl = (
  url: string,
  linkTo: ReturnType<typeof useLinkTo>,
  handleOpenArticleModal: (params: OpenArticleModalParams) => void
) => {
  // Handle different types of URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // External URL - you might want to open in a web view or external browser
    console.log('Opening external URL:', url);
    // You can implement external URL handling here
    return false; // Don't handle the link, let it open normally
  }
  
  if (url.startsWith('badge://')) {
    // Custom badge protocol - parse and handle
    const urlParts = url.replace('badge://', '').split('/');
    if (urlParts.length >= 2) {
      const sectionId = parseInt(urlParts[0] || '', 10);
      const articleId = parseInt(urlParts[1] || '', 10);
      
      if (!isNaN(sectionId) && !isNaN(articleId)) {
        handleOpenArticleModal({ sectionId, articleId });
        return true; // Handle the link
      }
    }
  }
  
  // For internal navigation, you can use linkTo
  if (url.startsWith('/')) {
    linkTo(url);
    return true; // Handle the link
  }
  
  return false; // Don't handle the link
};
