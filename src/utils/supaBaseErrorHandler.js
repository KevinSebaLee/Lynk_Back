export async function safeQuery(queryPromise) {
  const { data, error } = await queryPromise;
  if (error) {
    throw { userMessage: 'Database error', message: error.message };
  }
  return data;
}