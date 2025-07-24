import React from 'react';
import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Button from '../button';

const vehicleTypes = ["sedan", "car", "SUV", "truck", "minivan", "bus", "van"];

const VehicleType = ({ vehicleType, setVehicleType, nextStep }) => {
    const [selectedVehicleType, setSelectedVehicleType] = React.useState("");
    return (
        <View className="flex-1 flex flex-col justify-start">
            <Text className="text-3xl w-full text-center font-semibold">
                Select Vehicle Type
            </Text>
            <View className="relative flex flex-col  mt-8">
                <View className="flex-1 w-full bg-gray-100 rounded-l-xl">
                    <Picker
                        selectedValue={selectedVehicleType}
                        onValueChange={(itemValue) => setSelectedVehicleType(itemValue)}
                        style={{ flex: 1, height: 50, width: "100%" }}
                    >
                        <Picker.Item label="Select a vehicle type" value="" />
                        {vehicleTypes.map((type) => (
                            <Picker.Item
                                key={type}
                                label={type.charAt(0).toUpperCase() + type.slice(1)}
                                value={type}
                            />
                        ))}
                    </Picker>
                </View>
                {selectedVehicleType.length > 0 && (
                    <Button
                        onPress={()=>{
                            setVehicleType(selectedVehicleType);
                            nextStep();
                        }}
                        CN={{ bgcolor: "bg-primary", color: "text-white" }}
                        text="Submit"
                    />
                )}
            </View>
        </View>
    );
};
export default VehicleType