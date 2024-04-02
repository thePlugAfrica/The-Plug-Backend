import jwt from "jsonwebtoken";



const createJwtToken = (payload) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2day",
    });
    return token;
  };
  
  const verifyJwtToken = (token, next) => {
    try {
      const { artisanId } = jwt.verify(token, process.env.JWT_SECRET);
      return artisanId;
    } catch (err) {
      next(err);
    }
  };


  export {createJwtToken,verifyJwtToken};