// src/utils/download.ts
export const downloadFile = async (url: string, params: any): Promise<any> => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    })

    return {
      data: await response.arrayBuffer()
    }
  } catch (error) {
    console.error('Download failed:', error)
    throw error
  }
}
