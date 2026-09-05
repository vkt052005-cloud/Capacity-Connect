import { getDb } from './schema';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export const seedDatabase = async () => {
  const db = getDb();

  // Check if we already seeded
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) {
    console.log('Database already seeded, skipping.');
    return;
  }

  console.log('Seeding database...');

  // Institutes
  const institutes = [
    { id: uuidv4(), name: 'India Meteorological Department', name_hi: 'भारत मौसम विज्ञान विभाग', code: 'IMD', location: 'New Delhi', type: 'HQ' },
    { id: uuidv4(), name: 'Indian National Centre for Ocean Information Services', name_hi: 'भारतीय राष्ट्रीय महासागर सूचना सेवा केंद्र', code: 'INCOIS', location: 'Hyderabad', type: 'Autonomous' },
    { id: uuidv4(), name: 'National Centre for Medium Range Weather Forecasting', name_hi: 'राष्ट्रीय मध्यम अवधि मौसम पूर्वानुमान केंद्र', code: 'NCMRWF', location: 'Noida', type: 'Subordinate' },
    { id: uuidv4(), name: 'Indian Institute of Tropical Meteorology', name_hi: 'भारतीय उष्णदेशीय मौसम विज्ञान संस्थान', code: 'IITM', location: 'Pune', type: 'Autonomous' },
    { id: uuidv4(), name: 'National Institute of Ocean Technology', name_hi: 'राष्ट्रीय महासागर प्रौद्योगिकी संस्थान', code: 'NIOT', location: 'Chennai', type: 'Autonomous' },
    { id: uuidv4(), name: 'Centre for Marine Living Resources & Ecology', name_hi: 'समुद्री जीव संसाधन और पारिस्थितिकी केंद्र', code: 'CMLRE', location: 'Kochi', type: 'Attached' }
  ];

  const insertInstitute = db.prepare('INSERT INTO institutes (id, name, name_hi, code, location, type) VALUES (?, ?, ?, ?, ?, ?)');
  for (const inst of institutes) {
    insertInstitute.run(inst.id, inst.name, inst.name_hi, inst.code, inst.location, inst.type);
  }

  // Users
  const adminId = uuidv4();
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password, name, name_hi, role, status, institute_id, competency_tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(adminId, 'admin@moes.gov.in', hashedPassword, 'System Admin', 'सिस्टम व्यवस्थापक', 'admin', 'approved', institutes[0].id, '[]');

  // Trainers
  const trainer1Id = uuidv4();
  const trainer2Id = uuidv4();
  const trainer3Id = uuidv4();
  insertUser.run(trainer1Id, 'trainer1@imd.gov.in', hashedPassword, 'Dr. RK Sharma', 'डॉ आर के शर्मा', 'trainer', 'approved', institutes[0].id, JSON.stringify(['Radar Meteorology', 'NWP']));
  insertUser.run(trainer2Id, 'trainer2@incois.gov.in', hashedPassword, 'Dr. S. Nayak', 'डॉ एस नायक', 'trainer', 'approved', institutes[1].id, JSON.stringify(['Oceanography', 'Tsunami Warning']));
  insertUser.run(trainer3Id, 'trainer3@iitm.gov.in', hashedPassword, 'Dr. M. Rajeevan', 'डॉ एम राजीवन', 'trainer', 'approved', institutes[3].id, JSON.stringify(['Climate Science', 'Monsoon Dynamics']));

  // Trainees
  const trainee1Id = uuidv4();
  const trainee2Id = uuidv4();
  const trainee3Id = uuidv4();
  insertUser.run(trainee1Id, 'trainee1@niot.res.in', hashedPassword, 'Arun Kumar', 'अरुण कुमार', 'trainee', 'approved', institutes[4].id, JSON.stringify(['Ocean Tech']));
  insertUser.run(trainee2Id, 'trainee2@imd.gov.in', hashedPassword, 'Priya Singh', 'प्रिया सिंह', 'trainee', 'approved', institutes[0].id, JSON.stringify(['Weather Forecasting']));
  insertUser.run(trainee3Id, 'trainee3@ncmrwf.gov.in', hashedPassword, 'Amit Patel', 'अमित पटेल', 'trainee', 'pending', institutes[2].id, JSON.stringify(['Modeling']));

  // Courses
  const course1Id = uuidv4();
  const course2Id = uuidv4();
  const insertCourse = db.prepare(`
    INSERT INTO courses (id, title, title_hi, description, description_hi, domain, institute_id, level, delivery_mode, duration_hours, trainer_id, start_date, end_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertCourse.run(
    course1Id, 'Advanced Radar Meteorology', 'उन्नत रडार मौसम विज्ञान', 
    'Comprehensive training on Doppler Weather Radars', 'डॉपलर मौसम रडार पर व्यापक प्रशिक्षण',
    'Meteorology', institutes[0].id, 'advanced', 'hybrid', 40, trainer1Id,
    new Date().toISOString(), new Date(Date.now() + 30*24*60*60*1000).toISOString()
  );

  insertCourse.run(
    course2Id, 'Ocean State Forecasting', 'महासागर स्थिति पूर्वानुमान',
    'Basics of ocean modeling and forecasting', 'महासागर मॉडलिंग और पूर्वानुमान की मूल बातें',
    'Oceanography', institutes[1].id, 'intermediate', 'online', 20, trainer2Id,
    new Date().toISOString(), new Date(Date.now() + 15*24*60*60*1000).toISOString()
  );

  // Assessments
  const assessment1Id = uuidv4();
  const insertAssessment = db.prepare(`
    INSERT INTO assessments (id, course_id, title, total_marks, created_by)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertAssessment.run(assessment1Id, course1Id, 'Radar Fundamentals Quiz', 5, trainer1Id);

  // Questions
  const insertQuestion = db.prepare(`
    INSERT INTO questions (id, assessment_id, question_text, option_a, option_b, option_c, option_d, correct_option, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  insertQuestion.run(uuidv4(), assessment1Id, 'What does DWR stand for?', 'Doppler Weather Radar', 'Dual Wave Radar', 'Digital Weather Radiosonde', 'Dynamic Weather Record', 'A', 1);
  insertQuestion.run(uuidv4(), assessment1Id, 'Which band is primarily used by IMD for DWR?', 'X-band', 'S-band', 'C-band', 'Ku-band', 'B', 2);
  insertQuestion.run(uuidv4(), assessment1Id, 'What is the maximum range of typical S-band radar?', '100 km', '250 km', '500 km', '1000 km', 'C', 3);
  insertQuestion.run(uuidv4(), assessment1Id, 'Z-R relationship is used to estimate?', 'Wind Speed', 'Rainfall Rate', 'Hail Size', 'Temperature', 'B', 4);
  insertQuestion.run(uuidv4(), assessment1Id, 'Bright band is associated with?', 'Hail', 'Melting layer', 'Clear air turbulence', 'Tornado', 'B', 5);

  // Announcements
  const insertAnnouncement = db.prepare('INSERT INTO announcements (id, title, content, created_by) VALUES (?, ?, ?, ?)');
  insertAnnouncement.run(uuidv4(), 'New Capacity Building Portal Launched', 'Welcome to the unified training portal for all MoES institutions.', adminId);
  insertAnnouncement.run(uuidv4(), 'Upcoming Workshop on WRF', 'A 3-day workshop on WRF modeling will be conducted next month at NCMRWF.', adminId);

  console.log('Seeding complete.');
};
