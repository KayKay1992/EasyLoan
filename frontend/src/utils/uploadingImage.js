import axiosInstance from './axiosInstance';
import { API_PATHS } from './apiPaths';

const uploadImage = async (imageFile) => {
  if (!imageFile) {
    console.error('No image file provided');
    throw new Error('No image file provided');
  }

  // Validate file type and size
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(imageFile.type)) {
    console.error(`Invalid file type: ${imageFile.type}`);
    throw new Error('Only .jpeg, .jpg, and .png files are allowed');
  }
  if (imageFile.size > 5 * 1024 * 1024) {
    console.error(`File size too large: ${imageFile.size} bytes`);
    throw new Error('Image size must be less than 5MB');
  }

  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    console.log('Uploading image to:', API_PATHS.IMAGE.UPLOAD_IMAGE);
    const response = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Upload response:', response.data);
    const imageUrl = response?.data?.data?.imageUrl;
    if (!imageUrl) {
      console.error('No image URL in response:', response.data);
      throw new Error('No image URL returned from server');
    }

    return { imageUrl };
  } catch (error) {
    console.error('Image upload error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.response?.data?.message || 'Failed to upload image');
  }
};

export default uploadImage;