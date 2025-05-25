
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = 'http://localhost:3001/api';

class DatabaseService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3001');
  }

  // Content methods
  async uploadContent(formData: FormData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/content/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  async getContent() {
    try {
      const response = await axios.get(`${API_BASE_URL}/content`);
      return response.data;
    } catch (error) {
      console.error('Fetch content error:', error);
      throw error;
    }
  }

  async deleteContent(id: string) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/content/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete content error:', error);
      throw error;
    }
  }

  // Subject methods
  async getSubjects() {
    try {
      const response = await axios.get(`${API_BASE_URL}/subjects`);
      return response.data;
    } catch (error) {
      console.error('Fetch subjects error:', error);
      throw error;
    }
  }

  async createSubject(subjectData: any) {
    try {
      const response = await axios.post(`${API_BASE_URL}/subjects`, subjectData);
      return response.data;
    } catch (error) {
      console.error('Create subject error:', error);
      throw error;
    }
  }

  async updateSubject(id: string, subjectData: any) {
    try {
      const response = await axios.put(`${API_BASE_URL}/subjects/${id}`, subjectData);
      return response.data;
    } catch (error) {
      console.error('Update subject error:', error);
      throw error;
    }
  }

  async deleteSubject(id: string) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/subjects/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete subject error:', error);
      throw error;
    }
  }

  // Real-time event listeners
  onContentUploaded(callback: (content: any) => void) {
    this.socket.on('contentUploaded', callback);
  }

  onContentDeleted(callback: (id: string) => void) {
    this.socket.on('contentDeleted', callback);
  }

  onSubjectAdded(callback: (subject: any) => void) {
    this.socket.on('subjectAdded', callback);
  }

  onSubjectUpdated(callback: (subject: any) => void) {
    this.socket.on('subjectUpdated', callback);
  }

  onSubjectDeleted(callback: (id: string) => void) {
    this.socket.on('subjectDeleted', callback);
  }

  disconnect() {
    this.socket.disconnect();
  }
}

export default new DatabaseService();
