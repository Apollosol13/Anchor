import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Link } from "expo-router";

const features = [
  {
    icon: "📖",
    title: "Read the Bible",
    desc: "Access the complete Bible with multiple translations.",
  },
  {
    icon: "🎨",
    title: "Create Beautiful Images",
    desc: "Share verses with stunning backgrounds and designs.",
  },
  {
    icon: "💬",
    title: "AI Bible Chat",
    desc: "Ask questions and explore scripture with AI assistance.",
  },
  {
    icon: "🔖",
    title: "Bookmark & Save",
    desc: "Keep track of your favorite verses and passages.",
  },
];

export default function LandingPage() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.logo}>⚓️</Text>
        <Text style={styles.title}>Anchor</Text>
        <Text style={styles.subtitle}>
          Share God's Word Beautifully. Read the Bible, create stunning verse
          images, and strengthen your faith journey.
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Coming Soon to App Store</Text>
        </View>
      </View>

      <View style={styles.features}>
        {features.map((f, i) => (
          <View key={i} style={styles.feature}>
            <Text style={styles.featureTitle}>
              {f.icon} {f.title}
            </Text>
            <Text style={styles.featureDesc}>{f.desc}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerLinks}>
          <Link href="/(marketing)/privacy" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </TouchableOpacity>
          </Link>
          <Text style={styles.footerSep}>|</Text>
          <Link href="/(marketing)/terms" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Terms of Service</Text>
            </TouchableOpacity>
          </Link>
          <Text style={styles.footerSep}>|</Text>
          <Text style={styles.footerLink}>Anchrapp@outlook.com</Text>
        </View>
        <Text style={styles.copyright}>
          © 2026 Anchor Bible App. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    alignItems: "center",
    padding: 24,
    paddingTop: 80,
  },
  hero: {
    alignItems: "center",
    maxWidth: 600,
    marginBottom: 60,
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 40,
  },
  badge: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  badgeText: {
    color: "#6b7280",
    fontWeight: "600",
    fontSize: 18,
  },
  features: {
    maxWidth: 600,
    width: "100%",
    marginBottom: 60,
  },
  feature: {
    marginBottom: 24,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 8,
  },
  featureDesc: {
    fontSize: 16,
    color: "#9ca3af",
    lineHeight: 24,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
    paddingTop: 40,
    alignItems: "center",
    width: "100%",
  },
  footerLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },
  footerLink: {
    color: "#9ca3af",
    fontSize: 14,
  },
  footerSep: {
    color: "#2a2a2a",
    fontSize: 14,
  },
  copyright: {
    color: "#6b7280",
    fontSize: 14,
  },
});
