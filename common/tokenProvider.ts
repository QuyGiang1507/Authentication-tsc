import jwt, { JwtPayload } from 'jsonwebtoken';

const sign = (username : string) => {
  const identityData : JwtPayload = {
    username,
  }
  const token = jwt.sign(identityData, process.env.PRIVATE_KEY!, {
    expiresIn: process.env.EXPIRE_TIME || "2 days"
  })

  return token;
}

const verify = (token : string) : JwtPayload => {
  return jwt.verify(token, process.env.PRIVATE_KEY!) as JwtPayload
}

export {
  sign,
  verify
};