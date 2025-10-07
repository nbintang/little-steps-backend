import {
  PrismaClient,
  UserRole,
  AuthProvider,
  ChildGender,
  ContentType,
  ContentStatus,
  DayOfWeek,
} from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as argon2 from 'argon2';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Main seeding function
async function main() {
  const dummyPassword = await argon2.hash('Password123');

  console.log('🌱 Starting seeding...');

  // ----------------------------------------
  // Clean up existing data
  // ----------------------------------------
  console.log('🧹 Clearing the database...');
  await prisma.answer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.content.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.category.deleteMany();
  await prisma.forumPost.deleteMany();
  await prisma.forumThread.deleteMany();
  await prisma.parentalControlSchedule.deleteMany();
  await prisma.childProfile.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // ----------------------------------------
  // Create Users
  // ----------------------------------------
  console.log('👤 Creating users...');
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: dummyPassword,
      role: UserRole.ADMINISTRATOR,
      verified: true,
      acceptedTerms: true,
    },
  });

  const parentUsers = await Promise.all(
    Array.from({ length: 5 }).map(() =>
      prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: dummyPassword,
          role: UserRole.PARENT,
          verified: true,
          acceptedTerms: true,
          provider: AuthProvider.LOCAL,
        },
      }),
    ),
  );
  const allUsers = [adminUser, ...parentUsers];
  console.log(`👤 Created ${allUsers.length} users.`);

  // ----------------------------------------
  // Create Profiles for Users
  // ----------------------------------------
  console.log('📄 Creating user profiles...');
  await Promise.all(
    allUsers.map((user) =>
      prisma.profile.create({
        data: {
          userId: user.id,
          fullName: user.name,
          phone: faker.phone.number(),
          bio: faker.lorem.paragraph(),
          avatarUrl: faker.image.avatar(),
          birthDate: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
        },
      }),
    ),
  );
  console.log('📄 User profiles created.');

  // ----------------------------------------
  // Create Child Profiles
  // ----------------------------------------
  console.log('👶 Creating child profiles...');
  const childProfiles = [];
  for (const parent of parentUsers) {
    const numChildren = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < numChildren; i++) {
      const child = await prisma.childProfile.create({
        data: {
          parentId: parent.id,
          name: faker.person.firstName(),
          birthDate: faker.date.birthdate({ min: 5, max: 15, mode: 'age' }),
          gender: faker.helpers.arrayElement([
            ChildGender.MALE,
            ChildGender.FEMALE,
          ]),
          avatarUrl: faker.image.avatar(),
        },
      });
      childProfiles.push(child);
    }
  }
  console.log(`👶 Created ${childProfiles.length} child profiles.`);

  // ----------------------------------------
  // Create Parental Control Schedules
  // ----------------------------------------
  console.log('⏰ Creating parental control schedules...');
  const days = [
    DayOfWeek.MON,
    DayOfWeek.TUE,
    DayOfWeek.WED,
    DayOfWeek.THU,
    DayOfWeek.FRI,
    DayOfWeek.SAT,
    DayOfWeek.SUN,
  ];
  for (const child of childProfiles) {
    for (const day of faker.helpers.arrayElements(days, { min: 3, max: 7 })) {
      await prisma.parentalControlSchedule.create({
        data: {
          childId: child.id,
          day: day,
          startTime: faker.date.between({
            from: '2024-01-01T08:00:00Z',
            to: '2024-01-01T12:00:00Z',
          }),
          endTime: faker.date.between({
            from: '2024-01-01T13:00:00Z',
            to: '2024-01-01T20:00:00Z',
          }),
          timezone: faker.location.timeZone(),
        },
      });
    }
  }
  console.log('⏰ Parental control schedules created.');

  // ----------------------------------------
  // Create Categories
  // ----------------------------------------
  console.log('📚 Creating categories...');
  const categoryNames = [
    'Science',
    'History',
    'Mathematics',
    'Art',
    'Literature',
  ];
  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.create({
        data: {
          name,
          slug: faker.helpers.slugify(name).toLowerCase(),
        },
      }),
    ),
  );
  console.log(`📚 Created ${categories.length} categories.`);

  // Create Content
  console.log('📚 Creating content...');
  const contents = [];
  const contentTypes: ContentType[] = ['ARTICLE', 'FICTION_STORY'];
  const contentStatuses: ContentStatus[] = ['DRAFT', 'PUBLISHED'];
  for (let i = 0; i < 20; i++) {
    const contentType = faker.helpers.arrayElement(contentTypes);
    const randomUser = faker.helpers.arrayElement(allUsers);
    const status = faker.helpers.arrayElement(contentStatuses);

    const contentJson =
      contentType === 'ARTICLE'
        ? {
            type: 'doc',
            content: [
              {
                type: 'heading',
                attrs: { level: 1 },
                content: [{ type: 'text', text: faker.lorem.sentence() }],
              },
              {
                type: 'paragraph',
                content: [{ type: 'text', text: faker.lorem.paragraphs(2) }],
              },
              {
                type: 'paragraph',
                content: [{ type: 'text', text: faker.lorem.paragraph() }],
              },
            ],
          }
        : null;

    const coverImage = faker.image.urlLoremFlickr({ category: 'nature' });

    const content = await prisma.content.create({
      data: {
        title: faker.lorem.sentence(),
        slug: faker.lorem.slug({ min: 3, max: 5 }),
        type: contentType,
        contentJson,
        excerpt: faker.lorem.sentences(2),
        coverImage,
        status,
        createdBy: randomUser.id,
      },
    });

    contents.push(content);
  }
  // ----------------------------------------
  // Create Quizzes, Questions, and Answers
  // ----------------------------------------
  console.log('🧠 Creating quizzes, questions, and answers...');
  const quizzes = [];
  for (let i = 0; i < 15; i++) {
    const quiz = await prisma.quiz.create({
      data: {
        title: `Quiz: ${faker.lorem.words(3)}`,
        description: faker.lorem.sentence(),
        createdBy: faker.helpers.arrayElement(allUsers).id,
        timeLimit: faker.number.int({ min: 10, max: 60 }),
        categoryId: faker.helpers.arrayElement(categories).id,
        questions: {
          create: Array.from({
            length: faker.number.int({ min: 5, max: 10 }),
          }).map(() => ({
            questionJson: {
              type: 'doc',
              content: [
                {
                  type: 'heading',
                  attrs: { level: 1 },
                  content: [{ type: 'text', text: faker.lorem.sentence() }],
                },
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: faker.lorem.paragraphs(2) }],
                },
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: faker.lorem.paragraph() }],
                },
              ],
            },
            answers: {
              create: [
                ...Array.from({ length: 3 }).map(() => ({
                  text: faker.lorem.word(),
                  isCorrect: false,
                })),
                {
                  text: faker.lorem.word(),
                  isCorrect: true, // The correct answer
                },
              ].sort(() => Math.random() - 0.5), // Shuffle answers
            },
          })),
        },
      },
    });
    quizzes.push(quiz);
  }
  console.log(
    `🧠 Created ${quizzes.length} quizzes with questions and answers.`,
  );

  // ----------------------------------------
  // Create Progress
  // ----------------------------------------
  console.log('📊 Creating progress records...');
  for (const child of childProfiles) {
    const quizzesToAttempt = faker.helpers.arrayElements(quizzes, {
      min: 1,
      max: 5,
    });
    for (const quiz of quizzesToAttempt) {
      await prisma.progress.create({
        data: {
          childId: child.id,
          quizId: quiz.id,
          score: faker.number.int({ min: 50, max: 100 }),
          completionPercent: 100,
          submittedAt: faker.date.recent(),
        },
      });
    }
  }
  console.log('📊 Progress records created.');

  // ----------------------------------------
  // Create Forum Threads and Posts
  // ----------------------------------------
  console.log('💬 Creating forum threads and posts...');
  for (let i = 0; i < 10; i++) {
    await prisma.forumThread.create({
      data: {
        title: faker.lorem.sentence(),
        createdBy: faker.helpers.arrayElement(parentUsers).id,
        posts: {
          create: Array.from({
            length: faker.number.int({ min: 3, max: 15 }),
          }).map(() => ({
            content: faker.lorem.paragraphs(
              faker.number.int({ min: 1, max: 3 }),
            ),
            authorId: faker.helpers.arrayElement(parentUsers).id,
          })),
        },
      },
    });
  }
  console.log('💬 Forum threads and posts created.');

  console.log('✅ Seeding finished successfully!');
}

// Execute the main function and handle errors
main()
  .catch(async (e) => {
    console.error('❌ Seeding error:', e);
    // You can add a more robust cleanup here if needed
    process.exit(1);
  })
  .finally(async () => {
    // Disconnect Prisma Client
    await prisma.$disconnect();
  });
