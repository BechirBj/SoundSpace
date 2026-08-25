import { NativeTabs } from "expo-router/unstable-native-tabs";

const tabs = [
  {
    name: "home",
    label: "Home",
    sf: {
      default: "house",
      selected: "house.fill",
    },
    md: "home",
  },
  {
    name: "music",
    label: "Music",
    sf: {
      default: "music.note",
      selected: "music.note",
    },
    md: "music_note",
  },
  {
    name: "playlist",
    label: "Playlist",
    sf: {
      default: "music.note.list",
      selected: "music.note.list",
    },
    md: "queue_music",
  },
  {
    name: "settings",
    label: "Settings",
    sf: {
      default: "gearshape",
      selected: "gearshape.fill",
    },
    md: "settings",
  },
] as const;

export default function TabsLayout() {
  return (
    <NativeTabs tintColor="#8B5CF6" backgroundColor="#20254B">
      {tabs.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <NativeTabs.Trigger.Icon sf={tab.sf} md={tab.md} />
          <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
