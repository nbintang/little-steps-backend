import {
  PrismaClient,
  UserRole,
  AuthProvider,
  ChildGender,
  ContentType,
  ContentStatus,
  DayOfWeek,
  CategoryType,
} from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

// Konfigurasi
const NUM_ADMINS = 2;
const NUM_PARENTS = 20
const NUM_CONTENTS = 50;
const NUM_QUIZZES = 30;
const NUM_FORUM_THREADS = 40;
const NUM_PROGRESS_RECORDS = 100;

// Helper: Generate TipTap JSON Content
function generateTipTapContent(type: 'article' | 'story' = 'article') {
  const paragraphs = faker.number.int({ min: 5, max: 12 });
  const content: any[] = [];

  // Title
  content.push({
    type: 'heading',
    attrs: { level: 1 },
    content: [{ type: 'text', text: faker.lorem.sentence() }],
  });

  // Introduction paragraph
  content.push({
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: faker.lorem.paragraph(3),
      },
    ],
  });

  // Main content
  for (let i = 0; i < paragraphs; i++) {
    // Random heading
    if (faker.datatype.boolean() && i % 3 === 0) {
      content.push({
        type: 'heading',
        attrs: { level: faker.number.int({ min: 2, max: 3 }) },
        content: [{ type: 'text', text: faker.lorem.sentence() }],
      });
    }

    // Paragraph dengan formatting
    const paragraph: any = {
      type: 'paragraph',
      content: [],
    };

    const sentences = faker.number.int({ min: 2, max: 5 });
    for (let j = 0; j < sentences; j++) {
      const text = faker.lorem.sentence();
      const textNode: any = { type: 'text', text };

      // Random formatting
      if (faker.datatype.boolean(0.2)) {
        textNode.marks = [{ type: 'bold' }];
      } else if (faker.datatype.boolean(0.15)) {
        textNode.marks = [{ type: 'italic' }];
      } else if (faker.datatype.boolean(0.1)) {
        textNode.marks = [{ type: 'bold' }, { type: 'italic' }];
      }

      paragraph.content.push(textNode);
      paragraph.content.push({ type: 'text', text: ' ' });
    }

    content.push(paragraph);

    // Random bullet list
    if (faker.datatype.boolean(0.3) && i % 4 === 0) {
      const listItems = faker.number.int({ min: 3, max: 6 });
      const bulletList: any = {
        type: 'bulletList',
        content: [],
      };

      for (let k = 0; k < listItems; k++) {
        bulletList.content.push({
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: faker.lorem.sentence() }],
            },
          ],
        });
      }

      content.push(bulletList);
    }

    // Random blockquote
    if (faker.datatype.boolean(0.2) && i % 5 === 0) {
      content.push({
        type: 'blockquote',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: faker.lorem.paragraph(2) }],
          },
        ],
      });
    }

    // Random image
    if (faker.datatype.boolean(0.25) && i % 4 === 0) {
      content.push({
        type: 'image',
        attrs: {
          src: faker.image.url(),
          alt: faker.lorem.words(3),
          title: faker.lorem.words(2),
        },
      });
    }

    // Random code block for articles
    if (type === 'article' && faker.datatype.boolean(0.15) && i % 6 === 0) {
      content.push({
        type: 'codeBlock',
        attrs: { language: 'javascript' },
        content: [
          {
            type: 'text',
            text: `function example() {\n  return "${faker.lorem.words(3)}";\n}`,
          },
        ],
      });
    }

    // Random numbered list
    if (faker.datatype.boolean(0.2) && i % 5 === 0) {
      const listItems = faker.number.int({ min: 3, max: 5 });
      const orderedList: any = {
        type: 'orderedList',
        content: [],
      };

      for (let k = 0; k < listItems; k++) {
        orderedList.content.push({
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: faker.lorem.sentence() }],
            },
          ],
        });
      }

      content.push(orderedList);
    }
  }

  // Conclusion
  content.push({
    type: 'heading',
    attrs: { level: 2 },
    content: [{ type: 'text', text: 'Kesimpulan' }],
  });

  content.push({
    type: 'paragraph',
    content: [{ type: 'text', text: faker.lorem.paragraph(3) }],
  });

  return {
    type: 'doc',
    content,
  };
}

