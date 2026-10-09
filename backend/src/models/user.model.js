const mongoose = require("mongoose")
const bcrypt = require("bcrypt")


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"]
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"]
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"]
    },
    systemUser:{
      type:Boolean,
      default:false,
      immutable:true,
      select:false
    }
  },
  {
    timestamps: true
  }
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return 
  }

  this.password = await bcrypt.hash(this.password, 10)
  return 
})

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password)
}

const UserModel = mongoose.models.User || mongoose.models.user || mongoose.model("User", userSchema);
if (!mongoose.models.user) {
  try { mongoose.model("user", userSchema); } catch (e) {}
}

module.exports = UserModel;