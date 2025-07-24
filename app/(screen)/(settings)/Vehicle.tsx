import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from "react-native";
import VehicleType from "components/Vechile/VehicleType";
import VehiclePlateNumber from "components/Vechile/VehiclePlateNumber";
import VehicleColor from "components/Vechile/VehicleColor";
import VehicleModel from "components/Vechile/VehicleModel";
import { Vehicleyear } from "components/Vechile/Vehicleyear";
import ConfirmVehicle from "components/Vechile/ConfirmVehcile";
import { useSelector } from "react-redux";
import Backbtn from "components/Backbtn";

const steps = [
    "Select Vehicle Type",
    "Enter Vehicle Plate Number",
    "Enter Vehicle Color",
    "Model",
    "Year",
    "Confirm Vehicle",
];

const CreateVehicle = () => {
    // We'll use Redux state in the future if needed
    useSelector((state: any) => state.vehicle);

    const [step, setStep] = useState(0);
    const [vehicleType, setVehicleType] = useState("");
    const [vehicleModel, setVehicleModel] = useState("");
    const [vehicleYear, setVehicleYear] = useState("");
    const [vehicleColor, setVehicleColor] = useState("");
    const [vehiclePlateNumber, setvehiclePlateNumber] = useState("");

    const nextStep = () => setStep((prev) => Math.min(steps.length - 1, prev + 1));
    const prevStep = () => setStep((prev) => Math.max(0, prev - 1));



    // Function to go back to previous screen
    const handleGoBack = () => {
        prevStep();
    };

    // Render the current step
    const renderStep = () => {
        switch (step) {
            case 0:
                return <VehicleType vehicleType={vehicleType} setVehicleType={setVehicleType} nextStep={nextStep} />;
            case 1:
                return <VehiclePlateNumber vehiclePlateNumber={vehiclePlateNumber} setvehiclePlateNumber={setvehiclePlateNumber} nextStep={nextStep} />;
            case 2:
                return <VehicleColor vehicleColor={vehicleColor} setVehicleColor={setVehicleColor} nextStep={nextStep} />;
            case 3:
                return <VehicleModel vehicleModel={vehicleModel} setVehicleModel={setVehicleModel} nextStep={nextStep} />;
            case 4:
                return <Vehicleyear vehicleYear={vehicleYear} setVehicleYear={setVehicleYear} nextStep={nextStep} />;
            case 5:
                return (
                    <ConfirmVehicle
                        vehicleType={vehicleType}
                        vehiclePlateNumber={vehiclePlateNumber}
                        vehicleModel={vehicleModel}
                        vehicleYear={vehicleYear}
                        vehicleColor={vehicleColor}
                        goBack={handleGoBack}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Backbtn />
            <View style={styles.stepperContainer}>
                <View style={styles.stepper}>
                    {steps.map((label, index) => (
                        <View key={label} style={styles.stepItem}>
                            <View
                                style={[
                                    styles.stepCircle,
                                    step === index ? styles.activeStep :
                                        step > index ? styles.completedStep : styles.inactiveStep
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.stepNumber,
                                        step === index ? styles.activeStepText :
                                            step > index ? styles.completedStepText : styles.inactiveStepText
                                    ]}
                                >
                                    {index + 1}
                                </Text>
                            </View>
                            <Text
                                style={[
                                    styles.stepLabel,
                                    step === index ? styles.activeStepLabel :
                                        step > index ? styles.completedStepLabel : styles.inactiveStepLabel
                                ]}
                            >
                                {label}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            <ScrollView style={styles.content}>
                {renderStep()}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    stepperContainer: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 10,
    },
    stepper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    stepItem: {
        alignItems: 'center',
        width: 50,
    },
    stepCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    activeStep: {
        backgroundColor: '#2DBEFF',
    },
    completedStep: {
        backgroundColor: '#4ade80',
    },
    inactiveStep: {
        backgroundColor: '#e5e7eb',
    },
    stepNumber: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    activeStepText: {
        color: 'white',
    },
    completedStepText: {
        color: 'white',
    },
    inactiveStepText: {
        color: '#6f8b90',
    },
    stepLabel: {
        fontSize: 10,
        textAlign: 'center',
    },
    activeStepLabel: {
        color: '#2DBEFF',
        fontWeight: 'bold',
    },
    completedStepLabel: {
        color: '#4ade80',
        fontWeight: 'bold',
    },
    inactiveStepLabel: {
        color: '#6f8b90',
    },
    content: {
        flex: 1,
        padding: 16,
    },
});

export default CreateVehicle;
