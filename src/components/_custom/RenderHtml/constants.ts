import { MixedStyleRecord } from 'react-native-render-html';

export const mixedStyle = (fontSize: string | number): MixedStyleRecord => ({
  body: {
    color: '#3E3939',
  },
  p: {
    fontSize,
    lineHeight: 24,
    fontWeight: '400',
    color: '#3E3939',
    textDecorationLine: 'none',
  },
  th: {
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
    minHeight: 60,
  },
  td: {
    padding: 12,
    minHeight: 60,
  },
  thead: {
    minHeight: 60,
  },
  table: {
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#E0E3E4',
    overflow: 'hidden',
  },
  tr: {
    minHeight: 60,
    borderColor: '#E0E3E4',
    borderBottomWidth: 1,
  },
  pre: {
    borderWidth: 1,
    borderColor: '#706F6E',
    backgroundColor: '#EEEEEE',
    borderRadius: 6,
    padding: 12,
  },
  h1: {
    fontWeight: 400,
    marginBottom: 56,
  },
  h2: {
    fontWeight: 400,
  },
  h3: { height: 'auto', minHeight: 16 },
});

export const classStyle: MixedStyleRecord = {
  callOut: {
    borderRadius: 2,
    borderColor: '#000',
    borderWidth: 0.3,
    paddingHorizontal: 32,
    paddingVertical: 12,
    paddingBottom: 22,
  },
  bar: {
    height: 0,
  },
  info: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B4E85',
    marginTop: 12,
    marginBottom: 48,
    maxWidth: '98%',
  },
  warning: {
    borderLeftWidth: 4,
    borderLeftColor: '#D6AE3E',
    marginTop: 12,
    marginBottom: 48,
    maxWidth: '98%',
  },
  content: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  'wysiwyg-underline': { textDecorationLine: 'underline' },
};
