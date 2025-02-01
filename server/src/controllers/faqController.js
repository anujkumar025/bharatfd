import FAQ from "../models/FAQ.js";
import { autoTranslate } from "../services/translateService.js";
import { getFromCache, setToCache } from "../services/cacheService.js";

// Get FAQs with language support
export async function getFAQs(req, res) {
  try {
    const { lang } = req.query;
    
    // Check if cached data exists
    const cachedFAQs = await getFromCache(`faqs:${lang || "en"}`);
    if (cachedFAQs) return res.json(JSON.parse(cachedFAQs));

    let faqs = await  FAQ.find();

    if (lang && lang !== "en") {
      faqs = faqs.map((faq) => ({
        question: faq.translations[lang]?.question || faq.question,
        answer: faq.translations[lang]?.answer || faq.answer,
      }));
    }

    // Store in cache for faster retrieval
    await setToCache(`faqs:${lang || "en"}`, JSON.stringify(faqs), 3600);

    res.json(faqs);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}

// Add new FAQ
export async function addFAQ(req, res) {
  try {
    const { question, answer } = req.body;

    // Translate content
    const translations = await autoTranslate(question, answer);

    console.log(translations);

    const newFAQ = new FAQ({ question, answer, translations });
    await newFAQ.save();

    res.status(201).json(newFAQ);
  } catch (err) {
    res.status(500).json({ error: "Error adding FAQ" });
  }
}

// Update FAQ
export async function updateFAQ(req, res) {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;

    const faq = await FAQ.findById(id);
    if (!faq) return res.status(404).json({ error: "FAQ not found" });

    faq.question = question || faq.question;
    faq.answer = answer || faq.answer;
    faq.translations = await autoTranslate(question, answer);

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
