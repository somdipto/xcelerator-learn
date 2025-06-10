import { supabaseService } from './supabaseService';
import { subjects } from '@/data/subjects';

export interface ChapterSyncResult {
  success: boolean;
  created: number;
  updated: number;
  errors: string[];
}

class ChapterSyncService {
  /**
   * Synchronizes chapters from static data to database
   * Ensures student-side chapters match teacher portal
   */
  async syncChaptersFromStaticData(): Promise<ChapterSyncResult> {
    const result: ChapterSyncResult = {
      success: false,
      created: 0,
      updated: 0,
      errors: []
    };

    try {
      // Get all subjects from database
      const { data: dbSubjects, error: subjectsError } = await supabaseService.getSubjects();
      if (subjectsError) {
        result.errors.push(`Failed to fetch subjects: ${subjectsError.message}`);
        return result;
      }

      if (!dbSubjects || dbSubjects.length === 0) {
        result.errors.push('No subjects found in database. Please create subjects first.');
        return result;
      }

      // Get existing chapters from database
      const { data: existingChapters, error: chaptersError } = await supabaseService.getChapters();
      if (chaptersError) {
        result.errors.push(`Failed to fetch existing chapters: ${chaptersError.message}`);
        return result;
      }

      // Process each subject and its chapters
      for (const [subjectName, subjectData] of Object.entries(subjects)) {
        const dbSubject = dbSubjects.find(s => s.name === subjectName);
        if (!dbSubject) {
          result.errors.push(`Subject "${subjectName}" not found in database`);
          continue;
        }

        // Process chapters for each grade
        for (const [gradeStr, chapters] of Object.entries(subjectData.chapters)) {
          const grade = parseInt(gradeStr);
          
          // Check if this subject exists for this grade
          const subjectForGrade = dbSubjects.find(s => s.name === subjectName && s.grade === grade);
          if (!subjectForGrade) {
            result.errors.push(`Subject "${subjectName}" for grade ${grade} not found in database`);
            continue;
          }

          // Process each chapter
          for (let i = 0; i < chapters.length; i++) {
            const chapterName = chapters[i];
            
            // Check if chapter already exists
            const existingChapter = existingChapters?.find(
              c => c.name === chapterName && c.subject_id === subjectForGrade.id
            );

            if (!existingChapter) {
              // Create new chapter
              try {
                const { error: createError } = await supabaseService.createChapter({
                  name: chapterName,
                  subject_id: subjectForGrade.id,
                  order_index: i + 1,
                  description: `${chapterName} for ${subjectName} - Class ${grade}`
                });

                if (createError) {
                  result.errors.push(`Failed to create chapter "${chapterName}": ${createError.message}`);
                } else {
                  result.created++;
                }
              } catch (error) {
                result.errors.push(`Error creating chapter "${chapterName}": ${error}`);
              }
            } else if (existingChapter.order_index !== i + 1) {
              // Update order if needed
              try {
                const { error: updateError } = await supabaseService.updateChapter(existingChapter.id, {
                  order_index: i + 1
                });

                if (updateError) {
                  result.errors.push(`Failed to update chapter order for "${chapterName}": ${updateError.message}`);
                } else {
                  result.updated++;
                }
              } catch (error) {
                result.errors.push(`Error updating chapter "${chapterName}": ${error}`);
              }
            }
          }
        }
      }

      result.success = result.errors.length === 0;
      return result;

    } catch (error) {
      result.errors.push(`Unexpected error during sync: ${error}`);
      return result;
    }
  }

  /**
   * Creates missing subjects in database from static data
   */
  async syncSubjectsFromStaticData(): Promise<ChapterSyncResult> {
    const result: ChapterSyncResult = {
      success: false,
      created: 0,
      updated: 0,
      errors: []
    };

    try {
      const { data: existingSubjects, error: subjectsError } = await supabaseService.getSubjects();
      if (subjectsError) {
        result.errors.push(`Failed to fetch subjects: ${subjectsError.message}`);
        return result;
      }

      // Process each subject from static data
      for (const [subjectName, subjectData] of Object.entries(subjects)) {
        // Process each grade for this subject
        for (const gradeStr of Object.keys(subjectData.chapters)) {
          const grade = parseInt(gradeStr);
          
          // Check if subject exists for this grade
          const existingSubject = existingSubjects?.find(
            s => s.name === subjectName && s.grade === grade
          );

          if (!existingSubject) {
            // Create subject for this grade
            try {
              const { error: createError } = await supabaseService.createSubject({
                name: subjectName,
                grade: grade,
                description: `${subjectName} curriculum for Class ${grade}`,
                icon: subjectData.icon,
                color: '#2979FF' // Default color
              });

              if (createError) {
                result.errors.push(`Failed to create subject "${subjectName}" for grade ${grade}: ${createError.message}`);
              } else {
                result.created++;
              }
            } catch (error) {
              result.errors.push(`Error creating subject "${subjectName}" for grade ${grade}: ${error}`);
            }
          }
        }
      }

      result.success = result.errors.length === 0;
      return result;

    } catch (error) {
      result.errors.push(`Unexpected error during subject sync: ${error}`);
      return result;
    }
  }

  /**
   * Full synchronization: subjects first, then chapters
   */
  async fullSync(): Promise<ChapterSyncResult> {
    const subjectResult = await this.syncSubjectsFromStaticData();
    const chapterResult = await this.syncChaptersFromStaticData();

    return {
      success: subjectResult.success && chapterResult.success,
      created: subjectResult.created + chapterResult.created,
      updated: subjectResult.updated + chapterResult.updated,
      errors: [...subjectResult.errors, ...chapterResult.errors]
    };
  }

  /**
   * Get chapters for a specific subject and grade
   */
  async getChaptersForSubjectAndGrade(subjectName: string, grade: number) {
    try {
      // Get subject ID
      const { data: subjects, error: subjectsError } = await supabaseService.getSubjects(grade);
      if (subjectsError) {
        return { data: null, error: subjectsError };
      }

      const subject = subjects?.find(s => s.name === subjectName);
      if (!subject) {
        return { data: null, error: new Error(`Subject "${subjectName}" not found for grade ${grade}`) };
      }

      // Get chapters for this subject
      const { data: chapters, error: chaptersError } = await supabaseService.getChapters({
        subject_id: subject.id
      });

      return { data: chapters, error: chaptersError };
    } catch (error) {
      return { data: null, error };
    }
  }
}

export const chapterSyncService = new ChapterSyncService();
