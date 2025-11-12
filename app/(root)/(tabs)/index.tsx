import { Text, View } from "react-native";
import {Link} from "expo-router";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
        <Text className="font-bold my-10 font-rubik text-3xl">Welcome to Restate</Text>
        <Link href="/sign-in"> Sign in</Link>
        <Link href="/explore"> explore</Link>
        <Link href="/profile"> profile</Link>
        <Link href="/propreties/1">proprety</Link>

    </View>
  );
}
