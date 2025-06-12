export function verifyUser(cookies, res, next) {
  const { id_user } = cookies;

  if (id_user == null) {
    console.log(id_user, 'is null or undefined');
    console.log('Redirecting to /login because id_user is missing');
    return res.redirect('/login');
  }

  next();
}

