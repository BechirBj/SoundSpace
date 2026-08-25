import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { CheckCircle2, Folder } from "lucide-react-native";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const imageHeight = Math.min(width * 0.95, 400);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          source={require("@/assets/landingIcon.jpg")}
          contentFit="cover"
          style={[styles.heroImage, { height: imageHeight }]}
          transition={200}
        />

        <View style={styles.content}>
          <View style={styles.badge}>
            <CheckCircle2 size={18} color="#D0BCFF" strokeWidth={2.5} />

            <Text style={styles.badgeText}>LOCAL PLAYBACK ONLY</Text>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>
              Your Music,
              {"\n"}Your Way.
            </Text>

            <Text style={styles.subtitle}>
              This app plays music stored strictly on your device. 100% offline.
              No accounts. No streaming. Just your collection, beautifully
              presented.
            </Text>
          </View>

          <View style={styles.actionContainer}>
            <Pressable
              onPress={() => router.replace("/(tabs)/home")}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              android_ripple={{ color: "#B99FEF" }}
              accessibilityRole="button"
              accessibilityLabel="Grant permission to access local music"
            >
              <Folder size={22} color="#3C0091" strokeWidth={2.5} />

              <Text style={styles.buttonText}>Grant Permission</Text>
            </Pressable>

            <Text style={styles.finalText}>
              We need access to your local storage to find your audio files.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#171E3C",
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  heroImage: {
    width: "100%",
    borderRadius: 24,
  },

  content: {
    flex: 1,
    paddingTop: 20,
  },

  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#122131",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1A2635",
  },

  badgeText: {
    color: "#D0BCFF",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  textContainer: {
    marginTop: 28,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 38,
    lineHeight: 44,
    fontWeight: "800",
    letterSpacing: -0.8,
  },

  subtitle: {
    marginTop: 16,
    color: "#B9C0D4",
    fontSize: 16,
    lineHeight: 24,
  },

  actionContainer: {
    marginTop: "auto",
    paddingTop: 28,
    paddingBottom: 12,
  },

  button: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
    borderRadius: 18,
    backgroundColor: "#D0BCFF",
  },

  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  buttonText: {
    color: "#3C0091",
    fontSize: 18,
    fontWeight: "700",
  },

  finalText: {
    marginTop: 12,
    paddingHorizontal: 12,
    textAlign: "center",
    color: "#7F8BA3",
    fontSize: 13,
    lineHeight: 19,
  },
});
