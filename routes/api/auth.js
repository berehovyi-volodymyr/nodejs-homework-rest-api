const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const Jimp = require("jimp");
const fs = require("fs/promises");
const path = require("path");
const { nanoid } = require("nanoid");
const { HttpError, sendEmail } = require("../../helpers");
const upload = require("../../middlewars/upload");
const authentificate = require("../../middlewars/authentificate");
require("dotenv").config();

const { SECRET_KEY, BASE_URL } = process.env;
const avatarsDir = path.join(__dirname, "../", "../", "public", "avatars");

const { User, schemas } = require("../../models/user");
const { required } = require("joi");

router.post("/register", async (req, res, next) => {
  try {
    const { error } = schemas.registerSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      throw HttpError(409, "Email in use");
    }
    const avatarURL = gravatar.url(email);
    const hashpassword = await bcrypt.hash(password, 10);
    const verificationToken = nanoid();

    const result = await User.create({
      ...req.body,
      password: hashpassword,
      avatarURL,
      verificationToken,
    });

    const verifiEmail = {
      to: email,
      from: "berehovyi.volodymyr@gmail.com",
      subject: "Verify Email",
      html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Click verify Email</a>`,
    };

    await sendEmail(verifiEmail);

    res.status(201).json({
      email: result.email,
      subscription: result.subscription,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/verify/:verificationToken", async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw HttpError(404, "User not found");
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: "",
  });

  res.json({
    message: "Verification successful",
  });
});

router.post("/verify", async (req, res, next) => {
  try {
    const { error } = schemas.emailSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw HttpError(404, "User not found");
    }

    const verifiEmail = {
      to: "dojofek509@saeoil.com",
      from: "berehovyi.volodymyr@gmail.com",
      subject: "Verify Email",
      html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${user.verificationToken}">Click verify Email</a>`,
    };

    await sendEmail(verifiEmail);

    res.json({
      message: "Verification email sent",
    });
  } catch (error) {
    next(error);
  }

  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { error } = schemas.loginSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw HttpError(401, "Email or password is wrong");
    }

    if (!user.verify) {
      throw HttpError(401, "User not found");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);

    if (!passwordCompare) {
      throw HttpError(401, "Email or password is wrong");
    }

    const payload = {
      id: user.id,
    };

    const token = jwt.sign(payload, SECRET_KEY, {
      expiresIn: "23h",
    });

    await User.findByIdAndUpdate(user._id, { token });
    res.json({
      token,
      user: {
        user: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/current", authentificate, async (req, res) => {
  const { email, subscription } = req.user;
  console.log(email);
  res.json({
    email,
    subscription,
  });
});

router.get("/logout", authentificate, async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });

  res.status(204).json({
    message: "Logout success",
  });
});

router.patch(
  "/avatars",
  authentificate,
  upload.single("avatar"),
  async (req, res) => {
    const { _id } = req.user;
    const { path: tempUpLoad, filename } = req.file;
    const avatarName = `${_id}_${filename}`;
    const result = path.join(avatarsDir, avatarName);
    Jimp.read(result, (err, avatar) => {
      if (err) throw err;
      avatar.resize(250, 250).write(result);
    });
    await fs.copyFile(tempUpLoad, result);
    const avatarURL = path.join("avatars", avatarName);
    await User.findByIdAndUpdate(_id, { avatarURL });

    res.json({ avatarURL });
  }
);

module.exports = router;
