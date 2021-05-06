const Strat = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function init(passport, getUserByEmail, getUserById) 
{
  const auth = async (email, password, complete) => 
  {
    const user = getUserByEmail(email)
    if (user == null) 
    {
      return complete(null, false, { message: 'It appears there is no user with that email in our system' })
    }

    try 
    {
      if (await bcrypt.compare(password, user.password)) 
      {
        return complete(null, user)
      } 
      else 
      {
        return complete(null, false, { message: 'Insufficient information provided. Please try again' })
      }
    } 
    catch (e) 
    {
      return complete(e)
    }
  }

  passport.use(new Strat({ usernameField: 'email' }, auth))
  passport.serializeUser((user, complete) => complete(null, user.id))
  passport.deserializeUser((id, complete) => {
    return complete(null, getUserById(id))
  })
}

module.exports = init