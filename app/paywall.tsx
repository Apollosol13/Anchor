import { useSubscription } from "@/lib/contexts/SubscriptionContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PaywallScreen() {
  const { availablePackages, purchasePackage, restorePurchases, isLoading } =
    useSubscription();
  const [selectedPackage, setSelectedPackage] = useState<number>(1); // Default to monthly
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async () => {
    if (!availablePackages[selectedPackage]) {
      Alert.alert("Error", "Package not available");
      return;
    }

    setPurchasing(true);
    try {
      const result = await purchasePackage(availablePackages[selectedPackage]);
      if (result.success) {
        Alert.alert("Success!", "Welcome to Anchor Premium!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to complete purchase");
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    try {
      await restorePurchases();
      Alert.alert("Success", "Purchases restored successfully");
    } catch (error) {
      Alert.alert("Error", "No purchases found");
    } finally {
      setPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  const packages = [
    {
      title: "Weekly",
      price: "$3.99",
      period: "per week",
      identifier: "weekly",
      savings: null,
    },
    {
      title: "Monthly",
      price: "$12.99",
      period: "per month",
      identifier: "monthly",
      savings: "35% off weekly",
      popular: true,
    },
    {
      title: "Yearly",
      price: "$79.99",
      period: "per year",
      identifier: "yearly",
      savings: "Best Value - $6.67/mo",
      bestValue: true,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={28} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <LinearGradient
            colors={["#ffffff", "#e5e5e5"]}
            style={styles.iconContainer}
          >
            <Ionicons name="diamond" size={48} color="#000000" />
          </LinearGradient>
          <Text style={styles.title}>Upgrade to Premium</Text>
          <Text style={styles.subtitle}>Unlock the full power of Anchor</Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <FeatureItem
            icon="chatbubbles"
            title="Unlimited AI Chat"
            description="Ask unlimited questions about scripture"
          />
          <FeatureItem
            icon="sparkles"
            title="Advanced Study Tools"
            description="Access premium Bible study features"
          />
          <FeatureItem
            icon="flash"
            title="Early Access"
            description="Be first to try new features"
          />
          <FeatureItem
            icon="headset"
            title="Priority Support"
            description="Get help faster when you need it"
          />
        </View>

        {/* Pricing Cards */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          {packages.map((pkg, index) => (
            <TouchableOpacity
              key={pkg.identifier}
              style={[
                styles.pricingCard,
                selectedPackage === index && styles.pricingCardSelected,
              ]}
              onPress={() => setSelectedPackage(index)}
            >
              {pkg.bestValue && (
                <View style={styles.bestValueBadge}>
                  <Text style={styles.bestValueText}>BEST VALUE</Text>
                </View>
              )}
              {pkg.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>MOST POPULAR</Text>
                </View>
              )}
              <View style={styles.pricingCardContent}>
                <View style={styles.pricingLeft}>
                  <View
                    style={[
                      styles.radio,
                      selectedPackage === index && styles.radioSelected,
                    ]}
                  >
                    {selectedPackage === index && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <View>
                    <Text style={styles.pricingTitle}>{pkg.title}</Text>
                    {pkg.savings && (
                      <Text style={styles.savingsText}>{pkg.savings}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.pricingRight}>
                  <Text style={styles.price}>{pkg.price}</Text>
                  <Text style={styles.period}>{pkg.period}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Subscribe Button */}
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={handlePurchase}
          disabled={purchasing}
        >
          {purchasing ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <>
              <Text style={styles.subscribeButtonText}>Start Premium</Text>
              <Ionicons name="arrow-forward" size={20} color="#000000" />
            </>
          )}
        </TouchableOpacity>

        {/* Restore Button */}
        <TouchableOpacity onPress={handleRestore} disabled={purchasing}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>

        {/* Legal */}
        <View style={styles.legal}>
          <Text style={styles.legalText}>
            Subscription automatically renews unless cancelled at least 24 hours
            before the end of the current period. Manage in Account Settings.
          </Text>
          <View style={styles.legalLinks}>
            <Text style={styles.legalLink}>Terms of Service</Text>
            <Text style={styles.legalSeparator}>•</Text>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const FeatureItem = ({
  icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIcon}>
      <Ionicons name={icon} size={24} color="#ffffff" />
    </View>
    <View style={styles.featureText}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  loading: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  hero: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#9ca3af",
  },
  features: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: "row",
    marginBottom: 20,
  },
  featureIcon: {
    width: 48,
    height: 48,
    backgroundColor: "#1a1a1a",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureText: {
    flex: 1,
    justifyContent: "center",
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: "#9ca3af",
    lineHeight: 20,
  },
  pricingSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
  },
  pricingCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#2a2a2a",
    position: "relative",
  },
  pricingCardSelected: {
    borderColor: "#ffffff",
    backgroundColor: "#1a1a1a",
  },
  bestValueBadge: {
    position: "absolute",
    top: -12,
    right: 20,
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestValueText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000000",
    letterSpacing: 1,
  },
  popularBadge: {
    position: "absolute",
    top: -12,
    right: 20,
    backgroundColor: "#3b82f6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 1,
  },
  pricingCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pricingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#4b5563",
    marginRight: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    borderColor: "#ffffff",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ffffff",
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 2,
  },
  savingsText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "500",
  },
  pricingRight: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  period: {
    fontSize: 12,
    color: "#9ca3af",
  },
  subscribeButton: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginRight: 8,
  },
  restoreText: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 32,
  },
  legal: {
    marginBottom: 40,
  },
  legalText: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 12,
  },
  legalLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  legalLink: {
    fontSize: 12,
    color: "#9ca3af",
  },
  legalSeparator: {
    fontSize: 12,
    color: "#4b5563",
    marginHorizontal: 8,
  },
});
