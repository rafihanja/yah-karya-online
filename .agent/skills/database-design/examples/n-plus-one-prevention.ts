// @ts-nocheck
/**
 * Contoh: Mencegah Dosa N+1 Query (Di ORM seperti Prisma/TypeORM)
 * Aturan Elite: JANGAN PERNAH melakukan query di dalam loop.
 */

// ❌ DOSA BESAR (Anti-Pattern: N+1)
export const getBadUsersAndPosts = async () => {
  // 1 query untuk mengambil 100 user
  const users = await db.query("SELECT * FROM users LIMIT 100");
  
  for (const user of users) {
    // 100 query tambahan akan ditembak ke database! (1 + 100 = N+1)
    // Ini akan mencekik koneksi database Anda.
    user.posts = await db.query(`SELECT * FROM posts WHERE user_id = ${user.id}`);
  }
  
  return users;
};

// ✅ ELITE PATTERN (Eager Loading / IN Clause)
export const getEliteUsersAndPosts = async () => {
  // 1 query pertama
  const users = await db.query("SELECT id, name FROM users LIMIT 100");
  
  // Ekstrak ID saja ke dalam array: [1, 2, 3, ..., 100]
  const userIds = users.map(u => u.id);

  // 1 query kedua, mengambil SEMUA post milik 100 user sekaligus
  const posts = await db.query(`SELECT id, title, user_id FROM posts WHERE user_id IN (${userIds.join(',')})`);

  // Gabungkan di memori aplikasi (Node.js/Server), bukan di Database
  const postsByUserId = posts.reduce((acc, post) => {
    if (!acc[post.user_id]) acc[post.user_id] = [];
    acc[post.user_id].push(post);
    return acc;
  }, {});

  return users.map(u => ({
    ...u,
    posts: postsByUserId[u.id] || []
  }));
};
