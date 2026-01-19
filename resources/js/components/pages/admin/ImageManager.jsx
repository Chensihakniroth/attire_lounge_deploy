import React, { useState } from 'react';
import axios from 'axios';
import { Upload, CheckCircle, AlertCircle, ServerCrash, PlusCircle } from 'lucide-react';

const ImageManager = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setUploadStatus({ type: 'error', message: 'Please select a file to upload.' });
            return;
        }

        const formData = new FormData();
        formData.append('image', selectedFile);

        setUploadStatus({ type: 'info', message: 'Uploading...' });

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            await axios.post('/api/v1/upload-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });
            setUploadStatus({ type: 'success', message: 'Upload successful! Refreshing the page might be needed to see the new image in other sections.' });
            setSelectedFile(null);
            setPreview(null);
        } catch (error) {
            setUploadStatus({ type: 'error', message: 'Upload failed. Please try again.' });
            console.error('Error uploading image:', error);
        }
    };

    const UploadStatus = () => {
        if (!uploadStatus.message) return null;
        const icon = uploadStatus.type === 'success' ? <CheckCircle /> : <AlertCircle />;
        const color = uploadStatus.type === 'success' ? 'green' : 'red';
        return (
            <div className={`flex items-center space-x-2 text-${color}-500`}>
                {icon}
                <span>{uploadStatus.message}</span>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Image Manager</h1>
                <p className="mt-1 text-gray-600">Upload new product images and manage existing ones.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                    <PlusCircle className="w-5 h-5 mr-2 text-blue-600" /> Upload New Image
                </h2>
                <form onSubmit={handleUpload} className="space-y-4">
                    <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            {preview ? (
                                <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                                <div className="text-center p-4">
                                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">Select Image</p>
                                    <p className="text-xs text-gray-500">JPG, PNG, GIF (Max 2MB)</p>
                                </div>
                            )}
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                        </label>
                        <div className="flex-1 w-full md:w-auto">
                            <button type="submit" className="w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium rounded-md shadow hover:bg-blue-700 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                Upload Image
                            </button>
                            <div className="mt-4">
                                <UploadStatus />
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-900">Existing Images</h2>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg shadow-sm">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <ServerCrash className="h-6 w-6 text-yellow-700" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-medium text-yellow-800">Image Listing Unavailable</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>
                                    Displaying the list of all images is currently unavailable due to a server configuration issue.
                                </p>
                                <p className="mt-2 font-semibold">
                                    To enable image listing and management, please ensure the storage credentials used by the application have the <strong>s3:ListBucket</strong> permission.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageManager;

