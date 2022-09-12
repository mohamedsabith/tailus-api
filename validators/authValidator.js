import Joi from "joi";

const signUpvalidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().required().min(3).lowercase().label("Username"),
    fullname: Joi.string().required().label("Full name"),
    email: Joi.string().email().required().label("Email"),
    phoneNumber: Joi.number().required().label("Phone number"),
    password: Joi.string().required().min(8).max(20).label("Password"),
    confirmPassword: Joi.any()
      .equal(Joi.ref("password"))
      .required()
      .label("Confirm password")
      .messages({ "any.only": "{{#label}} does not match" }),
  });

  return schema.validate(data);
};

const signInValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().min(8).max(200).label("Password"),
    userIp: Joi.string(),
  });

  return schema.validate(data);
};

const forgotPasswordValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
  });

  return schema.validate(data);
};

const resetPasswordValidation = (data) => {
  const schema = Joi.object({
    password: Joi.string().required().min(8).max(20).label("Password"),
    confirmPassword: Joi.any()
      .equal(Joi.ref("password"))
      .required()
      .label("Confirm password")
      .messages({ "any.only": "{{#label}} does not match" }),
  });

  return schema.validate(data);
};

export {
  signUpvalidation,
  signInValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
};
