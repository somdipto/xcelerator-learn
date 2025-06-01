
export const subjects = {
  'Mathematics': {
    icon: '🧮',
    gradient: 'from-blue-500 to-purple-600',
    chapters: {
      8: [
        // Sem 1
        'Chapter 1: Rational Numbers',
        'Chapter 2: Linear Equations in One Variable',
        'Chapter 3: Understanding Quadrilaterals',
        'Chapter 4: Practical Geometry',
        'Chapter 5: Data Handling',
        'Chapter 6: Squares and Square Roots',
        'Chapter 7: Cubes and Cube Roots',
        'Chapter 8: Comparing Quantities',
        // Sem 2
        'Chapter 9: Algebraic Expressions and Identities',
        'Chapter 10: Visualizing Shapes',
        'Chapter 11: Mensuration',
        'Chapter 12: Exponents and Powers',
        'Chapter 13: Direct and Indirect Proportions',
        'Chapter 14: Factorization',
        'Chapter 15: Introduction to Graphs',
        'Chapter 16: Playing with Numbers'
      ],
      9: [
        // Sem 1
        'Chapter 1: Number System',
        'Chapter 2: Polynomials',
        'Chapter 3: Co-ordinate Geometry',
        'Chapter 4: Linear Equations in two variables',
        'Chapter 5: Introduction to Euclid\'s Geometry',
        'Chapter 6: Lines and Angles',
        // Sem 2
        'Chapter 7: TRIANGLES',
        'Chapter 8: Quadrilaterals',
        'Chapter 9: Circles',
        'Chapter 10: HERON\'S FORMULA',
        'Chapter 11: SURFACE AREAS AND VOLUMES',
        'Chapter 12: Statistics'
      ],
      10: [
        // Sem 1
        'Chapter 1: Real Numbers',
        'Chapter 2: Polynomials',
        'Chapter 3: Pair of Linear Equations in two variables',
        'Chapter 4: Quadratic Equations',
        'Chapter 5: Arithmetic Progressions',
        'Chapter 6: Triangles',
        'Chapter 7: Coordinate Geometry',
        // Sem 2
        'Chapter 8: INTRODUCTION TO TRIGONOMETRY',
        'Chapter 9: SOME APPLICATIONS OF TRIGONOMETRY',
        'Chapter 10: Circles',
        'Chapter 11: AREAS RELATED TO CIRCLES',
        'Chapter 12: SURFACE AREAS AND VOLUMES',
        'Chapter 13: STATISTICS',
        'Chapter 14: PROBABILITY'
      ]
    }
  },
  'Science': {
    icon: '🔬',
    gradient: 'from-green-500 to-emerald-600',
    chapters: {
      8: [
        // Physics
        'Chapter 1: Force & Pressure',
        'Chapter 2: Friction',
        'Chapter 3: Coal & Petroleum',
        'Chapter 4: Synthetic Fibers & Plastics',
        'Chapter 5: Sounds',
        'Chapter 6: Materials: Metals and Non Metals',
        'Chapter 7: Light',
        'Chapter 8: Chemical Effects of Electrical Current',
        'Chapter 9: Some Natural Phenomena',
        'Chapter 10: Combustion and Flames',
        'Chapter 11: Stars and Solar System',
        // Biology
        'Chapter 1: Cell - Structure and Function',
        'Chapter 2: Microorganisms: Friends and Foes',
        'Chapter 3: Crop Production and Management',
        'Chapter 4: Reproduction in Animals',
        'Chapter 5: Reaching the age of Adolescence',
        'Chapter 6: Conservation of Plants and Animals',
        'Chapter 7: Pollution of Air and Water'
      ],
      9: [
        'Chapter 1: MATTER IN OUR SURROUNDINGS',
        'Chapter 2: IS MATTER AROUND US PURE?',
        'Chapter 3: ATOMS AND MOLECULES',
        'Chapter 4: STRUCTURE OF THE ATOM',
        'Chapter 5: THE FUNDAMENTAL UNIT OF LIFE',
        'Chapter 6: TISSUES',
        'Chapter 7: MOTIONS',
        'Chapter 8: FORCE AND LAWS OF MOTION',
        'Chapter 9: GRAVITATION',
        'Chapter 10: WORK AND ENERGY',
        'Chapter 11: SOUND',
        'Chapter 12: IMPROVEMENT IN FOOD RESOURCES'
      ],
      10: [
        // Physics
        'Chapter 1: Light - Reflection and Refraction',
        'Chapter 2: The Human Eye and the Colourful World',
        'Chapter 3: Electricity',
        'Chapter 4: Magnetic Effects of Electric Current',
        // Biology
        'Chapter 1: Life Processes',
        'Chapter 2: Control and Coordination',
        'Chapter 3: How do Organisms Reproduce?',
        'Chapter 4: Heredity',
        // Chemistry
        'Chapter 1: Chemical Reactions and Equations',
        'Chapter 2: Acids, Bases and Salts',
        'Chapter 3: Metals and Non-metals',
        'Chapter 4: Carbon and Its Compounds'
      ]
    }
  },
  'Social Science': {
    icon: '🌍',
    gradient: 'from-orange-500 to-red-600',
    chapters: {
      8: [
        // Geography
        'Chapter 1: Resources',
        'Chapter 2: Land, Soil, Water, Natural Vegetation and Wildlife Resources',
        'Chapter 3: Mineral and Power Resources',
        'Chapter 4: Agriculture',
        'Chapter 5: Industries',
        'Chapter 6: Human Resources',
        // History
        'Chapter 1: How, When and Where',
        'Chapter 2: From Trade to Territory',
        'Chapter 3: Ruling the Countryside',
        'Chapter 4: Tribals, Dikus and the Vision of a Golden Age',
        'Chapter 5: When People Rebel 1857 and After',
        'Chapter 6: Weavers, Iron Smelters and Factory Owners',
        'Chapter 7: Civilizing the "Native", Educating the Nation',
        'Chapter 8: Women, Caste and Reform',
        'Chapter 9: The Making of the National Movement 1870s-1947',
        'Chapter 10: India After Independence',
        // Political Science
        'Unit 1: The Indian Constitution and Secularism',
        'Chapter 2: Parliament and The Making of Laws',
        'Chapter 3: The Judiciary',
        'Chapter 4: Social Justice and The Marginalised',
        'Chapter 5: Economic Presence of the Government'
      ],
      9: [
        // Geography
        'Chapter 1: India - Size and Location',
        'Chapter 2: Physical Features of India',
        'Chapter 3: Drainage',
        'Chapter 4: Climate',
        'Chapter 5: Natural Vegetation and Wildlife',
        'Chapter 6: Population',
        // History
        'Chapter 1: The French Revolution',
        'Chapter 2: Socialism in Europe and the Russian Revolution',
        'Chapter 3: Nazism and the Rise of Hitler',
        'Chapter 4: Forest Society and Colonialism',
        'Chapter 5: Pastoralists in the Modern World',
        // Political Science
        'Chapter 1: WHAT IS DEMOCRACY? WHY DEMOCRACY?',
        'Chapter 2: CONSTITUTIONAL DESIGN',
        'Chapter 3: ELECTORAL POLITICS',
        'Chapter 4: WORKING OF INSTITUTIONS',
        'Chapter 5: Demographic Rights',
        // Economics
        'Chapter 1: The Story of Village Palampur',
        'Chapter 2: People as Resource',
        'Chapter 3: Poverty as a Challenge',
        'Chapter 4: Food Security in India'
      ],
      10: [
        // Placeholder for 10th grade - will be updated when provided
        'Economics - Development',
        'Geography - Resources and Development',
        'History - The Rise of Nationalism in Europe',
        'Political Science - Power Sharing'
      ]
    }
  }
};

export type SubjectName = keyof typeof subjects;
export type SubjectData = typeof subjects[SubjectName];
