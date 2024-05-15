const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
    },
    roles: {
      type: [
        {
          type: String,
          enum: [
            "admin",
            "mod",
            "user",
            "120-Sinnar",
            "123-Nashik East",
            "124-Nashik (Central)",
            "125-Nashik West",
            "126-Deolali (SC)",
            "127-Igatpuri (ST)",
            "140- Ambarnath (SC)",
            "141-Ulhasnagar",
            "142-Kalyan East",
            "143-Dombivali",
            "144-Kalyan Rural",
            "145-Meera Bhayandar",
            "146-Ovala Majiwada",
            "147-Kopri-Pachpakhadi",
            "148-Thane",
            "149-Mumbra Kalwa",
            "150-Airoli",
            "151-Belapur",
            "158-Jogeshwari East",
            "159-Dindoshi",
            "163-Goregaon",
            "164-Varsova",
            "165-Andheri West",
            "166-Andheri East",
            "172-Anushakti Nagar",
            "173-Chembur",
            "178-Dharavi (SC)",
            "179-Sion Koliwada",
            "180-Wadala",
            "181-Mahim",
            "182-Worli",
            "183-Shivadi",
            "184-Byculla",
            "185-Malabar Hill",
            "186-Mumbadevi",
            "187-Colaba",
          ],
        },
      ],
      default: ["user"],
    },
  },
  { timestamps: true }
);
UserSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});
UserSchema.methods.comparePassword = function (candidatePassword, next) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return next(err);
    next(null, isMatch);
  });
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
