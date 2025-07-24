import { useDispatch } from "react-redux";
import { logoutUser, setAccessToken, setUser } from "../slices/userSlice";
import axiosInstance from "../axiosInstance";
import { useVehicle } from "./vehicleHook";
import { setVehicles } from "../slices/vechileSlice";
import { store } from "../store";

// Login hook
export const useLogin = () => {
    const dispatch = useDispatch();
    const {fetchVehicles} = useVehicle();
    // We'll handle navigation in the component, not in the hook

    // Simple API function without loading/error handling
    const loginUser = async ({ email, password }: { email: string; password: string }) => {
      console.log("Sending payload:", { email, password });
      const response = await axiosInstance.post(
        "/users/login",
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true, // Ensures cookies are sent
        }
      );

      console.log("Response data:", response.data);
      dispatch(setUser(response.data.user)); // Store user in Redux
      dispatch(setAccessToken(response.data.accessToken));

      if (response.data ) {
        console.log("fetching vehicles");
        fetchVehicles(); // Fetch vehicles once after login
      }

      // Navigation will be handled by the component
      return response;
    };

    return { loginUser };
  };

// Signup hook
export const useSignup = () => {
  const dispatch = useDispatch();

  // Simple API function without loading/error handling
  const signupUser = async (formData) => {
    const response = await axiosInstance.post("/users/register", formData);
    dispatch(setUser(response.data)); // Dispatch user data to Redux store
    return response;
  };

  return { signupUser };
};
//User profile information

export const useProfile = () => {
  // ✅ Set/update profile image
  const setProfileImg = async (profilePicture) => {
    console.log("Uploading profile image...");
    const formData = new FormData();
    formData.append("profilePicture", profilePicture);

    return axiosInstance.post("/users/profile-upload-picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  const updateProfileImg = async (profilePicture) => {
    console.log("Updating profile image...");
    const formData = new FormData();
    formData.append("profilePicture", profilePicture);

    return axiosInstance.put("/users/profile-update-picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  // ✅ Generic functions for setting/updating profile fields
  const updateProfile = async (field, value) => {
    return axiosInstance.patch("/users/profile/update", { field, value });
  };

  const setProfile = async (field, value) => {
    return axiosInstance.post("/users/profile/set", { field, value });
  };

  // ✅ Specific profile updates
  const setProfileBio = (bio) => setProfile("bio", bio);
  const updateProfileBio = (bio) => updateProfile("bio", bio);

  // ✅ Handle first & last name in a single field (`name`)
  const updateProfileFirstName = (firstname) => updateProfile("firstname", firstname);
  const updateProfileLastName = (lastname) => updateProfile("lastname", lastname);

  // ✅ Date of Birth
  const addProfileDateOfBirth = (dateofbirth) => setProfile("dateofbirth", dateofbirth);
  const updateProfileDateOfBirth = (dateofbirth) => updateProfile("dateofbirth", dateofbirth);

  // ✅ Email
  const updateProfileEmail = (email) => updateProfile("email", email);

  // ✅ Phone Number
  const addProfilePhoneNumber = (phoneNumber) => setProfile("phone", phoneNumber);
  const updateProfilePhoneNumber = (phoneNumber) => updateProfile("phone", phoneNumber);

  // ✅ Profile Preferences
  const setProfilePreferences = async (preferencesData) => {
    return axiosInstance.post("/users/profile/preferences", { preferences: preferencesData });
  };

  const updateProfilePreferences = (preferences) => updateProfile("preferences", preferences);

  return {
    setProfile,
    updateProfile,
    setProfileImg,
    updateProfileImg,
    setProfileBio,
    updateProfileBio,
    setProfilePreferences,
    updateProfilePreferences,
    updateProfileFirstName,
    updateProfileLastName,
    updateProfileEmail,
    updateProfilePhoneNumber,
    addProfilePhoneNumber,
    updateProfileDateOfBirth,
    addProfileDateOfBirth,
  };
};


// Logout hook
export const useLogout = () => {
  const dispatch = useDispatch();

  // Simple API function without loading/error handling
  const logoutUserFn = async () => {
    console.log('Logging out...');

    // Get token from Redux store instead of localStorage
    const state = store.getState();
    const token = state.user?.accessToken;

    const response = await axiosInstance.get('/users/logout', {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });

    console.log(response);
    dispatch({ type: 'user/logoutRequest' });
    dispatch(logoutUser());
    dispatch(setVehicles([]));
    console.log("Logout successful");

    return response;
  };

  return { logoutUser: logoutUserFn };
};
