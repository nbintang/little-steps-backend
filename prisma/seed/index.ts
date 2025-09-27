import {
  ContentStatus,
  ContentType,
  DayOfWeek,
  Language,
  PrismaClient,
} from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const dummyPassword = await argon2.hash('Password123');

  console.log('🌱 Starting seeding...');

  // Create Badges first
  console.log('📛 Creating badges...');
  const badges = await Promise.all([
    prisma.badge.create({
      data: {
        name: 'First Steps',
        description: 'Completed your first quiz',
        iconUrl: 'https://example.com/icons/first-steps.png',
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Quiz Master',
        description: 'Completed 10 quizzes',
        iconUrl: 'https://example.com/icons/quiz-master.png',
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Content Creator',
        description: 'Created your first content',
        iconUrl: 'https://example.com/icons/content-creator.png',
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Early Bird',
        description: 'Joined the platform early',
        iconUrl: 'https://example.com/icons/early-bird.png',
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Forum Helper',
        description: 'Made 50 helpful forum posts',
        iconUrl: 'https://example.com/icons/forum-helper.png',
      },
    }),
  ]);

  // Create Users with different roles
  console.log('👥 Creating users...');
  const users = [];

  // Create 1 Admin user
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: dummyPassword,
      provider: 'LOCAL',
      verified: true,
      role: 'ADMINISTRATOR',
      acceptedTerms: true,
      acceptedAt: new Date(),
      isRegistered: true,
      profile: {
        create: {
          fullName: 'Administrator',
          phone: '+62812345678901',
          bio: 'System administrator managing the platform',
          avatarUrl: faker.image.avatar(),
          birthDate: faker.date.birthdate({ min: 25, max: 45, mode: 'age' }),
          latitude: parseFloat(faker.location.latitude().toString()),
          longitude: parseFloat(faker.location.longitude().toString()),
        },
      },
    },
  });
  users.push(adminUser);

  // Create Parent users
  for (let i = 0; i < 8; i++) {
    const parentUser = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: dummyPassword,
        provider: i % 3 === 0 ? 'GOOGLE' : 'LOCAL',
        providerId: i % 3 === 0 ? faker.string.uuid() : null,
        role: 'PARENT',
        acceptedTerms: true,
        isRegistered: true,
        acceptedAt: new Date(),
        verified: true,
        profile: {
          create: {
            fullName: faker.person.fullName(),
            phone: faker.phone.number({ style: 'national' }),
            bio: faker.lorem.paragraph(),
            avatarUrl: faker.image.avatar(),
            birthDate: faker.date.birthdate({ min: 25, max: 45, mode: 'age' }),
            latitude: parseFloat(faker.location.latitude().toString()),
            longitude: parseFloat(faker.location.longitude().toString()),
          },
        },
      },
    });
    users.push(parentUser);
  }

  // Create Child Profiles for Parent users (skip admin)
  console.log('👶 Creating child profiles...');
  const childProfiles = [];
  const parentUsers = users.filter((user) => user.role === 'PARENT');

  for (const parent of parentUsers) {
    const childrenCount = faker.number.int({ min: 1, max: 3 });

    for (let i = 0; i < childrenCount; i++) {
      const childProfile = await prisma.childProfile.create({
        data: {
          parentId: parent.id,
          name: faker.person.firstName(),
          birthDate: faker.date.birthdate({ min: 3, max: 17, mode: 'age' }),
          avatarUrl: faker.image.avatar(),
        },
      });
      childProfiles.push(childProfile);
    }
  }

  // Create Parental Control Schedules
  console.log('📅 Creating parental control schedules...');
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  for (const child of childProfiles) {
    const scheduledDays = faker.helpers.arrayElements(
      days,
      faker.number.int({ min: 3, max: 7 }),
    );

    for (const day of scheduledDays) {
      await prisma.parentalControlSchedule.create({
        data: {
          childId: child.id,
          day: day as DayOfWeek,
          startTime: new Date(),
          endTime: new Date(),
          timezone: 'Asia/Jakarta',
        },
      });
    }
  }

  // Create Content
  console.log('📚 Creating content...');
  const contents = [];
  const contentTypes: ContentType[] = ['ARTICLE', 'FICTION_STORY'];
  const contentStatuses: ContentStatus[] = ['DRAFT', 'PUBLISHED'];
  const languages: Language[] = ['ID', 'EN'];
  for (let i = 0; i < 20; i++) {
    const contentType = faker.helpers.arrayElement(contentTypes);
    const randomUser = faker.helpers.arrayElement(users);
    const status = faker.helpers.arrayElement(contentStatuses);
    const language = faker.helpers.arrayElement(languages);

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

    const attachments =
      contentType === 'ARTICLE'
        ? [
            {
              type: 'PDF',
              url: faker.internet.url() + '/file.pdf',
              name: 'Attachment PDF',
            },
          ]
        : [
            {
              type: 'VIDEO',
              url: faker.internet.url() + '/video.mp4',
              name: 'Video Story',
            },
          ];

    const coverImage = faker.image.urlLoremFlickr({ category: 'nature' });

    const content = await prisma.content.create({
      data: {
        title: faker.lorem.sentence(),
        slug: faker.lorem.slug({ min: 3, max: 5 }),
        type: contentType,
        contentJson,
        excerpt: faker.lorem.sentences(2),
        coverImage,
        attachments,
        targetAgeMin: faker.number.int({ min: 3, max: 8 }),
        targetAgeMax: faker.number.int({ min: 12, max: 17 }),
        status,
        language,
        createdBy: randomUser.id,
        isPublished: faker.datatype.boolean(0.8),
        isDeleted: faker.datatype.boolean(0.1),
      },
    });

    contents.push(content);
  }
  // Create Quizzes
  console.log('🎯 Creating quizzes...');
  const quizzes = [];

  for (let i = 0; i < 10; i++) {
    const randomUser = faker.helpers.arrayElement(users);

    const quiz = await prisma.quiz.create({
      data: {
        title: `${faker.lorem.words(3)} Quiz`,
        description: faker.lorem.sentence(),
        targetAgeMin: faker.number.int({ min: 3, max: 8 }),
        targetAgeMax: faker.number.int({ min: 12, max: 17 }),
        createdBy: randomUser.id,
        isDeleted: faker.datatype.boolean(0.05),
      },
    });
    quizzes.push(quiz);
  }

  // Create Questions and Answers for Quizzes
  console.log('❓ Creating questions and answers...');
  for (const quiz of quizzes) {
    const questionCount = faker.number.int({ min: 5, max: 10 });

    for (let i = 0; i < questionCount; i++) {
      const question = await prisma.question.create({
        data: {
          quizId: quiz.id,
          text: faker.lorem.sentence() + '?',
          isDeleted: faker.datatype.boolean(0.05),
        },
      });

      // Create 4 answers per question (1 correct, 3 incorrect)
      const answers = [
        { text: faker.lorem.words(2), isCorrect: true },
        { text: faker.lorem.words(2), isCorrect: false },
        { text: faker.lorem.words(2), isCorrect: false },
        { text: faker.lorem.words(2), isCorrect: false },
      ];

      for (const answerData of answers) {
        await prisma.answer.create({
          data: {
            questionId: question.id,
            text: answerData.text,
            isCorrect: answerData.isCorrect,
            isDeleted: faker.datatype.boolean(0.02),
          },
        });
      }
    }
  }

  // Create Progress records
  console.log('📊 Creating progress records...');
  for (const child of childProfiles) {
    // Content progress
    const contentToProgress = faker.helpers.arrayElements(
      contents,
      faker.number.int({ min: 3, max: 8 }),
    );
    for (const content of contentToProgress) {
      await prisma.progress.create({
        data: {
          childId: child.id,
          contentId: content.id,
          completionPercent: faker.number.int({ min: 10, max: 100 }),
        },
      });
    }

    // Quiz progress
    const quizzesToProgress = faker.helpers.arrayElements(
      quizzes,
      faker.number.int({ min: 2, max: 5 }),
    );
    for (const quiz of quizzesToProgress) {
      await prisma.progress.create({
        data: {
          childId: child.id,
          quizId: quiz.id,
          score: faker.number.int({ min: 40, max: 100 }),
          completionPercent: 100,
        },
      });
    }
  }

  // Create Forum Threads
  console.log('💬 Creating forum threads...');
  const forumThreads = [];

  for (let i = 0; i < 15; i++) {
    const randomUser = faker.helpers.arrayElement(users);

    const thread = await prisma.forumThread.create({
      data: {
        title: faker.lorem.sentence(),
        createdBy: randomUser.id,
      },
    });
    forumThreads.push(thread);
  }

  // Create Forum Posts
  console.log('📝 Creating forum posts...');
  for (const thread of forumThreads) {
    const postCount = faker.number.int({ min: 2, max: 8 });

    for (let i = 0; i < postCount; i++) {
      const randomUser = faker.helpers.arrayElement(users);

      await prisma.forumPost.create({
        data: {
          threadId: thread.id,
          authorId: randomUser.id,
          content: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })),
        },
      });
    }
  }

  // Create User Badges
  console.log('🏆 Assigning badges to users...');
  for (const user of users) {
    const userBadges = faker.helpers.arrayElements(
      badges,
      faker.number.int({ min: 1, max: 3 }),
    );

    for (const badge of userBadges) {
      await prisma.userBadge.create({
        data: {
          userId: user.id,
          badgeId: badge.id,
          awardedAt: faker.date.recent({ days: 30 }),
        },
      });
    }
  }

  console.log('✅ Seeding completed successfully!');
  console.log(`Created:
  - ${users.length} users (1 admin, ${users.length - 1} parents)
  - ${childProfiles.length} child profiles
  - ${contents.length} contents
  - ${quizzes.length} quizzes
  - ${forumThreads.length} forum threads
  - ${badges.length} badges
  - Multiple questions, answers, progress records, forum posts, and user badges`);
}

main()
  .catch(async (e) => {
    console.error('❌ Seeding error:', e);
    await Promise.all([
      prisma.user.deleteMany(),
      prisma.quiz.deleteMany(),
      prisma.badge.deleteMany(),
      prisma.childProfile.deleteMany(),
      prisma.parentalControlSchedule.deleteMany(),
      prisma.forumThread.deleteMany(),
    ]);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
