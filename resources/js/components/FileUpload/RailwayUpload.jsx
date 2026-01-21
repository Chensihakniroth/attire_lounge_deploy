import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, Trash2, Copy, Eye, X } from 'lucide-react';
import railwayService from '../../services/railwayService';


const FilePreviewModal = ({ file, onClose }) => {
    if (!file) return null;

    const getFixedUrl = (url) => {
        try {
            const urlObject = new URL(url);
            if (urlObject.pathname.startsWith('/uploads/uploads/')) {
                urlObject.pathname = urlObject.pathname.replace('/uploads/uploads/', '/uploads/');
            }
            return urlObject.toString();
        } catch (error) {
            // If the URL is invalid, return it as is.
            return url;
        }
    };

    const fixedUrl = getFixedUrl(file.public_url);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 max-w-3xl w-full relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">
                    <X size={24} />
                </button>
                <h3 className="text-lg font-semibold mb-4">{file.original_name}</h3>
                <div className="max-h-[70vh] overflow-auto">
                    {file.file_type.startsWith('image/') ? (
                        <img src={fixedUrl} alt={file.original_name} className="w-full h-auto rounded" />
                    ) : file.file_type.startsWith('video/') ? (
                        <video controls src={fixedUrl} className="w-full h-auto rounded" />
                    ) : (
                        <div className="text-center p-8">
                            <p>No preview available for this file type.</p>
                            <a href={fixedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mt-4 inline-block">
                                Download File
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const RailwayUpload = () => {
    const [files, setFiles] = useState([]);
    const [uploadingFiles, setUploadingFiles] = useState({});
    const [previewFile, setPreviewFile] = useState(null);

    const fetchFiles = async () => {
        const existingFiles = await railwayService.getFiles();
        setFiles(existingFiles);
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const onDrop = useCallback(acceptedFiles => {
        acceptedFiles.forEach(file => {
            handleUpload(file);
        });
    }, []);

    const handleUpload = async (file) => {
        const tempId = `uploading-${Date.now()}-${file.name}`;
        setUploadingFiles(prev => ({ ...prev, [tempId]: { file, progress: 0 } }));

        try {
            const response = await railwayService.upload(file, (progressEvent) => {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadingFiles(prev => ({
                    ...prev,
                    [tempId]: { ...prev[tempId], progress }
                }));
            });
            setFiles(prev => [response, ...prev]);
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploadingFiles(prev => {
                const newUploading = { ...prev };
                delete newUploading[tempId];
                return newUploading;
            });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this file?')) {
            await railwayService.deleteFile(id);
            setFiles(files.filter(f => f.id !== id));
        }
    };

    const copyToClipboard = (text) => {
        const getFixedUrl = (url) => {
            try {
                const urlObject = new URL(url);
                if (urlObject.pathname.startsWith('/uploads/uploads/')) {
                    urlObject.pathname = urlObject.pathname.replace('/uploads/uploads/', '/uploads/');
                }
                return urlObject.toString();
            } catch (error) {
                return url;
            }
        };
        const fixedUrl = getFixedUrl(text);
        navigator.clipboard.writeText(fixedUrl);
        // You could add a toast notification here
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Railway S3 Upload</h1>

            <div
                {...getRootProps()}
                className={`border-4 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
            >
                <input {...getInputProps()} />
                <UploadCloud size={48} className="mx-auto text-gray-400 mb-4" />
                {isDragActive ? (
                    <p className="text-xl">Drop the files here ...</p>
                ) : (
                    <p className="text-xl">Drag 'n' drop some files here, or click to select files</p>
                )}
                <p className="text-sm text-gray-500 mt-2">Max file size: 100MB</p>
            </div>

            {Object.keys(uploadingFiles).length > 0 && (
                <div className="mt-8">
                    <h2 className="text-2xl font-semibold mb-4">Uploading...</h2>
                    <div className="space-y-4">
                        {Object.entries(uploadingFiles).map(([id, { file, progress }]) => (
                            <div key={id} className="bg-gray-100 rounded-lg p-4 flex items-center gap-4">
                                <File size={32} className="text-gray-500" />
                                <div className="flex-grow">
                                    <p className="font-semibold">{file.name}</p>
                                    <div className="w-full bg-gray-300 rounded-full h-2.5 mt-1">
                                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                                <p>{progress}%</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Uploaded Files</h2>
                <div className="bg-white shadow rounded-lg overflow-x-auto">
                    <table className="w-full whitespace-nowrap">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 text-left font-semibold text-gray-600">File Name</th>
                                <th className="p-4 text-left font-semibold text-gray-600">Size</th>
                                <th className="p-4 text-left font-semibold text-gray-600">Type</th>
                                <th className="p-4 text-left font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {files.map(file => (
                                <tr key={file.id}>
                                    <td className="p-4">{file.original_name}</td>
                                    <td className="p-4">{(file.file_size / 1024 / 1024).toFixed(2)} MB</td>
                                    <td className="p-4">{file.file_type}</td>
                                    <td className="p-4 flex items-center gap-2">
                                        <button onClick={() => setPreviewFile(file)} className="text-gray-500 hover:text-blue-500" title="Preview"><Eye size={18}/></button>
                                        <button onClick={() => copyToClipboard(file.public_url)} className="text-gray-500 hover:text-green-500" title="Copy URL"><Copy size={18}/></button>
                                        <button onClick={() => handleDelete(file.id)} className="text-gray-500 hover:text-red-500" title="Delete"><Trash2 size={18}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {files.length === 0 && <p className="p-4 text-center text-gray-500">No files uploaded yet.</p>}
                </div>
            </div>
            <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
        </div>
    );
};

export default RailwayUpload;