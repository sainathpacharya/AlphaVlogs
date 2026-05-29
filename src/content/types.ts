export interface DocumentSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalDocumentContent {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: DocumentSection[];
  footerNote?: string;
}

export type AboutUsIconKey =
  | 'sparkles'
  | 'target'
  | 'video'
  | 'shield'
  | 'crown';

export interface AboutUsHighlight {
  icon: AboutUsIconKey;
  title: string;
  description: string;
}

export interface AboutUsContent {
  appName: string;
  tagline: string;
  heroDescription: string;
  missionTitle: string;
  missionText: string;
  highlights: AboutUsHighlight[];
  featuresTitle: string;
  features: string[];
  trustTitle: string;
  trustText: string;
  contactLabel: string;
  contactEmail: string;
}
