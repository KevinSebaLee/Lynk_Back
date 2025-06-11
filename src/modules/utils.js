export function verifyUser(req, res, next) {
  const { id_user } = req.session || {};

  if (id_user == null) {
    console.log('Redirecting to /login because id_user is missing');
    return res.redirect('/login');
  }

  next();
}

