import { Image, Text, View, Dimensions, Alert, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import Backbtn from '@/components/Backbtn'
import Button from '@/components/button'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import * as ImageManipulator from 'expo-image-manipulator'
import { router } from 'expo-router'
import { useDispatch, useSelector } from 'react-redux'
import { updateProfilePicture } from '@/redux/slices/userSlice'
import Toast from 'react-native-toast-message'
import { store } from '@/redux/store'
import axiosInstance from '@/redux/axiosInstance'

const Addprofileimg = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: any) => state.user?.user);

    const [image, setImage] = useState<string | null>(user?.profilePicture || null);
    const [imageFile, setImageFile] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showSaveButton, setShowSaveButton] = useState(false);

    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;
    const imageSize = Math.min(screenWidth * 0.8, screenHeight * 0.4); // Responsive image size

    // Reset to top on component mount
    useEffect(() => {
        // In React Native, we don't need to scroll to top as it's handled differently
    }, []);

    const takePhoto = async () => {
        // Request camera permissions
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert("Permission Required", "You need to enable camera permissions to take a photo");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setImageFile(result.assets[0]);
            setShowSaveButton(true);
        }
    };

    const pickImage = async () => {
        // Request media library permissions
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert("Permission Required", "You need to enable gallery permissions to upload a photo");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, // Just use Images to avoid deprecation issues
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setImageFile(result.assets[0]);
            setShowSaveButton(true);
        }
    };

    // Function to compress the image before uploading
    const compressImage = async (imageUri: string) => {
        try {
            // Get file info to check size
            const fileInfo = await FileSystem.getInfoAsync(imageUri, { size: true });
            const fileSize = (fileInfo as any).size || 0;
            console.log("Original image size:", fileSize, "bytes");

            // If image is larger than 1MB, compress it
            if (fileSize > 1024 * 1024) {
                console.log("Image is large, compressing...");

                // Calculate compression quality based on file size
                // Larger files get more compression
                let quality = 0.8;
                if (fileSize > 5 * 1024 * 1024) quality = 0.5; // > 5MB
                else if (fileSize > 3 * 1024 * 1024) quality = 0.6; // > 3MB
                else if (fileSize > 2 * 1024 * 1024) quality = 0.7; // > 2MB

                // Compress and resize the image
                const manipResult = await ImageManipulator.manipulateAsync(
                    imageUri,
                    [{ resize: { width: 800, height: 800 } }], // Resize to reasonable dimensions
                    { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
                ) as ImageManipulator.ImageResult;

                // Get info about the compressed image
                const compressedInfo = await FileSystem.getInfoAsync(manipResult.uri, { size: true });
                const compressedSize = (compressedInfo as any).size || 0;
                console.log("Compressed image size:", compressedSize, "bytes");

                if (fileSize > 0 && compressedSize > 0) {
                    console.log("Compression ratio:", (compressedSize / fileSize).toFixed(2));
                }

                return {
                    uri: manipResult.uri,
                    type: 'image/jpeg',
                    name: 'profile-photo.jpg'
                };
            }

            // If image is already small enough, return original
            return {
                uri: imageUri,
                type: 'image/jpeg',
                name: 'profile-photo.jpg'
            };
        } catch (error) {
            console.error("Error compressing image:", error);
            // Return original image if compression fails
            return {
                uri: imageUri,
                type: 'image/jpeg',
                name: 'profile-photo.jpg'
            };
        }
    };

    const handleSave = async () => {
        if (!imageFile) {
            Alert.alert("No Image Selected", "Please select or take a photo first");
            return;
        }

        try {
            setIsUploading(true);

            // Log the image file details for debugging
            console.log("Image file details:", {
                uri: imageFile.uri,
                type: imageFile.type || 'image/jpeg',
                size: imageFile.fileSize,
                name: imageFile.fileName || 'profile-photo.jpg'
            });

            // Compress the image before uploading
            const compressedImage = await compressImage(imageFile.uri);
            console.log("Compressed image:", compressedImage);

            // Create form data with the correct key name (profilePicture instead of photo)
            const formData = new FormData();

            // Log the compressed image details
            console.log("Creating form data with image:", compressedImage);

            // Try a different approach for the form data
            // Some backends expect a specific format for the file object
            const fileToUpload = {
                uri: compressedImage.uri,
                type: 'image/jpeg',
                name: 'profile-photo.jpg',
            };

            console.log("File to upload:", fileToUpload);

            // Append the file to form data
            formData.append('profilePicture', fileToUpload as any);

            // Add authorization token to ensure the request is authenticated
            const state = store.getState();
            const token = state?.user?.accessToken;

            // Log the form data for debugging
            console.log("Form data created:", formData);

            let response;

            try {
                // Create a timeout promise
                const uploadTimeout = new Promise<never>((_, reject) => {
                    setTimeout(() => reject(new Error("Upload timed out after 60 seconds")), 60000);
                });

                // Log the token for debugging
                console.log("Using token:", token ? "Bearer token available" : "No token available");

                // Make the API call directly with fetch instead of axios
                const url = !user?.profilePicture
                    ? `${axiosInstance.defaults.baseURL}/users/profile-upload-picture`
                    : `${axiosInstance.defaults.baseURL}/users/profile-update-picture`;

                const method = !user?.profilePicture ? 'POST' : 'PUT';

                console.log(`Making ${method} request to ${url}`);

                // Create fetch request
                const fetchPromise = fetch(url, {
                    method: method,
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        // Don't set Content-Type header, let fetch set it with the boundary
                    },
                    body: formData
                }).then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! Status: ${res.status}`);
                    }
                    return res.json();
                });

                // Race against timeout
                if (!user?.profilePicture) {
                    console.log("Setting new profile image...");
                    response = await Promise.race([fetchPromise, uploadTimeout]);
                } else {
                    console.log("Updating existing profile image...");
                    response = await Promise.race([fetchPromise, uploadTimeout]);
                }

                console.log("Upload response:", response);

                // Handle different response formats
                const responseObj = response as any; // Cast to any to handle different response formats
                const profilePicture =
                    responseObj?.user?.profilePicture || // Format 1
                    responseObj?.data?.user?.profilePicture || // Format 2
                    (typeof responseObj === 'object' && responseObj.profilePicture); // Format 3

                if (profilePicture) {
                    // Update Redux state with new profile picture
                    dispatch(updateProfilePicture(profilePicture) as any);

                    // Update local state
                    setImage(profilePicture);

                    Toast.show({
                        type: 'success',
                        text1: 'Success',
                        text2: 'Profile picture updated successfully',
                        position: 'bottom',
                    });

                    // Navigate back
                    router.back();
                } else {
                    console.error("Invalid response format:", response);
                    throw new Error("Failed to update profile picture: Invalid response format");
                }
            } catch (apiError: any) {
                console.error("API error:", apiError);

                // Check for timeout error
                if (apiError.message && apiError.message.includes("timed out")) {
                    throw new Error("Upload timed out. Please try again with a smaller image or better connection.");
                }

                // Check for network error
                if (apiError.message && apiError.message.includes("Network Error")) {
                    throw new Error("Network error. Please check your internet connection and try again.");
                }

                throw apiError;
            }
        } catch (error: any) {
            console.error('Error uploading image:', error);

            // Provide more detailed error message
            let errorMessage = "Failed to upload image. Please try again.";

            if (error.message) {
                errorMessage = error.message;
            }

            if (error.response) {
                console.error("Error response:", error.response);
                errorMessage += ` Status: ${error.response.status}`;
            }

            Alert.alert(
                "Upload Failed",
                errorMessage
            );
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <View className='flex-1 bg-white'>
            <View className='absolute top-0 left-0 z-10 p-2'>
                <Backbtn />
            </View>

            <View className='flex-1 justify-between'>
                {/* Top Section with Image */}
                <View className='flex-1 items-center justify-center pt-10'>
                    <View
                        style={{
                            height: imageSize,
                            width: imageSize,
                        }}
                        className="rounded-full border-2 border-primary overflow-hidden mb-8"
                    >
                        <Image
                            className="h-full w-full rounded-full"
                            source={user?.profilePicture ? { uri: user?.profilePicture } : { uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjDGMp734S91sDuUFqL51_xRTXS15iiRoHew&s' }}

                        />
                    </View>
                    <Text className='text-2xl px-8 text-center text-secondary font-semibold'>
                        Don't wear sunglasses, look straight ahead and make sure you are alone
                    </Text>
                </View>

                {/* Bottom Section with Buttons */}
                <View className='w-full px-5 pb-8'>
                    {!showSaveButton ? (
                        <>
                            <Button
                                CN={{ bgcolor: "bg-primary", color: "text-white" }}
                                text="Take a picture"
                                onPress={takePhoto}
                            />
                            <Button
                                CN={{ bgcolor: "bg-white", color: "text-primary" }}
                                text="Upload a picture"
                                onPress={pickImage}
                            />
                        </>
                    ) : (
                        <>
                            <Button
                                CN={{
                                    bgcolor: isUploading ? "bg-gray-400" : "bg-green-500",
                                    color: "text-white"
                                }}
                                text={isUploading ? "Saving..." : "Save Picture"}
                                onPress={isUploading ? () => {} : handleSave}
                            />
                            <Button
                                CN={{ bgcolor: "bg-gray-400", color: "text-white" }}
                                text="Cancel"
                                onPress={() => {
                                    if (!isUploading) {
                                        setImage(user?.profilePicture || null);
                                        setImageFile(null);
                                        setShowSaveButton(false);
                                    }
                                }}
                            />
                        </>
                    )}
                </View>
            </View>
        </View>
    )
}

export default Addprofileimg
