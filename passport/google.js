const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const users = require('../queries/users.js')

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
 async (accessToken, refreshToken, profile, cb) => {
    //User.findOrCreate({ googleId: profile.id }, function (err, user) {
      //return cb(err,user);
  //  });
    const email = profile.emails[0].value;
    let user = await users.findByEmail(email);
    const googleUser = {
      username: profile.displayName,
      email: email,
      google_id: profile.id,  
      img_url: profile.photos[0].value,
      role_id: 1
   };
    if(user){
      googleUser.role_id = user.role_id;
      user = await users.update(user.id,googleUser);
    } else {
      const admins = await users.findAdmins();
      if (admins.length === 0) {
        googleUser.role_id = 3;
      }
      user = await users.insert(googleUser);
    }
    return cb(null,user);
  }
));
