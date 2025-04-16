
async uploadImage(file: File): Promise<{ success: boolean; data: { url: string } }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await EnhancedApiService.post<{ url: string }>(
      '/api/blog/upload', 
      formData,
      { 
        headers: { 
          'Content-Type': 'multipart/form-data' 
        },
        transformRequest: formData => formData // Ensure axios uses the FormData as-is
      }
    );
    
    if (response.success && response.data && response.data.url) {
      return { 
        success: true, 
        data: { url: response.data.url } 
      };
    } else {
      console.warn('Upload API request successful but no data:', response);
      
      const fakeUrl = URL.createObjectURL(file);
      return { 
        success: false, 
        data: { url: fakeUrl } 
      };
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    
    const fakeUrl = URL.createObjectURL(file);
    return { 
      success: false, 
      data: { url: fakeUrl } 
    };
  }
}
