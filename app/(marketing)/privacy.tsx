import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Link } from 'expo-router';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <Text style={styles.p}>{children}</Text>;
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.li}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.liText}>{children}</Text>
    </View>
  );
}

export default function PrivacyPage() {
  if (Platform.OS !== 'web') return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <Text style={styles.headerSub}>Anchor Bible App</Text>
      </View>

      <View style={styles.content}>
        <Link href="/(marketing)" asChild>
          <TouchableOpacity style={styles.backLink}>
            <Text style={styles.backLinkText}>← Back to Anchor</Text>
          </TouchableOpacity>
        </Link>

        <View style={styles.updated}>
          <Text style={styles.updatedText}>Last Updated: January 29, 2026</Text>
        </View>

        <Section title="Introduction">
          <P>Welcome to Anchor ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience using our mobile application and services. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the Anchor Bible app (the "App").</P>
          <P>Please read this Privacy Policy carefully. By using the App, you agree to the collection and use of information in accordance with this policy.</P>
        </Section>

        <Section title="Information We Collect">
          <Text style={styles.h3}>Personal Information</Text>
          <Li>Email Address: Collected when you create an account</Li>
          <Li>User ID: A unique identifier assigned to your account</Li>
          <Li>Authentication Data: Login credentials and session tokens</Li>

          <Text style={styles.h3}>Usage Data</Text>
          <Li>Reading Progress: Bible chapters you've read and completed</Li>
          <Li>Bookmarks & Favorites: Verses you've saved or bookmarked</Li>
          <Li>Bible Version Preferences: Your selected Bible translation</Li>
          <Li>App Usage Data: Features used, time spent in the app</Li>

          <Text style={styles.h3}>AI Chat Data</Text>
          <Li>Chat Messages: Questions you ask and responses provided</Li>
          <Li>Usage Metrics: Number of messages sent, feature engagement</Li>

          <Text style={styles.h3}>Device Information</Text>
          <Li>Device Type: Phone model and operating system</Li>
          <Li>App Version: Version of Anchor you're using</Li>
          <Li>IP Address: For security and analytics purposes</Li>
        </Section>

        <Section title="How We Use Your Information">
          <Li>Deliver Bible content in your preferred translation</Li>
          <Li>Save your reading progress and bookmarks</Li>
          <Li>Provide personalized Verse of the Day</Li>
          <Li>Process AI chat requests through OpenAI</Li>
          <Li>Send daily verse notifications (if enabled)</Li>
          <Li>Protect against unauthorized access and abuse</Li>
        </Section>

        <Section title="Third-Party Services">
          <P>We use the following third-party services:</P>
          <Li>Neon (Database): User data and content storage</Li>
          <Li>OpenAI (AI Chat): Process AI requests via GPT-3.5 Turbo</Li>
          <Li>Bible API: Retrieve Bible verses and translations</Li>
          <Li>Cloudflare R2 (File Storage): Image and audio file storage</Li>
          <Li>Upstash (Redis): Rate limiting and caching</Li>
        </Section>

        <Section title="Data Storage and Security">
          <P>Your data is securely stored using Neon's PostgreSQL infrastructure. Data is encrypted in transit (HTTPS/TLS) and at rest. We implement secure authentication, access controls, and regular security practices.</P>
          <Li>Active Accounts: Data retained while your account is active</Li>
          <Li>Deleted Accounts: Data permanently deleted within 30 days</Li>
        </Section>

        <Section title="Your Privacy Rights">
          <Li>Access: Request a copy of your personal data</Li>
          <Li>Correct: Update inaccurate information in account settings</Li>
          <Li>Delete: Request deletion of your account and data</Li>
          <Li>Export: Request an export of your data</Li>
          <Li>Opt-Out: Disable push notifications at any time</Li>
        </Section>

        <Section title="Children's Privacy">
          <P>Anchor is intended for users of all ages. We do not knowingly collect personal information from children under 13 without parental consent. If you believe your child has provided us with personal information, please contact us.</P>
        </Section>

        <Section title="Changes to This Privacy Policy">
          <P>We may update this Privacy Policy from time to time. We will notify you of changes by posting the new policy in the App and updating the "Last Updated" date.</P>
        </Section>

        <Section title="Contact Us">
          <P>Email: Anchrapp@outlook.com</P>
          <P>Website: anchrapp.io</P>
          <P>We will respond to your inquiry within 30 days.</P>
        </Section>

        <View style={styles.footerInfo}>
          <Text style={styles.footerInfoText}>Effective Date: January 29, 2026</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.copyright}>© 2026 Anchor Bible App. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    backgroundColor: '#000000',
    padding: 48,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 40, fontWeight: '700', color: '#ffffff', marginBottom: 8 },
  headerSub: { fontSize: 18, color: '#9ca3af' },
  content: { maxWidth: 900, alignSelf: 'center', width: '100%', padding: 32, backgroundColor: '#ffffff' },
  backLink: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  backLinkText: { color: '#ffffff', fontWeight: '600' },
  updated: {
    backgroundColor: '#f7fafc',
    borderLeftWidth: 4,
    borderLeftColor: '#1a1a1a',
    padding: 16,
    marginBottom: 32,
  },
  updatedText: { fontWeight: '600', color: '#4a5568' },
  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
  },
  h3: { fontSize: 20, fontWeight: '600', color: '#4a5568', marginTop: 20, marginBottom: 8 },
  p: { fontSize: 16, color: '#4a5568', lineHeight: 26, marginBottom: 12 },
  li: { flexDirection: 'row', marginBottom: 8, paddingLeft: 8 },
  bullet: { color: '#4a5568', marginRight: 8, fontSize: 16 },
  liText: { flex: 1, fontSize: 16, color: '#4a5568', lineHeight: 24 },
  footerInfo: { alignItems: 'center', paddingTop: 32, borderTopWidth: 2, borderTopColor: '#e2e8f0' },
  footerInfoText: { color: '#718096', fontSize: 14 },
  footer: { backgroundColor: '#2d3748', padding: 32, alignItems: 'center' },
  copyright: { color: '#ffffff', fontSize: 14 },
});
