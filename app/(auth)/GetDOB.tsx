import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons';
import Headerbackbtn from 'components/Headerbackbtn';

interface GetDOBProps {
    dob: string;
    setDob: (dob: string) => void;
    setcurrentstep: (step: number) => void;
    currentstep: number;
}

const GetDOB = ({dob, setDob, setcurrentstep, currentstep }: GetDOBProps) => {
    const handleDOBChange = (text: string) => {
        // Remove non-numeric characters and restrict to 6 characters for DDMMYY
        const formattedText = text.replace(/[^0-9]/g, "").slice(0, 6);

        // Format the input as DD/MM/YY
        let formattedDate = formattedText;
        if (formattedText.length >= 3) {
            formattedDate = `${formattedText.slice(0, 2)}/${formattedText.slice(2, 4)}`;
        }
        if (formattedText.length >= 5) {
            formattedDate = `${formattedText.slice(0, 2)}/${formattedText.slice(2, 4)}/${formattedText.slice(4, 6)}`;
        }

        setDob(formattedDate);
    };

    const validateDOB = (dob: string) => {
        if (dob.length !== 8) return false; // DD/MM/YY format
        
        const day = parseInt(dob.slice(0, 2));
        const month = parseInt(dob.slice(3, 5));
        const year = parseInt('20' + dob.slice(6, 8));
        
        if (day < 1 || day > 31) return false;
        if (month < 1 || month > 12) return false;
        if (year < 1900 || year > new Date().getFullYear()) return false;
        
        return true;
    };

    return (
        <View className="flex flex-col h-full justify-between">
          <View>
            <Headerbackbtn onPress={() => setcurrentstep(currentstep - 1)} />
            <Text className="text-secondary font-semibold mt-8 text-4xl">What's your date of birth?</Text>

            <View className="flex-row items-center bg-gray-200 rounded-xl p-2">
                <TextInput
                    value={dob}
                    onChangeText={handleDOBChange}
                    className="flex-1 text-lg text-gray-800 p-2"
                    placeholder="DD/MM/YY"
                    keyboardType="numeric"
                    maxLength={8} // Limit to 8 characters (DD/MM/YY)
                />

                {/* Clear Button */}
                {dob.length > 0 && (
                    <TouchableOpacity onPress={() => setDob("")} className="ml-2">
                        <Ionicons name="close-outline" size={24} color="#6f8b90" />
                    </TouchableOpacity>
                )}
            </View>
          </View>
          <View className="flex justify-end items-end">
              {dob.length === 8 && validateDOB(dob) && (
                  <TouchableOpacity
                      onPress={() => setcurrentstep(currentstep + 1)}
                      className="bg-primary rounded-full p-2.5 shadow-lg"
                  >
                      <Text className="text-white text-xl font-bold">
                          <Ionicons name="chevron-forward-outline" size={23} />
                      </Text>
                  </TouchableOpacity>
              )}
          </View>
        </View>
    );
}

export default GetDOB;