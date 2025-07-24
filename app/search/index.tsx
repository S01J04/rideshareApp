import { useRouter } from "expo-router";
import { View, Text, Button } from "react-native";

export default function SearchScreen() {
  const router = useRouter();

  return (
    <View>
      <Text>Search for a ride</Text>
      {/* <Button title="Show Results" onPress={() => router.push("/search/index")} /> */}
    </View>
  );
}
