import { Image } from "expo-image";
import { ArrowDownUp, Search } from "lucide-react-native";
import { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const categories = [
  { id: "1", title: "Songs" },
  { id: "2", title: "Playlists" },
  { id: "3", title: "Albums" },
  { id: "4", title: "Artists" },
  { id: "5", title: "Artists" },
  { id: "6", title: "Artists" },
];

const songs = [
  {
    id: "1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    thumbnail:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.bdVnDpuwZSiROirVujLpYgHaEl%3Fpid%3DApi&f=1&ipt=3d9dd31a08db7e6f68a7444d18dc352f0efc249082f1a32ce93c7755e939ccc1&ipo=images",
    duration: "3:20",
  },
  {
    id: "2",
    title: "As It Was",
    artist: "Harry Styles",
    album: "Harry's House",
    thumbnail:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%2Fid%2FOIP.WXHpU6GZE4TN3KOVLrimpAHaEK%3Fr%3D0%26pid%3DApi&f=1&ipt=c54092065531254c17aff367f6f1c7cc8fa5c0448a5fb4375b601520d12872fd&ipo=images",
    duration: "2:47",
  },
  {
    id: "3",
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    thumbnail:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%2Fid%2FOIP.YYXDXDP6WOApdnhayl_ikgHaHa%3Fr%3D0%26pid%3DApi&f=1&ipt=ca14a65765318c0468d9f25838ba4b42876b46bc5bd82525046f8fdf0758be09&ipo=images",
    duration: "3:23",
  },
  {
    id: "4",
    title: "Starboy",
    artist: "The Weeknd",
    album: "Starboy",
    thumbnail:
      "https://i.scdn.co/image/ab67616d0000b273e0e6e3b5e6e4b6c0f4b8e5f",
    duration: "3:50",
  },
];

export default function Music() {
  const [selectedCategory, setSelectedCategory] = useState("1");

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Music</Text>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#A0A5B5" />

        <TextInput
          style={styles.input}
          placeholder="Search music..."
          placeholderTextColor="#A0A5B5"
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Categories */}
      <View style={styles.categoryContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.id;

            return (
              <Pressable
                onPress={() => setSelectedCategory(item.id)}
                style={[styles.category, isSelected && styles.categoryActive]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.categoryTextActive,
                  ]}
                >
                  {item.title}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Tracks header */}
      <View style={styles.trackHeader}>
        <Pressable style={styles.sortButton} hitSlop={8}>
          <ArrowDownUp size={18} color="#FFFFFF" />
          <Text style={styles.sortText}>Date Added</Text>
        </Pressable>

        <Text style={styles.trackCount}>{songs.length} Tracks</Text>
      </View>

      {/* Songs */}
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.songList}
        renderItem={({ item }) => (
          <Pressable style={styles.song}>
            <Image
              source={item.thumbnail}
              transition={100}
              contentFit="cover"
              style={styles.songThumbnail}
            />

            <View style={styles.songInfo}>
              <Text style={styles.songTitle} numberOfLines={1}>
                {item.title}
              </Text>

              <Text style={styles.songArtist} numberOfLines={1}>
                {item.artist} · {item.album}
              </Text>
            </View>

            <Text style={styles.duration}>{item.duration}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#171E3C",
    paddingHorizontal: 20,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },

  searchContainer: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#252D4D",
    borderRadius: 25,
    paddingHorizontal: 16,
  },

  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    marginLeft: 10,
    paddingVertical: 0,
  },

  categoryContainer: {
    paddingTop: 10,
    height: 62,
    justifyContent: "center",
  },

  categoryList: {
    gap: 10,
  },

  category: {
    height: 42,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#252D4D",
    borderRadius: 21,
  },

  categoryActive: {
    backgroundColor: "#FFFFFF",
  },

  categoryText: {
    color: "#A0A5B5",
    fontSize: 14,
    fontWeight: "600",
  },

  categoryTextActive: {
    color: "#171E3C",
  },

  trackHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },

  sortText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },

  trackCount: {
    color: "#A0A5B5",
    fontSize: 14,
  },

  songList: {
    paddingBottom: 20,
  },

  song: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  songThumbnail: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: "#252D4D",
  },

  songInfo: {
    flex: 1,
    marginHorizontal: 12,
  },

  songTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  songArtist: {
    color: "#A0A5B5",
    fontSize: 13,
    marginTop: 4,
  },

  duration: {
    color: "#A0A5B5",
    fontSize: 13,
  },
});
