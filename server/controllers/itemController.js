const Item = require('../models/Item');
const User = require('../models/User');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Controller to create/report a new item
exports.createItem = async (req, res) => {
    const {
        status,
        itemName,
        description,
        mainCategory,
        subCategory,
        location,
        currentLocation,
        retrievalImportance,
        priceRange
    } = req.body;

    try {
        const newItem = new Item({
            status,
            itemName,
            description,
            mainCategory,
            subCategory,
            location,
            currentLocation,
            retrievalImportance,
            priceRange,
            reportedBy: req.user.id,
        });

        // --- UPDATED FILE HANDLING LOGIC ---
        if (req.files) {
            newItem.media = req.files.map(file => ({
                fileId: file.id,
                filename: file.filename,
                contentType: file.contentType
            }));
        }

        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "embedding-001"});
            const textToEmbed = `Item Name: ${newItem.itemName}, Description: ${newItem.description}, Category: ${newItem.mainCategory} - ${newItem.subCategory}.`;
            
            const result = await model.embedContent(textToEmbed);
            const embedding = result.embedding;
            newItem.descriptionEmbedding = embedding.values;
        } catch (aiError) {
            console.error("Error generating AI embedding:", aiError);
            return res.status(500).send('Failed to generate AI embedding.');
        }

        const item = await newItem.save();
        res.status(201).json(item);

    } catch (err) {
        console.error("Error in createItem:", err.message);
        res.status(500).send('Server Error');
    }
};

// Controller to get all "Found" items for the public feed
exports.getFoundItems = async (req, res) => {
    try {
        const items = await Item.find({ status: 'Found', isRetrieved: false })
            .populate('reportedBy', 'name department')
            .sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Controller to get a single item by its ID
exports.getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id)
                                  .populate('reportedBy', 'name department phoneNumber');
        if (!item) {
            return res.status(404).json({ msg: 'Item not found' });
        }
        res.json(item);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
             return res.status(404).json({ msg: 'Item not found' });
        }
        res.status(500).send('Server Error');
    }
};

// Controller to get items reported by the currently logged-in user
exports.getMyItems = async (req, res) => {
    try {
        const items = await Item.find({ reportedBy: req.user.id }).sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Controller to get retrieved items reported by the currently logged-in user
exports.getMyRetrievedItems = async (req, res) => {
    try {
        const items = await Item.find({ 
            reportedBy: req.user.id, 
            isRetrieved: true
        }).sort({ updatedAt: -1 });
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.findSemanticMatches = async (req, res) => {
    try {
        // Find the user's "Lost" item to get its vector embedding.
        const lostItem = await Item.findById(req.params.id);

        if (!lostItem || !lostItem.descriptionEmbedding || lostItem.descriptionEmbedding.length === 0) {
            return res.status(404).json({ msg: 'Lost item or its AI embedding not found.' });
        }

        // Use a MongoDB Aggregation Pipeline with $vectorSearch to find similar items.
        const potentialMatches = await Item.aggregate([
            {
                $vectorSearch: {
                    index: 'vector_index',
                    path: 'descriptionEmbedding',
                    queryVector: lostItem.descriptionEmbedding,
                    numCandidates: 150,
                    limit: 10,
                }
            },
            {
                $match: {
                    status: "Found",
                    isRetrieved: false
                }
            },
            {
                $project: {
                    _id: 1,
                    itemName: 1,
                    description: 1,
                    mainCategory: 1,
                    subCategory: 1,
                    location: 1,
                    media: 1,
                    createdAt: 1,
                    reportedBy: 1,
                    score: { $meta: "vectorSearchScore" }
                }
            }
        ]);

        // Separate the results into valid matches and self-matches
        let validMatches = [];
        let selfMatchCount = 0;

        potentialMatches.forEach(match => {
            if (match.reportedBy.toString() !== lostItem.reportedBy.toString()) {
                validMatches.push(match);
            } else {
                selfMatchCount++;
            }
        });

        // Return an object with both the valid matches and the count of self-matches
        res.json({ matches: validMatches, selfMatchCount: selfMatchCount });

    } catch (err) {
        console.error("Error in findSemanticMatches:", err.message);
        res.status(500).send('Server Error');
    }
};