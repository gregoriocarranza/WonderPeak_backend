import axios from 'axios';

export class AdService {
  private adApiUrl: string = process.env.AD_API_URL || '';

  public async getAds(): Promise<any[]> {
    if (!this.adApiUrl) {
      console.error('AD_API_URL environment variable is not set');
      return [];
    }

    try {
      const response = await axios.get(`${this.adApiUrl}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ads:', error);
      return [];
    }
  }
} 