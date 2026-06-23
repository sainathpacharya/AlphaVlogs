import { redirectBadgeUrl } from '../../src/utils/provider-badges';

describe('provider-badges utils', () => {
  const linkTo = jest.fn();
  const handleOpenArticleModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not handle external http(s) URLs', () => {
    expect(
      redirectBadgeUrl('https://example.com/article', linkTo, handleOpenArticleModal),
    ).toBe(false);
    expect(
      redirectBadgeUrl('http://example.com/article', linkTo, handleOpenArticleModal),
    ).toBe(false);
    expect(linkTo).not.toHaveBeenCalled();
    expect(handleOpenArticleModal).not.toHaveBeenCalled();
  });

  it('opens article modal for valid badge:// URLs', () => {
    expect(
      redirectBadgeUrl('badge://12/34', linkTo, handleOpenArticleModal),
    ).toBe(true);
    expect(handleOpenArticleModal).toHaveBeenCalledWith({
      sectionId: 12,
      articleId: 34,
    });
  });

  it('rejects malformed badge:// URLs', () => {
    expect(
      redirectBadgeUrl('badge://abc/34', linkTo, handleOpenArticleModal),
    ).toBe(false);
    expect(
      redirectBadgeUrl('badge://12', linkTo, handleOpenArticleModal),
    ).toBe(false);
  });

  it('routes internal paths via linkTo', () => {
    expect(redirectBadgeUrl('/dashboard', linkTo, handleOpenArticleModal)).toBe(true);
    expect(linkTo).toHaveBeenCalledWith('/dashboard');
  });

  it('returns false for unrecognized URLs', () => {
    expect(
      redirectBadgeUrl('custom-scheme://foo', linkTo, handleOpenArticleModal),
    ).toBe(false);
  });
});
