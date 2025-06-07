import axiosInstance from './axiosInstance';
import { API_PATHS } from './apiPaths';
import { sanitizeImageUrl } from './sanitizeUrl';

const uploadImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
       
      },
    });

    const imageUrl = response?.data?.data?.imageUrl;
    if (!imageUrl) throw new Error('No image URL returned from server');

    return sanitizeImageUrl(imageUrl);
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error(error?.response?.data?.message || 'Failed to upload image');
  }
};

export default uploadImage;
