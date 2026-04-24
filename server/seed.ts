import { storage } from "./storage";

export async function seedDatabase() {
  // In-memory or DB storage check is handled inside storage.ts methods usually, 
  // but for seeding we can just try to create a user if they don't exist.
  const admin = await storage.getUserByUsername("admin");
  if (admin) return; // Already seeded

  const newUser = await storage.createUser({
    username: "admin",
    email: "admin@secops.global",
    password: "password123",
    isAdmin: true
  } as any);

  console.log("Seeding massive content...");

  // --- ARENA TASKS ---
  const arenaTasks = [
    {
      challengeId: "sqli_login",
      title: "SQL Injection: Authentication Bypass",
      description: "Ваша задача — войти в систему под пользователем 'admin', используя SQL-инъекцию в форме входа. Найдите флаг в панели управления.",
      difficulty: "beginner"
    },
    {
      challengeId: "jwt_secret_brute",
      title: "Broken Authentication: JWT Secret",
      description: "Сервис использует слабый секретный ключ для подписи JWT токенов. Подделайте токен, чтобы получить права администратора.",
      difficulty: "intermediate"
    },
    {
      challengeId: "lfi_to_rce",
      title: "File Inclusion: Path Traversal",
      description: "Найдите уязвимость LFI в параметре 'page' и прочитайте содержимое /etc/passwd, а затем попробуйте добиться выполнения кода (RCE).",
      difficulty: "advanced"
    }
  ];

  for (const task of arenaTasks) {
    await storage.createArenaSession({
      userId: newUser.id,
      challengeId: task.challengeId,
      status: 'stopped' // Available for starting
    } as any);
  }

  // --- MASSIVE COURSES ---
  // In a real app, these would be in a 'courses' table, 
  // but here they are handled by useCourses hook or static JSON usually.
  // I will implement a global seed for progress tracking support.
  
  await storage.updateProgress(newUser.id, 1, "lesson_1", true);
  await storage.updateProgress(newUser.id, 1, "lesson_2", false);

  console.log("Seeding complete.");
}
