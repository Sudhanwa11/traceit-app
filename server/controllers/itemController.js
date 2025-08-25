// server/controllers/itemController.js

const Item = require('../models/Item');
const User = require('../models/User');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // 1. Import Gemini

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

        // ==========================================================
        // 2. NEW: GEMINI EMBEDDING LOGIC
        // ==========================================================
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "embedding-001"});

            // Create a detailed text string for the AI to understand the context better
            const textToEmbed = `Item Name: ${newItem.itemName}, Description: ${newItem.description}, Category: ${newItem.mainCategory} - ${newItem.subCategory}.`;
            
            const result = await model.embedContent(textToEmbed);
            const embedding = result.embedding;
            newItem.descriptionEmbedding = embedding.values;

        } catch (aiError) {
            console.error("Error generating AI embedding:", aiError);
            // Decide if you want to fail the whole process or save the item without an embedding
            // For now, we'll let it fail so we know if the API key is working.
            return res.status(500).send('Failed to generate AI embedding.');
        }
        // ==========================================================
        // END: GEMINI LOGIC
        // ==========================================================

        const item = await newItem.save();
        res.status(201).json(item);

    } catch (err) {
        console.error("Error in createItem:", err.message);
        res.status(500).send('Server Error');
    }
};

// ... KEEP ALL OTHER CONTROLLER FUNCTIONS (getFoundItems, getItemById, getMyItems, etc.) THE SAME ...
// Make sure to copy them back in if you are replacing the whole file.

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
        // 1. Find the user's "Lost" item to get its vector embedding.
        const lostItem = await Item.findById(req.params.itemId);

        if (!lostItem || !lostItem.descriptionEmbedding || lostItem.descriptionEmbedding.length === 0) {
            return res.status(404).json({ msg: 'Lost item or its AI embedding not found.' });
        }

        // 2. Use a MongoDB Aggregation Pipeline with $vectorSearch to find similar items.
        const potentialMatches = await Item.aggregate([
            {
                $vectorSearch: {
                    index: 'vector_index', // The name of the index you created in Atlas
                    path: 'descriptionEmbedding',
                    queryVector: lostItem.descriptionEmbedding,
                    numCandidates: 150, // Number of candidates to consider for accuracy
                    limit: 10, // Return the top 10 most similar items
                }
            },
            {
                $match: {
                    status: "Found", // We only want to match against items that have been "Found"
                    isRetrieved: false // And that haven't already been retrieved
                }
            },
            {
                $project: { // Specify which fields to return
                    _id: 1,
                    itemName: 1,
                    description: 1,
                    mainCategory: 1,
                    subCategory: 1,
                    location: 1,
                    media: 1,
                    createdAt: 1,
                    reportedBy: 1,
                    score: { $meta: "vectorSearchScore" } // Include the similarity score
                }
            }
        ]);

        // 3. Implement the Self-Matching Rule: Filter out items the same user reported.
        const filteredMatches = potentialMatches.filter(match => 
            match.reportedBy.toString() !== lostItem.reportedBy.toString()
        );

        res.json(filteredMatches);

    } catch (err) {
        console.error("Error in findSemanticMatches:", err.message);
        res.status(500).send('Server Error');
    }
};