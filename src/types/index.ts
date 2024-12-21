
export interface UploadedImageData {
    mimeType: string;
    imageUrl: string;
    publicId: string;
    size: number;
}

export interface UploadResult {
    success: boolean;
    data?: Record<string, UploadedImageData>;
    error?: { fieldName: string; message: string }[];
}