const { AzureOpenAI } = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); 

const openai = new AzureOpenAI({
    apiKey: process.env.OPEN_AI_API_KEY,
    endpoint: process.env.OPEN_AI_API_ENDPOINT,
    apiVersion: '2025-04-01-preview',
});

const TOKEN_COUNT_FILE = path.join(__dirname, './tokenCount.txt');

const getResponse = async (req, res) => {
    const { prompt } = req.body;
    console.log(prompt);
    try {
        const result = await openai.chat.completions.create({
            model: 'gpt-5-mini',
            messages: [{ role: 'user', content: prompt }],
        });
        if (result) {
            const tokenUsed = result.usage?.total_tokens || 0;
            console.log('Token usage:', tokenUsed);
            let currentTotal = 0;
            try {
                const fileData = fs.readFileSync(TOKEN_COUNT_FILE, 'utf8');
                currentTotal = parseInt(fileData, 10) || 0;
            } catch (err) {
                console.warn('Could not read tokenCount.txt, starting at 0');
            }

            const newTotal = currentTotal + tokenUsed;
            fs.writeFileSync(TOKEN_COUNT_FILE, newTotal.toString(), 'utf8');

            res.status(200).json(result.choices[0]?.message?.content);
        } else {
            res.status(404).json({ message: 'Error' });
        }
    } catch (err) {
        res.status(404).json({ message: 'OpenAI error:' });
    }
}

module.exports = {
    getResponse
};
