// Service for Railway S3 uploads
import axios from 'axios';

const handleResponse = (response) => {
    if (response.status >= 200 && response.status < 300) {
        return response.data;
    }
    const error = new Error(response.statusText);
    error.response = response;
    throw error;
};

const railwayService = {
    upload: async (file, onUploadProgress) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        const response = await axios.post('/api/v1/railway/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-CSRF-TOKEN': csrfToken,
            },
            onUploadProgress,
        });

        return handleResponse(response);
    },

    getFiles: async () => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const response = await axios.get('/api/v1/railway/files', {
            headers: {
                'X-CSRF-TOKEN': csrfToken,
            },
        });
        return handleResponse(response);
    },

    deleteFile: async (id) => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const response = await axios.delete(`/api/v1/railway/files/${id}`, {
            headers: {
                'X-CSRF-TOKEN': csrfToken,
            },
        });
        return handleResponse(response);
    },

    generateSignedUrl: async (key) => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const response = await axios.post('/api/v1/railway/generate-url', { key }, {
            headers: {
                'X-CSRF-TOKEN': csrfToken,
            },
        });
        return handleResponse(response);
    }
};

export default railwayService;
