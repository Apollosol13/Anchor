import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";
import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui";
import { router } from "expo-router";

export default function TabLayout() {
  if (Platform.OS === "web") {
    return (
      <Tabs>
        <TabSlot />
        <TabList>
          <TabTrigger name="index" href="/">
            Home
          </TabTrigger>
          <TabTrigger name="bible" href="/bible">
            Bible
          </TabTrigger>
          <TabTrigger name="bookmarks" href="/bookmarks">
            Bookmarks
          </TabTrigger>
          <TabTrigger name="profile" href="/profile">
            Profile
          </TabTrigger>
        </TabList>
      </Tabs>
    );
  }

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          sf={{ default: "house", selected: "house.fill" }}
          md="home"
        />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="bible">
        <NativeTabs.Trigger.Icon
          sf={{ default: "book", selected: "book.fill" }}
          md="menu_book"
        />
        <NativeTabs.Trigger.Label>Bible</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="bookmarks">
        <NativeTabs.Trigger.Icon
          sf={{ default: "bookmark", selected: "bookmark.fill" }}
          md="bookmark"
        />
        <NativeTabs.Trigger.Label>Bookmarks</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon
          sf={{ default: "person", selected: "person.fill" }}
          md="person"
        />
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
