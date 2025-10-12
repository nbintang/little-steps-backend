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

// Inisialisasi Prisma Client
const prisma = new PrismaClient();

// Konfigurasi jumlah data yang akan dibuat
const NUM_ADMINS = 2;
const NUM_PARENTS = 50;
const NUM_CATEGORIES = 20;
const NUM_CONTENTS = 70;
const NUM_QUIZZES = 100;
const NUM_FORUM_THREADS = 50;
const NUM_PROGRESS_RECORDS = 300;

// Fungsi utama untuk seeding
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
  // 2. Membuat Kategori
  // ----------------------------------------
  console.log(`📚 Membuat ${NUM_CATEGORIES} kategori...`);
  const categoryNames = [
    'Sains & Alam',
    'Sejarah Dunia',
    'Matematika Dasar',
    'Seni & Kreativitas',
    'Cerita Dongeng',
    'Geografi',
    'Bahasa & Sastra',
    'Teknologi',
    'Musik',
    'Olahraga',
  ];
  const categories = await Promise.all(
    categoryNames.slice(0, NUM_CATEGORIES).map((name) =>
      prisma.category.create({
        data: {
          name,
          slug: faker.helpers.slugify(name).toLowerCase(),
        },
      }),
    ),
  );
  console.log(`✅ ${categories.length} kategori berhasil dibuat.`);

  // ----------------------------------------
  // 3. Membuat Pengguna (Users)
  // ----------------------------------------
  console.log(`👤 Membuat ${NUM_ADMINS} admin dan ${NUM_PARENTS} orang tua...`);
  const adminUsers = await Promise.all(
    Array.from({ length: NUM_ADMINS }).map((_, i) =>
      prisma.user.create({
        data: {
          name: `Admin ${i + 1}`,
          email: `admin${i + 1}@example.com`,
          password: dummyPassword,
          role: UserRole.ADMINISTRATOR,
          verified: true,
          acceptedTerms: true,
          isRegistered: true,
        },
      }),
    ),
  );

  const parentUsers = [];
  for (let i = 0; i < NUM_PARENTS; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: dummyPassword,
        role: UserRole.PARENT,
        verified: true,
        acceptedTerms: true,
        provider: AuthProvider.LOCAL,
        isRegistered: true,
      },
    });
    parentUsers.push(user);
    process.stdout.write(`\r👤 Membuat orang tua ${i + 1}/${NUM_PARENTS}...`);
  }
  console.log(`\n✅ Orang tua berhasil dibuat.`);

  const allUsers = [...adminUsers, ...parentUsers];
  console.log(`✅ Total ${allUsers.length} pengguna berhasil dibuat.`);

  // ----------------------------------------
  // 4. Membuat Profil Pengguna
  // ----------------------------------------
  console.log('📄 Membuat profil untuk setiap pengguna...');
  const profilePromises = allUsers.map((user) =>
    prisma.profile.create({
      data: {
        userId: user.id,
        fullName: user.name,
        phone: faker.phone.number(),
        bio: faker.lorem.paragraph(),
        avatarUrl: faker.image.avatar(),
        birthDate: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
        latitude: parseFloat(faker.location.latitude().toFixed(6)),
        longitude: parseFloat(faker.location.longitude().toFixed(6)),
      },
    }),
  );
  await Promise.all(profilePromises);
  console.log('✅ Profil pengguna berhasil dibuat.');

  // ----------------------------------------
  // 5. Membuat Profil Anak
  // ----------------------------------------
  console.log('👶 Membuat profil anak...');
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
          avatarUrl: `https://api.multiavatar.com/${faker.string.uuid()}.svg`,
        },
      });
      childProfiles.push(child);
    }
  }
  console.log(`✅ ${childProfiles.length} profil anak berhasil dibuat.`);

  // ----------------------------------------
  // 6. Membuat Jadwal Kontrol Orang Tua
  // ----------------------------------------
  console.log('⏰ Membuat jadwal kontrol orang tua...');
  let scheduleCount = 0;
  for (const child of childProfiles) {
    for (const day of faker.helpers.arrayElements(Object.values(DayOfWeek), {
      min: 3,
      max: 7,
    })) {
      await prisma.parentalControlSchedule.create({
        data: {
          childId: child.id,
          day,
          startTime: faker.date.between({
            from: '2025-01-01T08:00:00Z',
            to: '2025-01-01T12:00:00Z',
          }),
          endTime: faker.date.between({
            from: '2025-01-01T13:00:00Z',
            to: '2025-01-01T20:00:00Z',
          }),
          timezone: faker.location.timeZone(),
        },
      });
      scheduleCount++;
    }
  }
  console.log(`✅ ${scheduleCount} jadwal berhasil dibuat.`);

  // ----------------------------------------
  // 7. Membuat Konten (Artikel & Cerita)
  // ----------------------------------------
  console.log(`✍️ Membuat ${NUM_CONTENTS} konten...`);
  const contentPromises = Array.from({ length: NUM_CONTENTS }).map(() => {
    const title = faker.lorem.sentence(5);
    const slug = `${faker.helpers.slugify(title).toLowerCase()}-${faker.string.alphanumeric(6)}`;
    const contentType = faker.helpers.arrayElement(Object.values(ContentType));
    if (ContentType.FICTION_STORY === contentType) {
      return prisma.content.create({
        data: {
          title,
          slug,
          type: contentType,
          contentJson: {
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
          excerpt: faker.lorem.sentences(2),
          coverImage: `https://i.pinimg.com/564x/f7/c8/12/f7c812c9b0296cd9f119e33a06d9a256.jpg`,
          status: faker.helpers.arrayElement(Object.values(ContentStatus)),
          createdBy: faker.helpers.arrayElement(adminUsers).id,
          categoryId: faker.helpers.arrayElement(categories).id,
          // PERBAIKAN: fractionDigits harus integer (bilangan bulat)
          rating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
        },
      });
    } else {
      return prisma.content.create({
        data: {
          title,
          slug,
          type: contentType,
          contentJson: {
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
          excerpt: faker.lorem.sentences(2),
          coverImage: `https://i.pinimg.com/736x/15/61/58/1561587aef2154176057c566903f1abe.jpg`,
          status: faker.helpers.arrayElement(Object.values(ContentStatus)),
          createdBy: faker.helpers.arrayElement(adminUsers).id,
          categoryId: faker.helpers.arrayElement(categories).id,
          // PERBAIKAN: fractionDigits harus integer (bilangan bulat)
          rating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
        },
      });
    }
  });
  await Promise.all(contentPromises);
  console.log(`✅ ${NUM_CONTENTS} konten berhasil dibuat.`);

  // ----------------------------------------
  // 8. Membuat Kuis, Pertanyaan, dan Jawaban
  // ----------------------------------------
  console.log(
    `🧠 Membuat ${NUM_QUIZZES} kuis dengan pertanyaan dan jawabannya...`,
  );
  const quizzes = [];
  for (let i = 0; i < NUM_QUIZZES; i++) {
    const quiz = await prisma.quiz.create({
      data: {
        title: `Kuis ${i + 1}: ${faker.lorem.words(3)}`,
        description: faker.lorem.sentence(),
        createdBy: faker.helpers.arrayElement(adminUsers).id,
        timeLimit: faker.number.int({ min: 10, max: 60 }),
        categoryId: faker.helpers.arrayElement(categories).id,
        // PERBAIKAN: fractionDigits harus integer (bilangan bulat)
        rating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
        questions: {
          create: Array.from({
            length: faker.number.int({ min: 5, max: 15 }),
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
                  content: [{ type: 'text', text: faker.lorem.paragraphs(30) }],
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
                  imageAnswer: faker.image.urlPicsumPhotos(),
                })),
                {
                  text: faker.lorem.word(),
                  isCorrect: true,
                },
              ].sort(() => Math.random() - 0.5),
            },
          })),
        },
      },
    });
    quizzes.push(quiz);
    process.stdout.write(`\r🧠 Membuat kuis ${i + 1}/${NUM_QUIZZES}...`);
  }
  console.log(`\n✅ ${quizzes.length} kuis berhasil dibuat.`);

  // ... sisa kode tidak perlu diubah ...

  // ----------------------------------------
  // 9. Membuat Progres Anak
  // ----------------------------------------
  console.log(`📊 Membuat ${NUM_PROGRESS_RECORDS} data progres anak...`);
  let progressCount = 0;
  for (let i = 0; i < NUM_PROGRESS_RECORDS; i++) {
    const randomChild = faker.helpers.arrayElement(childProfiles);
    const randomQuiz = faker.helpers.arrayElement(quizzes);
    try {
      await prisma.progress.create({
        data: {
          childId: randomChild.id,
          quizId: randomQuiz.id,
          score: faker.number.int({ min: 40, max: 100 }),
          completionPercent: 100,
          submittedAt: faker.date.recent({ days: 30 }),
          startedAt: faker.date.recent({ days: 31 }),
        },
      });
      progressCount++;
    } catch (e) {
      if (e.code !== 'P2002') throw e;
    }
  }
  console.log(`✅ ${progressCount} data progres berhasil dibuat.`);

  // ----------------------------------------
  // 10. Membuat Thread dan Post Forum
  // ----------------------------------------
  console.log(`💬 Membuat ${NUM_FORUM_THREADS} thread forum beserta post...`);
  let postCount = 0;
  for (let i = 0; i < NUM_FORUM_THREADS; i++) {
    const numPosts = faker.number.int({ min: 5, max: 20 });
    await prisma.forumThread.create({
      data: {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        createdBy: faker.helpers.arrayElement(parentUsers).id,
        categoryId: faker.helpers.arrayElement(categories).id,
        isEdited: faker.datatype.boolean(),
        posts: {
          create: Array.from({ length: numPosts }).map(() => {
            postCount++;
            return {
              content: faker.lorem.paragraphs({ min: 1, max: 3 }),
              isEdited: faker.datatype.boolean(),
              authorId: faker.helpers.arrayElement(parentUsers).id,
            };
          }),
        },
      },
    });
  }
  console.log(
    `✅ ${NUM_FORUM_THREADS} thread forum dan ${postCount} post berhasil dibuat.`,
  );

  console.log('🎉 Seeding berhasil diselesaikan!');
}

// Menjalankan fungsi utama dan menangani error
main()
  .catch(async (e) => {
    console.error('❌ Terjadi error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
