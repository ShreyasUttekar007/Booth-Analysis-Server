const mongoose = require("mongoose");
const { Schema } = mongoose;
const AcData = require("../models/AcData"); 
const Booth = require("./MappingData");

const boothDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pc: {
      type: String,
      trim: true,
    },
    constituency: {
      type: String,
      required: [true, "Please select a Constituency"],
      trim: true,
    },
    booth: {
      type: String,
      required: [true, "Please select a Booth"],
      trim: true,
    },
    timeSlot: {
      type: String,
      required: [true, "Please select a timeSlot"],
      trim: true,
    },
    totalVotes: {
      type: String,
      trim: true,
    },
    polledVotes: {
      type: String,
      trim: true,
    },
    favVotes: {
      type: String,
      trim: true,
    },
    ubtVotes: {
      type: String,
      trim: true,
    },
    boothType: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Pre-save hook to fetch and set totalVotes from AcData model before saving
boothDataSchema.pre("save", async function (next) {
  try {
    const acData = await AcData.findOne({ booth: this.booth });
    if (acData && acData.totalVotes && acData.boothType) {
      this.totalVotes = acData.totalVotes;
      this.boothType = acData.boothType;
    }
    next();
  } catch (error) {
    next(error);
  }
});

boothDataSchema.pre("save", async function (next) {
  try {
    const pcData = await Booth.findOne({ booth: this.booth });
    if (pcData && pcData.pc) {
      this.pc = pcData.pc;
    }
    next();
  } catch (error) {
    next(error);
  }
});

const BoothData = mongoose.model("boothData", boothDataSchema);

module.exports = BoothData;
