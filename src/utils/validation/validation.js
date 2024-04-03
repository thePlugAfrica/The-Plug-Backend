import Joi from "joi";

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }
    if (!req.value) {
      req.value = {}; // create an empty object the request value doesn't exist yet
    }
    req.value["body"] = req.body;
    next();
  };
};

const signUpSchema = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required(),
  password: Joi.string().min(6).trim().required().messages({
    "string.pattern.base": `Password should be 6 characters and contain letters or numbers only`,
    "string.empty": `Password cannot be empty`,
    "any.required": `Password is required`,
  }),
  phoneNumber: Joi.string()
    .pattern(/^\+\d{1,3}\d{9,}$/) // Country code followed by at least 9 digits
    .optional(),
});

const schemas = {
  authSchema: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().min(10).max(10).required(),
  }),
};

const registerSchema = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required(),
  password: Joi.string().min(8).trim().required().messages({
    "string.pattern.base": `Password should be 8 characters and contain letters or numbers only`,
    "string.empty": `Password cannot be empty`,
    "any.required": `Password is required`,
  }),
  phoneNumber: Joi.string()
    .max(10)
    .pattern(/[6-9]{1}[0-9]{9}/)
    .optional(),
  role: Joi.string().valid("artisan", "user").default("artisan").optional(),
  countryCode: Joi.string().max(5).required(),
});

const otpSchema = Joi.object({
  otpCode: Joi.string().min(0).max(4).required(),
});

const updateArtisan = Joi.object({
  companyName: Joi.string().required(),
  profession: Joi.string().required(),
  yearOfExperience: Joi.number().required(),
  residentialAdd: Joi.string().required(),
  country: Joi.string().required(),
  state: Joi.string().required(),
  area: Joi.string().required(),
});

const validateService = Joi.object({
  serviceName: Joi.string().required(),
  price: Joi.number().positive().required(),
});

export {
  validateRequest,
  schemas,
  registerSchema,
  otpSchema,
  updateArtisan,
  validateService,
  signUpSchema,
};
