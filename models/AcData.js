const mongoose = require("mongoose");
const { Schema } = mongoose;

const boothIncharge = new Schema(
    {
      name: {
        type: String,
        trim: true,
      },
      contact: {
        type: String,
        trim: true,
      },
    },
    { _id: false }
  );
  

const acSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    totalVotes: {
      type: String,
      trim: true,
    },
    acInchargeName: {
      type: String,
      trim: true,
    },
    boothType: {
      type: String,
      trim: true,
    },
    acInchargeContact: {
      type: String,
      trim: true,
    },
    boothInchargeName: [boothIncharge],
  },
  { timestamps: true }
);

const AcData = mongoose.model("acData", acSchema);

module.exports = AcData;
