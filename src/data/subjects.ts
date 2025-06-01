
export const subjects = {
  'Mathematics': {
    icon: '🧮',
    gradient: 'from-blue-500 to-purple-600',
    chapters: {
      8: [
        // Sem 1
        'Rational Numbers',
        'Linear Equations in One Variable',
        'Understanding Quadrilaterals',
        'Practical Geometry',
        'Data Handling',
        'Squares and Square Roots',
        'Cubes and Cube Roots',
        'Comparing Quantities',
        // Sem 2
        'Algebraic Expressions and Identities',
        'Visualizing Shapes',
        'Mensuration',
        'Exponents and Powers',
        'Direct and Indirect Proportions',
        'Factorization',
        'Introduction to Graphs',
        'Playing with Numbers'
      ],
      9: [
        // Sem 1
        'Number System',
        'Polynomials',
        'Co-ordinate Geometry',
        'Linear Equations in two variables',
        'Introduction to Euclid\'s Geometry',
        'Lines and Angles',
        // Sem 2
        'Triangles',
        'Quadrilaterals',
        'Circles',
        'Heron\'s Formula',
        'Surface Areas and Volumes',
        'Statistics'
      ],
      10: [
        // Sem 1
        'Real Numbers',
        'Polynomials',
        'Pair of Linear Equations in two variables',
        'Quadratic Equations',
        'Arithmetic Progressions',
        'Triangles',
        'Coordinate Geometry',
        // Sem 2
        'Introduction to Trigonometry',
        'Some Applications of Trigonometry',
        'Circles',
        'Areas Related to Circles',
        'Surface Areas and Volumes',
        'Statistics',
        'Probability'
      ]
    }
  },
  'Science': {
    icon: '🔬',
    gradient: 'from-green-500 to-emerald-600',
    chapters: {
      8: [
        // Physics
        'Force & Pressure',
        'Friction',
        'Coal & Petroleum',
        'Synthetic Fibers & Plastics',
        'Sounds',
        'Materials: Metals and Non Metals',
        'Light',
        'Chemical Effects of Electrical Current',
        'Some Natural Phenomena',
        'Combustion and Flames',
        'Stars and Solar System',
        // Biology
        'Cell - Structure and Function',
        'Microorganisms: Friends and Foes',
        'Crop Production and Management',
        'Reproduction in Animals',
        'Reaching the age of Adolescence',
        'Conservation of Plants and Animals',
        'Pollution of Air and Water'
      ],
      9: [
        'Matter in Our Surroundings',
        'Is Matter Around Us Pure?',
        'Atoms and Molecules',
        'Structure of the Atom',
        'The Fundamental Unit of Life',
        'Tissues',
        'Motions',
        'Force and Laws of Motion',
        'Gravitation',
        'Work and Energy',
        'Sound',
        'Improvement in Food Resources'
      ],
      10: [
        // Physics
        'Light - Reflection and Refraction',
        'The Human Eye and the Colourful World',
        'Electricity',
        'Magnetic Effects of Electric Current',
        // Biology
        'Life Processes',
        'Control and Coordination',
        'How do Organisms Reproduce?',
        'Heredity',
        // Chemistry
        'Chemical Reactions and Equations',
        'Acids, Bases and Salts',
        'Metals and Non-metals',
        'Carbon and Its Compounds'
      ]
    }
  },
  'Social Science': {
    icon: '🌍',
    gradient: 'from-orange-500 to-red-600',
    chapters: {
      8: [
        // Geography
        'Resources',
        'Land, Soil, Water, Natural Vegetation and Wildlife Resources',
        'Mineral and Power Resources',
        'Agriculture',
        'Industries',
        'Human Resources',
        // History
        'How, When and Where',
        'From Trade to Territory',
        'Ruling the Countryside',
        'Tribals, Dikus and the Vision of a Golden Age',
        'When People Rebel 1857 and After',
        'Weavers, Iron Smelters and Factory Owners',
        'Civilizing the "Native", Educating the Nation',
        'Women, Caste and Reform',
        'The Making of the National Movement 1870s-1947',
        'India After Independence',
        // Political Science
        'The Indian Constitution and Secularism',
        'Parliament and The Making of Laws',
        'The Judiciary',
        'Social Justice and The Marginalised',
        'Economic Presence of the Government'
      ],
      9: [
        // Geography
        'India - Size and Location',
        'Physical Features of India',
        'Drainage',
        'Climate',
        'Natural Vegetation and Wildlife',
        'Population',
        // History
        'The French Revolution',
        'Socialism in Europe and the Russian Revolution',
        'Nazism and the Rise of Hitler',
        'Forest Society and Colonialism',
        'Pastoralists in the Modern World',
        // Political Science
        'What is Democracy? Why Democracy?',
        'Constitutional Design',
        'Electoral Politics',
        'Working of Institutions',
        'Democratic Rights',
        // Economics
        'The Story of Village Palampur',
        'People as Resource',
        'Poverty as a Challenge',
        'Food Security in India'
      ],
      10: [
        // Placeholder for 10th grade - will be updated when provided
        'Economics - Development',
        'Geography - Resources and Development',
        'History - The Rise of Nationalism in Europe',
        'Political Science - Power Sharing'
      ]
    }
  },
  'English': {
    icon: '📖',
    gradient: 'from-pink-500 to-rose-600',
    chapters: {
      8: [
        'Grammar',
        'Literature',
        'Writing Skills',
        'Poetry',
        'Comprehension'
      ],
      9: [
        'Grammar',
        'Literature',
        'Writing Skills',
        'Poetry',
        'Comprehension'
      ],
      10: [
        'Grammar',
        'Literature',
        'Writing Skills',
        'Poetry',
        'Comprehension'
      ]
    }
  },
  'Hindi': {
    icon: '🇮🇳',
    gradient: 'from-amber-500 to-yellow-600',
    chapters: {
      8: [
        'व्याकरण',
        'साहित्य',
        'लेखन कौशल',
        'कविता'
      ],
      9: [
        'व्याकरण',
        'साहित्य',
        'लेखन कौशल',
        'कविता'
      ],
      10: [
        'व्याकरण',
        'साहित्य',
        'लेखन कौशल',
        'कविता'
      ]
    }
  }
};

export type SubjectName = keyof typeof subjects;
export type SubjectData = typeof subjects[SubjectName];
