const express = require("express");
const router = express.Router();
const Booth = require("../models/BoothData");
const Ac = require("../models/AcData");
const BoothMapping = require("../models/MappingData");

router.use(express.json());

// Create a new booth mapping
router.post("/create-data", async (req, res) => {
  try {
    const booth = new Ac(req.body);
    const savedBooth = await booth.save();
    res.status(201).json(savedBooth);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Retrieve all booth mappings
router.get("/get-ac-data", async (req, res) => {
  try {
    const booths = await Ac.find();
    res.json(booths);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/get-acdata-by-booth/:boothName", async (req, res) => {
    try {
      const boothName = req.params.boothName;
      const boothData = await Ac.find({ booth: boothName });
      if (boothData.length === 0) {
        return res.status(404).json({ error: "No data found for the specified booth" });
      }
      res.json(boothData);
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

router.get("/byBooth/:boothName", async (req, res) => {
  try {
    const boothName = req.params.boothName;
    const boothData = await Booth.findOne({ booth: boothName });
    if (!boothData) {
      return res.status(404).json({ error: "Booth data not found" });
    }
    res.json(boothData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get("/get-booth-names-by-constituency/:constituencyName", async (req, res) => {
  try {
    const constituencyName = req.params.constituencyName;
    const booths = await BoothMapping.find({ constituency: constituencyName }, { booth: 1, _id: 0 });
    if (booths.length === 0) {
      return res.status(404).json({ error: "No booths found for the constituency" });
    }
    const boothNames = booths.map(booth => booth.booth);
    res.json(boothNames);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



router.get('/byConstituency/:constituencyName', async (req, res) => {
    try {
      const constituencyName = req.params.constituencyName;
      // Find booths based on the provided constituency name
      const booths = await Booth.find({ constituency: constituencyName });
      if (booths.length === 0) {
        return res.status(404).json({ error: 'No booths found for the constituency' });
      }
      res.json(booths);
    } catch (error) {
      console.error('Error getting booths by constituency:', error);
      res.status(500).json({ error: 'Internal server error' });
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
router.delete("/:id", async (req, res) => {
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
