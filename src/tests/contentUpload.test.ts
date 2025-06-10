import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dataService } from '../services/dataService';
import { chapterSyncService } from '../services/chapterSyncService';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: 'test-id' },
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { id: 'test-id' },
              error: null
            }))
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          error: null
        }))
      }))
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => ({
          data: { path: 'test-path' },
          error: null
        })),
        getPublicUrl: vi.fn(() => ({
          data: { publicUrl: 'https://test-url.com' }
        }))
      }))
    }
  }
}));

describe('Content Upload System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Google Drive URL Utilities', () => {
    it('should detect Google Drive URLs correctly', () => {
      const validUrls = [
        'https://drive.google.com/file/d/1234567890/view',
        'https://docs.google.com/document/d/1234567890/edit',
        'https://drive.google.com/open?id=1234567890'
      ];

      const invalidUrls = [
        'https://youtube.com/watch?v=123',
        'https://example.com/file.pdf',
        'not-a-url'
      ];

      validUrls.forEach(url => {
        expect(dataService.isGoogleDriveUrl(url)).toBe(true);
      });

      invalidUrls.forEach(url => {
        expect(dataService.isGoogleDriveUrl(url)).toBe(false);
      });
    });

    it('should convert Google Drive URLs to proper sharing format', () => {
      const testCases = [
        {
          input: 'https://drive.google.com/file/d/1yGFT_Px8OCZKIRjHvcyqaF5CtwS1Qn15/edit',
          expected: 'https://drive.google.com/file/d/1yGFT_Px8OCZKIRjHvcyqaF5CtwS1Qn15/view?usp=sharing'
        },
        {
          input: 'https://drive.google.com/open?id=1yGFT_Px8OCZKIRjHvcyqaF5CtwS1Qn15',
          expected: 'https://drive.google.com/file/d/1yGFT_Px8OCZKIRjHvcyqaF5CtwS1Qn15/view?usp=sharing'
        }
      ];

      testCases.forEach(({ input, expected }) => {
        expect(dataService.convertGoogleDriveUrl(input)).toBe(expected);
      });
    });

    it('should generate embed URLs for Google Drive files', () => {
      const input = 'https://drive.google.com/file/d/1yGFT_Px8OCZKIRjHvcyqaF5CtwS1Qn15/view';
      const expected = 'https://drive.google.com/file/d/1yGFT_Px8OCZKIRjHvcyqaF5CtwS1Qn15/preview';
      
      expect(dataService.getGoogleDriveEmbedUrl(input)).toBe(expected);
    });
  });

  describe('Content Validation', () => {
    it('should validate required fields correctly', () => {
      const validMaterial = {
        title: 'Test Material',
        type: 'textbook' as const,
        subject_id: 'subject-123',
        chapter_id: 'chapter-456',
        grade: 8
      };

      const result = dataService.validateContentData(validMaterial);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const invalidMaterial = {
        title: '',
        type: undefined,
        subject_id: '',
        chapter_id: '',
        grade: 0
      };

      const result = dataService.validateContentData(invalidMaterial);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Title is required');
      expect(result.errors).toContain('Content type is required');
    });

    it('should validate URLs for video and quiz content', () => {
      const videoMaterial = {
        title: 'Test Video',
        type: 'video' as const,
        subject_id: 'subject-123',
        chapter_id: 'chapter-456',
        grade: 8,
        url: 'invalid-url'
      };

      const result = dataService.validateContentData(videoMaterial);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Please provide a valid URL');
    });
  });

  describe('File Validation', () => {
    it('should validate file types correctly', () => {
      const allowedTypes = ['pdf', 'doc', 'docx'];
      
      expect(dataService.validateFileType('document.pdf', allowedTypes)).toBe(true);
      expect(dataService.validateFileType('document.doc', allowedTypes)).toBe(true);
      expect(dataService.validateFileType('image.jpg', allowedTypes)).toBe(false);
      expect(dataService.validateFileType('noextension', allowedTypes)).toBe(false);
    });

    it('should validate file sizes correctly', () => {
      const smallFile = new File(['content'], 'small.pdf', { type: 'application/pdf' });
      Object.defineProperty(smallFile, 'size', { value: 1024 * 1024 }); // 1MB
      
      const largeFile = new File(['content'], 'large.pdf', { type: 'application/pdf' });
      Object.defineProperty(largeFile, 'size', { value: 100 * 1024 * 1024 }); // 100MB
      
      expect(dataService.validateFileSize(smallFile, 50)).toBe(true);
      expect(dataService.validateFileSize(largeFile, 50)).toBe(false);
    });
  });

  describe('Study Material CRUD Operations', () => {
    it('should create study material with Google Drive URL conversion', async () => {
      const materialData = {
        teacher_id: 'teacher-123',
        title: 'Test Material',
        type: 'textbook' as const,
        url: 'https://drive.google.com/file/d/1234567890/edit',
        subject_id: 'subject-123',
        chapter_id: 'chapter-456',
        grade: 8,
        is_public: true
      };

      const result = await dataService.createStudyMaterial(materialData);
      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
    });

    it('should update study material', async () => {
      const updates = {
        title: 'Updated Title',
        description: 'Updated description'
      };

      const result = await dataService.updateStudyMaterial('test-id', updates);
      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
    });

    it('should delete study material', async () => {
      const result = await dataService.deleteStudyMaterial('test-id');
      expect(result.error).toBeNull();
    });
  });

  describe('Chapter Management', () => {
    it('should get chapters with filters', async () => {
      const result = await dataService.getChapters({ subject_id: 'subject-123' });
      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
    });

    it('should create chapter', async () => {
      const chapterData = {
        name: 'Test Chapter',
        subject_id: 'subject-123',
        order_index: 1,
        description: 'Test description'
      };

      const result = await dataService.createChapter(chapterData);
      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
    });
  });
});

describe('Chapter Sync Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should sync chapters from static data', async () => {
    // Mock the service methods
    vi.spyOn(chapterSyncService, 'syncSubjectsFromStaticData').mockResolvedValue({
      success: true,
      created: 5,
      updated: 0,
      errors: []
    });

    vi.spyOn(chapterSyncService, 'syncChaptersFromStaticData').mockResolvedValue({
      success: true,
      created: 20,
      updated: 0,
      errors: []
    });

    const result = await chapterSyncService.fullSync();
    
    expect(result.success).toBe(true);
    expect(result.created).toBe(25);
    expect(result.errors).toHaveLength(0);
  });

  it('should handle sync errors gracefully', async () => {
    vi.spyOn(chapterSyncService, 'syncSubjectsFromStaticData').mockResolvedValue({
      success: false,
      created: 0,
      updated: 0,
      errors: ['Test error']
    });

    const result = await chapterSyncService.fullSync();
    
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
