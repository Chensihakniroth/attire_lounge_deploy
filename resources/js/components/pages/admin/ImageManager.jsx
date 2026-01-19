import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, CheckCircle, AlertCircle, ServerCrash, PlusCircle, Trash2 } from 'lucide-react';

const ImageManager = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchImages = async () => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            const response = await axios.get('/api/v1/admin/images', {
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                },
            });
            setImages(response.data);
        } catch (err) {
            setError('Failed to load images.');
            console.error('Error fetching images:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

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
            await axios.post('/api/v1/admin/upload-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });
            setUploadStatus({ type: 'success', message: 'Upload successful!' });
            setSelectedFile(null);
            setPreview(null);
            fetchImages(); // Refresh the image list
        } catch (error) {
            setUploadStatus({ type: 'error', message: 'Upload failed. Please check the console for details.' });
            console.error('Error uploading image:', error.response ? error.response.data : error);
        }
    };

    const handleDelete = async (imageUrl) => {
        if (!confirm('Are you sure you want to delete this image?')) {
            return;
        }

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            await axios.post('/api/v1/admin/delete-image', { image: imageUrl }, {
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                },
            });
            fetchImages(); // Refresh the image list
        } catch (error) {
            console.error('Error deleting image:', error.response ? error.response.data : error);
            alert('Failed to delete image. Please try again.');
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
                                    <p className="text-xs text-gray-500">JPG, PNG, GIF (Max 10MB)</p>
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
                {loading && <p>Loading images...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {!loading && !error && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {images.map((url, index) => (
                            <div key={index} className="relative group">
                                <img src={url} alt={`Image ${index}`} className="w-full h-40 object-cover rounded-lg shadow-md" />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => handleDelete(url)}
                                        className="p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete Image"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                         {images.length === 0 && <p className="text-gray-500">No images found in this collection.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageManager;

