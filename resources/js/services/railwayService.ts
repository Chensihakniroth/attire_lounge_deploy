// Service for Railway S3 uploads
import axios, { AxiosProgressEvent, AxiosResponse } from 'axios';

interface FileResponse {
    id: number;
    name: string;
    url: string;
    size: number;
    mime_type: string;
}

interface SignedUrlResponse {
    url: string;
    expires_at: string;
}

const handleResponse = <T>(response: AxiosResponse<T>): T => {
    if (response.status >= 200 && response.status < 300) {
        return response.data;
    }
    const error: any = new Error(response.statusText);
    error.response = response;
    throw error;
};

const getCsrfToken = (): string | undefined => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? undefined;
};

const railwayService = {
    upload: async (
        file: File, 
        onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
    ): Promise<FileResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        
        const csrfToken = getCsrfToken();

        const response = await axios.post<FileResponse>('/api/v1/railway/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-CSRF-TOKEN': csrfToken,
            },
            onUploadProgress,
        });

        return handleResponse(response);
    },

    getFiles: async (): Promise<FileResponse[]> => {
        const csrfToken = getCsrfToken();
        const response = await axios.get<FileResponse[]>('/api/v1/railway/files', {
            headers: {
                'X-CSRF-TOKEN': csrfToken,
            },
        });
        return handleResponse(response);
    },

    deleteFile: async (id: number): Promise<{ success: boolean; message: string }> => {
        const csrfToken = getCsrfToken();
        const response = await axios.delete<{ success: boolean; message: string }>(`/api/v1/railway/files/${id}`, {
            headers: {
                'X-CSRF-TOKEN': csrfToken,
            },
        });
        return handleResponse(response);
    },

    generateSignedUrl: async (key: string): Promise<SignedUrlResponse> => {
        const csrfToken = getCsrfToken();
        const response = await axios.post<SignedUrlResponse>('/api/v1/railway/generate-url', { key }, {
            headers: {
                'X-CSRF-TOKEN': csrfToken,
            },
        });
        return handleResponse(response);
    }
};

export default railwayService;