// Helper: Generate Question JSON
function generateQuestionJson(difficulty: 'easy' | 'medium' | 'hard') {
  const types = ['multiple_choice', 'true_false', 'fill_blank'];
  const type = faker.helpers.arrayElement(types);

  const base = {
    type,
    difficulty,
    points: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30,
    explanation: faker.lorem.paragraph(),
  };

  switch (type) {
    case 'multiple_choice':
      return {
        ...base,
        question: faker.lorem.sentence() + '?',
        hasImage: faker.datatype.boolean(0.3),
        imageUrl: faker.datatype.boolean(0.3) ? faker.image.url() : null,
      };
    case 'true_false':
      return {
        ...base,
        question: faker.lorem.sentence(),
      };
    case 'fill_blank':
      return {
        ...base,
        question: faker.lorem.sentence().replace(/\w+$/, '______'),
        caseSensitive: faker.datatype.boolean(),
      };
    default:
      return base;
  }
}

// Helper: Random image URL
function randomImageUrl(): string | null {
  return faker.datatype.boolean(0.4) ? faker.image.url() : null;
}

async function main() {
  console.log('🌱 Memulai proses seeding...');
  const dummyPassword = await argon2.hash('Password123');

  // ----------------------------------------
  // 1. Membersihkan data lama
  // ----------------------------------------
  console.log('🧹 Membersihkan database...');
  await prisma.answer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.parentalControlSchedule.deleteMany();
  await prisma.forumPost.deleteMany();
  await prisma.forumThread.deleteMany();
  await prisma.content.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.category.deleteMany();
  await prisma.childProfile.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Database berhasil dibersihkan.');

  // ----------------------------------------
  // 2. Membuat Categories
  // ----------------------------------------
  console.log('📁 Membuat categories...');
  const parentCategories = [
    'Pendidikan Anak',
    'Kesehatan',
    'Perkembangan',
    'Nutrisi',
    'Psikologi',
  ];
  const childCategories = [
    'Matematika',
    'Bahasa Indonesia',
    'Sains',
    'Seni',
    'Olahraga',
  ];

  const categories = [];

  for (const name of parentCategories) {
    const category = await prisma.category.create({
      data: {
        name,
        slug: faker.helpers.slugify(name).toLowerCase(),
        type: CategoryType.PARENT,
      },
    });
    categories.push(category);
  }

  for (const name of childCategories) {
    const category = await prisma.category.create({
      data: {
        name,
        slug: faker.helpers.slugify(name).toLowerCase(),
        type: CategoryType.CHILD,
      },
    });
    categories.push(category);
  }

  console.log(`✅ ${categories.length} categories berhasil dibuat.`);

  // ----------------------------------------
  // 3. Membuat Admins
  // ----------------------------------------
  console.log('👤 Membuat admin users...');
  const admins = [];

  for (let i = 0; i < NUM_ADMINS; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    const admin = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        password: dummyPassword,
        provider: AuthProvider.LOCAL,
        role: UserRole.ADMINISTRATOR,
        verified: true,
        acceptedTerms: true,
        isRegistered: true,
        acceptedAt: faker.date.past({ years: 1 }),
        profile: {
          create: {
            fullName: `${firstName} ${lastName}`,
            phone: faker.phone.number(),
            bio: faker.person.bio(),
            avatarUrl: faker.image.avatar(),
            birthDate: faker.date.birthdate({ min: 25, max: 50, mode: 'age' }),
            latitude: faker.location.latitude(),
            longitude: faker.location.longitude(),
          },
        },
      },
    });
    admins.push(admin);
  }

  console.log(`✅ ${admins.length} admins berhasil dibuat.`);

  // ----------------------------------------
  // 4. Membuat Parents dengan Child Profiles
  // ----------------------------------------
  console.log('👨‍👩‍👧‍👦 Membuat parent users dengan child profiles...');
  const parents = [];

  for (let i = 0; i < NUM_PARENTS; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    const parent = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        password: dummyPassword,
        provider: faker.helpers.arrayElement([
          AuthProvider.LOCAL,
          AuthProvider.GOOGLE,
        ]),
        providerId: faker.datatype.boolean(0.3) ? faker.string.uuid() : null,
        role: UserRole.PARENT,
        verified: true,
        acceptedTerms: true,
        isRegistered: true,
        acceptedAt: faker.date.past({ years: 2 }),
        profile: {
          create: {
            fullName: `${firstName} ${lastName}`,
            phone: faker.phone.number(),
            bio: faker.person.bio(),
            avatarUrl: faker.image.avatar(),
            birthDate: faker.date.birthdate({ min: 25, max: 50, mode: 'age' }),
            latitude: faker.location.latitude(),
            longitude: faker.location.longitude(),
          },
        },
      },
    });
    parents.push(parent);

    // Membuat 1-3 child profiles per parent
    const numChildren = faker.number.int({ min: 1, max: 3 });
    for (let j = 0; j < numChildren; j++) {
      const childName = faker.person.firstName();
      const gender = faker.helpers.arrayElement([
        ChildGender.MALE,
        ChildGender.FEMALE,
      ]);

      const child = await prisma.childProfile.create({
        data: {
          parentId: parent.id,
          name: childName,
          birthDate: faker.date.birthdate({ min: 3, max: 15, mode: 'age' }),
          avatarUrl: faker.image.avatar(),
          gender,
        },
      });

      // Membuat parental control schedules (3-5 schedules per child)
      const days = Object.values(DayOfWeek);
      const numSchedules = faker.number.int({ min: 3, max: 5 });
      const selectedDays = faker.helpers.arrayElements(days, numSchedules);

      for (const day of selectedDays) {
        const startHour = faker.number.int({ min: 6, max: 12 });
        const endHour = faker.number.int({ min: startHour + 2, max: 22 });

        await prisma.parentalControlSchedule.create({
          data: {
            childId: child.id,
            day,
            startTime: new Date(
              `1970-01-01T${startHour.toString().padStart(2, '0')}:00:00`,
            ),
            endTime: new Date(
              `1970-01-01T${endHour.toString().padStart(2, '0')}:00:00`,
            ),
            timezone: 'Asia/Jakarta',
          },
        });
      }
    }
  }

  console.log(
    `✅ ${parents.length} parents dengan child profiles berhasil dibuat.`,
  );

  // ----------------------------------------
  // 5. Membuat Contents (Articles & Stories)
  // ----------------------------------------
  console.log('📝 Membuat contents...');
  const allUsers = [...admins, ...parents];
  const contents = [];

  for (let i = 0; i < NUM_CONTENTS; i++) {
    const contentType = faker.helpers.arrayElement([
      ContentType.ARTICLE,
      ContentType.FICTION_STORY,
    ]);
    const status = faker.helpers.weightedArrayElement([
      { weight: 8, value: ContentStatus.PUBLISHED },
      { weight: 2, value: ContentStatus.DRAFT },
    ]);
    const title = faker.lorem.sentence();

    const content = await prisma.content.create({
      data: {
        title,
        type: contentType,
        createdBy: faker.helpers.arrayElement(allUsers).id,
        contentJson: generateTipTapContent(
          contentType === ContentType.ARTICLE ? 'article' : 'story',
        ),
        excerpt: faker.lorem.paragraph().substring(0, 300),
        status,
        slug:
          faker.helpers.slugify(title).toLowerCase() +
          '-' +
          faker.string.alphanumeric(6),
        coverImage: faker.image.url(),
        isEdited: faker.datatype.boolean(0.3),
        categoryId: faker.helpers.arrayElement(
          categories.filter((c) => c.type === CategoryType.PARENT),
        ).id,
        rating: faker.number.float({ min: 3.5, max: 5, fractionDigits: 1 }),
      },
    });
    contents.push(content);
  }

  console.log(`✅ ${contents.length} contents berhasil dibuat.`);

  // ----------------------------------------
  // 6. Membuat Quizzes dengan Questions & Answers
  // ----------------------------------------
  console.log('📚 Membuat quizzes dengan questions dan answers...');
  const quizzes = [];

  for (let i = 0; i < NUM_QUIZZES; i++) {
    const quiz = await prisma.quiz.create({
      data: {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        createdBy: faker.helpers.arrayElement(allUsers).id,
        timeLimit: faker.number.int({ min: 10, max: 60 }),
        categoryId: faker.helpers.arrayElement(
          categories.filter((c) => c.type === CategoryType.CHILD),
        ).id,
        rating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
      },
    });
    quizzes.push(quiz);

    // Membuat 5-15 questions per quiz
    const numQuestions = faker.number.int({ min: 5, max: 15 });
    for (let j = 0; j < numQuestions; j++) {
      const difficulty = faker.helpers.arrayElement(['easy', 'medium', 'hard']);
      const questionJson = generateQuestionJson(difficulty as any);

      const question = await prisma.question.create({
        data: {
          quizId: quiz.id,
          questionJson,
        },
      });

      // Membuat answers berdasarkan tipe question
      const questionType = questionJson.type;

      if (questionType === 'multiple_choice') {
        // 4 pilihan jawaban
        const numAnswers = 4;
        const correctIndex = faker.number.int({ min: 0, max: 3 });

        for (let k = 0; k < numAnswers; k++) {
          await prisma.answer.create({
            data: {
              questionId: question.id,
              text: faker.lorem.sentence(),
              isCorrect: k === correctIndex,
              imageAnswer: randomImageUrl(),
            },
          });
        }
      } else if (questionType === 'true_false') {
        // 2 pilihan: true/false
        const correctAnswer = faker.datatype.boolean();
        await prisma.answer.create({
          data: {
            questionId: question.id,
            text: 'Benar',
            isCorrect: correctAnswer,
            imageAnswer: randomImageUrl(),
          },
        });
        await prisma.answer.create({
          data: {
            questionId: question.id,
            text: 'Salah',
            isCorrect: !correctAnswer,
            imageAnswer: randomImageUrl(),
          },
        });
      } else if (questionType === 'fill_blank') {
        // 1 jawaban benar
        await prisma.answer.create({
          data: {
            questionId: question.id,
            text: faker.lorem.word(),
            isCorrect: true,
            imageAnswer: randomImageUrl(),
          },
        });
      }
    }
  }

  console.log(
    `✅ ${quizzes.length} quizzes dengan questions dan answers berhasil dibuat.`,
  );

  // ----------------------------------------
  // 7. Membuat Progress Records
  // ----------------------------------------
  console.log('📊 Membuat progress records...');
  const allChildren = await prisma.childProfile.findMany();

  for (let i = 0; i < NUM_PROGRESS_RECORDS; i++) {
    const child = faker.helpers.arrayElement(allChildren);
    const quiz = faker.helpers.arrayElement(quizzes);

    // Check if progress already exists
    const existing = await prisma.progress.findUnique({
      where: {
        quizId_childId: {
          quizId: quiz.id,
          childId: child.id,
        },
      },
    });

    if (!existing) {
      const isCompleted = faker.datatype.boolean(0.7);
      await prisma.progress.create({
        data: {
          childId: child.id,
          quizId: quiz.id,
          score: isCompleted ? faker.number.int({ min: 40, max: 100 }) : null,
          completionPercent: isCompleted
            ? 100
            : faker.number.int({ min: 10, max: 90 }),
          startedAt: faker.date.past({ years: 1 }),
          submittedAt: isCompleted ? faker.date.recent({ days: 30 }) : null,
        },
      });
    }
  }

  console.log(`✅ Progress records berhasil dibuat.`);

  // ----------------------------------------
  // 8. Membuat Forum Threads dengan Posts
  // ----------------------------------------
  console.log('💬 Membuat forum threads dengan posts...');

  for (let i = 0; i < NUM_FORUM_THREADS; i++) {
    const thread = await prisma.forumThread.create({
      data: {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        createdBy: faker.helpers.arrayElement(parents).id,
        categoryId: faker.helpers.arrayElement(
          categories.filter((c) => c.type === CategoryType.PARENT),
        ).id,
        isEdited: faker.datatype.boolean(0.2),
      },
    });

    // Membuat 3-20 posts per thread
    const numPosts = faker.number.int({ min: 3, max: 20 });
    for (let j = 0; j < numPosts; j++) {
      await prisma.forumPost.create({
        data: {
          threadId: thread.id,
          authorId: faker.helpers.arrayElement(parents).id,
          content: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })),
          isEdited: faker.datatype.boolean(0.15),
          createdAt: faker.date.past({ years: 1 }),
        },
      });
    }
  }

  console.log(
    `✅ ${NUM_FORUM_THREADS} forum threads dengan posts berhasil dibuat.`,
  );

  // ----------------------------------------
  // Summary
  // ----------------------------------------
  console.log('\n🎉 Seeding selesai!');
  console.log('===============================');
  console.log(`👤 Admins: ${admins.length}`);
  console.log(`👨‍👩‍👧‍👦 Parents: ${parents.length}`);
  console.log(`👶 Children: ${allChildren.length}`);
  console.log(`📁 Categories: ${categories.length}`);
  console.log(`📝 Contents: ${contents.length}`);
  console.log(`📚 Quizzes: ${quizzes.length}`);
  console.log(`💬 Forum Threads: ${NUM_FORUM_THREADS}`);
  console.log('===============================');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
