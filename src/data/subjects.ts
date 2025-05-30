
export const subjects = {
  'Mathematics': {
    icon: '🧮',
    gradient: 'from-blue-500 to-purple-600',
    chapters: [
      'Number Systems',
      'Algebra',
      'Geometry',
      'Trigonometry',
      'Statistics',
      'Probability'
    ]
  },
  'Science': {
    icon: '🔬',
    gradient: 'from-green-500 to-emerald-600',
    chapters: [
      'Physics - Motion',
      'Physics - Energy',
      'Chemistry - Atoms',
      'Biology - Life Processes',
      'Environmental Science'
    ]
  },
  'Social Science': {
    icon: '🌍',
    gradient: 'from-orange-500 to-red-600',
    chapters: [
      'History - Ancient India',
      'Geography - Resources',
      'Civics - Democracy',
      'Economics - Development'
    ]
  },
  'English': {
    icon: '📖',
    gradient: 'from-pink-500 to-rose-600',
    chapters: [
      'Grammar',
      'Literature',
      'Writing Skills',
      'Poetry',
      'Comprehension'
    ]
  },
  'Hindi': {
    icon: '🇮🇳',
    gradient: 'from-amber-500 to-yellow-600',
    chapters: [
      'व्याकरण',
      'साहित्य',
      'लेखन कौशल',
      'कविता'
    ]
  }
};

export type SubjectName = keyof typeof subjects;
export type SubjectData = typeof subjects[SubjectName];
