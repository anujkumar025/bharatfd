import FAQ from "../models/FAQ.js";
import translateText from "./../services/translateService.js";
// import { getFromCache, setToCache } from "../services/cacheService.js";

// Get FAQs with language support
export async function getFAQs(req, res) {
  try {
    const { lang } = req.query;
    
    let faqs = await FAQ.find();

    if (lang && lang !== "en") {
      faqs = await Promise.all(faqs.map(async (faq) => {
        // Initialize translations as Map if undefined
        if (!faq.translations) {
          faq.translations = new Map();
        }

        const translations = faq.translations;
        
        // Check if translation exists
        if (!translations.has(lang)) {
          const [translatedQuestion, translatedAnswer] = await Promise.all([
            translateText(faq.question, lang).catch(() => faq.question),
            translateText(faq.answer, lang).catch(() => faq.answer)
          ]);

          // Update translations using Map methods
          translations.set(lang, {
            question: translatedQuestion,
            answer: translatedAnswer
          });

          await faq.save();
        }

        const translated = translations.get(lang);
        return {
          question: translated.question,
          answer: translated.answer
        };
      }));
    } else {
      faqs = faqs.map(faq => ({
        question: faq.question,
        answer: faq.answer
      }));
    }

    res.json(faqs);
  } catch (err) {
    console.error("Error fetching FAQs:", err);
    res.status(500).json({ error: "Server error" });
  }
}

// Add new FAQ
export async function addFAQ(req, res) {
  try {
    const { question, answer } = req.body;

    // Simple validation
    if (!question || !answer) {
      return res.status(400).json({ error: "Question and answer are required" });
    }

    // Create FAQ with only English content
    const newFAQ = new FAQ({
      question,
      answer
      // No translations field needed
    });

    await newFAQ.save();

    // Return simple response without translations
    res.status(201).json({
      _id: newFAQ._id,
      question: newFAQ.question,
      answer: newFAQ.answer
    });

  } catch (err) {
    console.error("Error adding FAQ:", err);
    res.status(500).json({ 
      error: "Error adding FAQ",
      details: err.message
    });
  }
}

// Update FAQ
export async function updateFAQ(req, res) {
  try {
    const { id } = req.params;
    console.log("id " + id);
    const { question, answer } = req.body;

    const faq = await FAQ.findById(id);
    if (!faq) return res.status(404).json({ error: "FAQ not found" });

    faq.question = question || faq.question;
    faq.answer = answer || faq.answer;
    // faq.translations = await autoTranslate(question, answer);
    faq.translations = {};
    await faq.save();
    res.json(faq);
  } catch (err) {
    res.status(500).json({ error: "Error updating FAQ" });
  }
}

// Delete FAQ
export async function deleteFAQ(req, res) {
  try {
    const { id } = req.params;
    await FAQ.findByIdAndDelete(id);
    res.json({ message: "FAQ deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting FAQ" });
  }
}
