const API_BASE_URL = "http://localhost:3001/api";

export interface ScannedImage {
  url: string;
  title?: string;
}

export interface UploadedImage {
  id: number;
  filename: string;
  url: string;
  originalUrl: string;
  size: number;
  mimeType: string;
  wordpressMediaId?: number;
  wordpressUrl?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export class ImageAPI {
  static async uploadImage(
    filename: string,
    imageBase64: string,
    originalUrl: string,
    mimeType: string = "image/jpeg",
  ): Promise<UploadedImage> {
    const response = await fetch(`${API_BASE_URL}/images/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename,
        imageBase64,
        originalUrl,
        mimeType,
      }),
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  static async uploadToWordPress(
    imageId: number,
    title?: string,
    description?: string,
  ): Promise<UploadedImage> {
    const response = await fetch(`${API_BASE_URL}/images/upload-to-wordpress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageId,
        title,
        description,
      }),
    });

    if (!response.ok) {
      throw new Error(`WordPress upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  static async getAllImages(): Promise<UploadedImage[]> {
    const response = await fetch(`${API_BASE_URL}/images`);

    if (!response.ok) {
      throw new Error(`Failed to fetch images: ${response.statusText}`);
    }

    return response.json();
  }

  static async getImage(id: number): Promise<UploadedImage> {
    const response = await fetch(`${API_BASE_URL}/images/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    return response.json();
  }

  static async deleteImage(id: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/images/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete image: ${response.statusText}`);
    }

    return response.json();
  }
}
