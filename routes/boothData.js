const express = require("express");
const router = express.Router();
const Booth = require("../models/BoothData");
const BoothMapping = require("../models/MappingData");
const Acs = require("../models/AcData");

router.use(express.json());

router.get("/get-ac-names", async (req, res) => {
  try {
    const acs = await BoothMapping.distinct("constituency").sort();
    if (acs.length === 0) {
      return res.status(404).json({ error: "No ACs found" });
    }
    res.json(acs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get PC names
router.get("/get-pc-names", async (req, res) => {
  try {
    const pcs = await BoothMapping.distinct("pc").sort();
    if (pcs.length === 0) {
      return res.status(404).json({ error: "No PCs found" });
    }
    res.json(pcs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/get-pc-total", async (req, res) => {
  try {
    const pcs = await BoothMapping.distinct("pc").sort();
    const totalCount = pcs.length;
    if (totalCount === 0) {
      return res.status(404).json({ error: "No PCs found" });
    }
    res.json({ totalCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/get-ac-total", async (req, res) => {
  try {
    const acs = await BoothMapping.distinct("constituency").sort();
    const totalCount = acs.length;
    if (totalCount === 0) {
      return res.status(404).json({ error: "No ACs found" });
    }
    res.json({ totalCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/get-booth-total", async (req, res) => {
  try {
    const booths = await BoothMapping.distinct("booth").sort();
    const totalCount = booths.length;
    if (totalCount === 0) {
      return res.status(404).json({ error: "No booths found" });
    }
    res.json({ totalCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/total-votes", async (req, res) => {
  try {
    const result = await Acs.aggregate([
      {
        $group: {
          _id: null,
          totalVotes: { $sum: { $toInt: "$totalVotes" } },
        },
      },
    ]);

    const totalCount = result.length > 0 ? result[0].totalVotes : 0;

    res.json({ totalCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/total-votes-by-booth-type", async (req, res) => {
  try {
    const result = await Booth.aggregate([
      {
        $group: {
          _id: "$boothType",
          totalVotes: { $sum: { $toInt: "$totalVotes" } },
          totalPolledVotes: { $sum: { $toInt: "$polledVotes" } }, // Calculate total polled votes
        },
      },
      {
        $addFields: {
          polledVotesPercentage: {
            $multiply: [
              { $divide: ["$totalPolledVotes", "$totalVotes"] }, // Calculate percentage
              100,
            ],
          },
        },
      },
      {
        $sort: {
          _id: 1, // Sort by boothType in ascending order
        },
      },
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/get-all-pcs-data", async (req, res) => {
  try {
    // Aggregate to group data by PC and gather unique ACs
    const pcData = await Booth.aggregate([
      {
        $group: {
          _id: "$pc",
          acs: { $addToSet: "$constituency" }
        }
      }
    ]);

    if (!pcData || pcData.length === 0) {
      return res.status(404).json({ error: "No PCs found" });
    }

    // Retrieve data for each PC and its associated ACs
    for (const pc of pcData) {
      // Limit the number of ACs per PC as needed
      pc.acs = pc.acs.slice(0, 6); // Limit to 6 ACs
      // Retrieve data for each AC
      pc.data = [];
      for (const ac of pc.acs) {
        const acData = await Booth.findOne({ pc: pc._id, constituency: ac });
        if (acData) {
          pc.data.push({
            constituency: ac,
            totalVotes: acData.totalVotes,
            polledVotes: acData.polledVotes,
            favVotes: acData.favVotes,
            ubtVotes: acData.ubtVotes
          });
        }
      }
    }

    res.json(pcData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




router.get("/votes-by-fav-ubt-other-percentage", async (req, res) => {
  try {
    const result = await Booth.aggregate([
      {
        $group: {
          _id: "$boothType",
          totalVotes: { $sum: { $toInt: "$totalVotes" } },
          totalPolledVotes: { $sum: { $toInt: "$polledVotes" } },
          totalFavVotes: { $sum: { $toInt: "$favVotes" } }, // Calculate total favorite votes
          totalUbtVotes: { $sum: { $toInt: "$ubtVotes" } }, // Calculate total UBT votes
        },
      },
      {
        $addFields: {
          favVotesPercentage: {
            $multiply: [
              { $divide: ["$totalFavVotes", "$totalPolledVotes"] }, // Calculate percentage of favorite votes
              100,
            ],
          },
          ubtVotesPercentage: {
            $multiply: [
              { $divide: ["$totalUbtVotes", "$totalPolledVotes"] }, // Calculate percentage of UBT votes
              100,
            ],
          },
          otherVotesPercentage: {
            $subtract: [
              100,
              {
                $add: [
                  {
                    $multiply: [
                      { $divide: ["$totalFavVotes", "$totalPolledVotes"] },
                      100,
                    ],
                  },
                  {
                    $multiply: [
                      { $divide: ["$totalUbtVotes", "$totalPolledVotes"] },
                      100,
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
      {
        $sort: {
          _id: 1, // Sort by boothType in ascending order
        },
      },
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/total-polled-votes", async (req, res) => {
  try {
    const result = await Booth.aggregate([
      {
        $group: {
          _id: null,
          totalPolledVotes: { $sum: { $toInt: "$polledVotes" } },
        },
      },
    ]);

    const totalCount = result.length > 0 ? result[0].totalPolledVotes : 0;

    res.json({ totalCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/total-fav-votes", async (req, res) => {
  try {
    const result = await Booth.aggregate([
      {
        $group: {
          _id: null,
          totalFavVotes: { $sum: { $toInt: "$favVotes" } },
        },
      },
    ]);

    const totalCount = result.length > 0 ? result[0].totalFavVotes : 0;

    res.json({ totalCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/total-ubt-votes", async (req, res) => {
  try {
    const result = await Booth.aggregate([
      {
        $group: {
          _id: null,
          totalUbtVotes: { $sum: { $toInt: "$ubtVotes" } },
        },
      },
    ]);

    const totalCount = result.length > 0 ? result[0].totalUbtVotes : 0;

    res.json({ totalCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new booth mapping
router.post("/create", async (req, res) => {
  try {
    const booth = new Booth(req.body);
    const savedBooth = await booth.save();
    res.status(201).json(savedBooth);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Retrieve all booth mappings
router.get("/get-booths", async (req, res) => {
  try {
    const booths = await Booth.find();
    res.json(booths);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve a specific booth mapping by ID
router.get("/:id", async (req, res) => {
  try {
    const booth = await Booth.findById(req.params.id);
    if (!booth) {
      return res.status(404).json({ error: "Booth not found" });
    }
    res.json(booth);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/bybooth/:boothName", async (req, res) => {
  try {
    const boothName = req.params.boothName;
    const boothData = await Booth.find({ booth: boothName });
    if (boothData.length === 0) {
      return res.status(404).json({ error: "Booth data not found" });
    }
    res.json(boothData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get(
  "/get-booth-names-by-constituency/:constituencyName",
  async (req, res) => {
    try {
      const constituencyName = req.params.constituencyName;
      const booths = await BoothMapping.find(
        { constituency: constituencyName },
        { booth: 1, _id: 0 }
      ).sort({ booth: 1 });
      if (booths.length === 0) {
        return res
          .status(404)
          .json({ error: "No booths found for the constituency" });
      }
      const boothNames = booths.map((booth) => booth.booth);
      res.json(boothNames);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get("/byConstituency/:constituencyName", async (req, res) => {
  try {
    const constituencyName = req.params.constituencyName;
    // Find booths based on the provided constituency name
    const booths = await Booth.find({ constituency: constituencyName });
    if (booths.length === 0) {
      return res
        .status(404)
        .json({ error: "No booths found for the constituency" });
    }
    res.json(booths);
  } catch (error) {
    console.error("Error getting booths by constituency:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a booth mapping by ID
router.put("/:id", async (req, res) => {
  try {
    const booth = await Booth.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!booth) {
      return res.status(404).json({ error: "Booth not found" });
    }
    res.json(booth);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a booth mapping by ID
router.delete("/delete/:id", async (req, res) => {
  try {
    const booth = await Booth.findByIdAndDelete(req.params.id);
    if (!booth) {
      return res.status(404).json({ error: "Booth not found" });
    }
    res.json({ message: "Booth deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
