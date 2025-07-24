import React, { useState, useEffect } from "react";
import { useProfile } from "@/redux/hooks/userHooks";
import { updateProfile } from "@/redux/slices/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View, Text } from "react-native";
import Backbtn from "@/components/Backbtn";
import { SafeAreaView } from "react-native-safe-area-context";

// Preferences Data
const preferencesData = [
  {
    category: "Chattiness",
    icon: <FontAwesome name="comments" size={20} color="#2DBEFF" />,
    options: [
      { text: "I enjoy chatting a lot", icon: <FontAwesome name="comments" size={20} color="#2DBEFF" /> },
      { text: "I talk sometimes", icon: <FontAwesome name="comments" size={20} color="#2DBEFF" /> },
      { text: "I prefer a quiet ride", icon: <FontAwesome name="comments" size={20} color="#2DBEFF" /> },
    ],
  },
  {
    category: "Music",
    icon: <FontAwesome name="music" size={20} color="#2DBEFF" />,
    options: [
      { text: "I love listening to pop music", icon: <FontAwesome name="music" size={20} color="#2DBEFF" /> },
      { text: "Rock music is my favorite", icon: <FontAwesome name="music" size={20} color="#2DBEFF" /> },
      { text: "I prefer classical tunes", icon: <FontAwesome name="music" size={20} color="#2DBEFF" /> },
    ],
  },
  {
    category: "Smoking",
    icon: <FontAwesome name="ban" size={20} color="#2DBEFF" />,
    options: [
      { text: "I do not smoke at all", icon: <FontAwesome name="ban" size={20} color="#2DBEFF" /> },
      { text: "I smoke occasionally", icon: <FontAwesome name="ban" size={20} color="#2DBEFF" /> },
      { text: "I smoke frequently", icon: <FontAwesome name="ban" size={20} color="#2DBEFF" /> },
    ],
  },
  {
    category: "Pets",
    icon: <FontAwesome name="paw" size={20} color="#2DBEFF" />,
    options: [
      { text: "I have no pets", icon: <FontAwesome name="paw" size={20} color="#2DBEFF" /> },
      { text: "I have pets", icon: <FontAwesome name="paw" size={20} color="#2DBEFF" /> },
      { text: "I have a pet", icon: <FontAwesome name="paw" size={20} color="#2DBEFF" /> },
    ],
  },
];

const TravelPreference = () => {
  // State for preferences
  const { user } = useSelector((state: any) => state?.user);
  const userpreferences = user?.preferences;
  const [preferences, setPreferences] = useState<any[]>([]);
  const { updateProfilePreferences } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  // Modal state
  const [selectedPreference, setSelectedPreference] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState("");

  // Load user preferences and merge with default preferences
  useEffect(() => {
    // Merge existing user preferences from Redux with default ones
    const mergedPreferences = preferencesData.map((pref) => {
      const userPref = userpreferences?.find((up: any) => up.category === pref.category);
      return {
        ...pref,
        selectedOption: userPref ? userPref.selectedOption : "No preference selected",
      };
    });

    setPreferences(mergedPreferences);
  }, [userpreferences]);


  // Handle preference click
  const handlePreferenceClick = (preference: any) => {
    setSelectedPreference(preference);
    setSelectedOption(preference.selectedOption === "No preference selected" ? "" : preference.selectedOption);
  };

  // Save preference changes and update DB
  const handleSave = async () => {
    if (!selectedPreference) return;

    try {
      setIsLoading(true);

      // Merge new preference selection with existing ones
      const updatedPreferences = preferences.map((pref) =>
        pref.category === selectedPreference.category
          ? { ...pref, selectedOption: selectedOption || pref.selectedOption }
          : pref
      );

      setPreferences(updatedPreferences);

      // Prepare data for Redux and DB
      const formattedPreferences = updatedPreferences.map((pref) => ({
        category: pref.category,
        selectedOption: pref.selectedOption,
      }));

      // Send update to the backend
      const response = await updateProfilePreferences(formattedPreferences);

      if (response) {
        console.log(formattedPreferences);
        dispatch(updateProfile({ field: "preferences", value: formattedPreferences }) as any);
        setSelectedPreference(null);
      }
    } catch (error) {
      console.error("Error updating preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <SafeAreaView className="bg-white h-full">
      {/* Close Button */}
      <Backbtn/>


      {/* Title */}
      <Text className="text-center w-full  text-secondary text-3xl font-semibold my-5">
        Travel Preferences
      </Text>

      {/* Preferences List */}
      {preferences.map((pref, index) => (
        <TouchableOpacity
          key={index}
          className="p-4 flex flex-row justify-between mx-5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-2xl cursor-pointer"
          onPress={() => handlePreferenceClick(pref)}
        >
          <View className="flex flex-row items-center gap-3">
            {pref.icon}
            <View>
              <Text className="block text-lg text-subtext">{pref.category}</Text>
              <Text className="block text-md text-primary font-semibold">
                {pref.selectedOption || "No preference selected"}
              </Text>
            </View>
          </View>
          <FontAwesome name="angle-right" size={24} color="#6f8b90" />
        </TouchableOpacity>
      ))}

      {/* Modal for Selecting an Option */}
      {selectedPreference && (
        <View className="absolute inset-0 flex bg-white justify-center items-start">
          <View  className="bg-background p-5 w-[100%] h-full">
            {/* Close Button */}
            <TouchableOpacity onPress={() => setSelectedPreference(null)}>
              <Ionicons name="close-outline" size={30} color="#6f8b90" />
            </TouchableOpacity>

            {/* Modal Title */}
            <Text className="text-4xl font-semibold text-center  my-5">
              Select {selectedPreference.category}
            </Text>

            {/* Options */}
            <View className="flex flex-col space-y-2">
              {selectedPreference.options.map((option: any, idx: number) => (
                <TouchableOpacity
                  key={idx}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: selectedOption === option.text ? '#e5e7eb' : 'transparent'
                  }}
                  onPress={() => setSelectedOption(option.text)}
                >
                  <View style={{ marginRight: 12 }}>{option.icon}</View>
                  <Text style={{ fontSize: 16, fontWeight: '600', flex: 1 }}>{option.text}</Text>
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: '#2DBEFF',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    {selectedOption === option.text && (
                      <View style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: '#2DBEFF'
                      }} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Save Button */}
            <View className="mt-5 flex justify-center">
              <TouchableOpacity
                style={{
                  backgroundColor: '#2DBEFF',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 8,
                  alignItems: 'center'
                }}
                onPress={handleSave}
              >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                  {isLoading ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default TravelPreference;
