import FAQ from "../models/FAQ.js";
import translateText from "./../services/translateService.js";
import { getAllFromCache, getCachedLanguages, setToCache, refreshCacheTTL, deleteFromCache } from './../services/cacheService.js'; // Redis helper functions

// Get all FAQs
export async function getFAQs(req, res) { 
  try {
    const { lang } = req.query;

    if (!lang || lang === "en") {
      let englishCache = await getAllFromCache("en");
      if (englishCache && Object.keys(englishCache).length > 0) {
        return res.json(Object.values(englishCache));
      }
      const faqsFromDB = await FAQ.find();
      const englishFaqs = faqsFromDB.map(faq => ({
        _id: faq._id.toString(),
        question: faq.question,
        answer: faq.answer
      }));
      await Promise.all(englishFaqs.map(faq => {
        return setToCache("en", faq._id, JSON.stringify(faq));
      }));
      return res.json(englishFaqs);
    }

    let translatedCache = await getAllFromCache(lang);
    if (translatedCache && Object.keys(translatedCache).length > 0) {
      return res.json(Object.values(translatedCache));
    }

    let englishCache = await getAllFromCache("en");
    let englishFaqs;

    if (englishCache && Object.keys(englishCache).length > 0) {
      englishFaqs = Object.values(englishCache);
    } else {
      const faqsFromDB = await FAQ.find();
      englishFaqs = faqsFromDB.map(faq => ({
        _id: faq._id.toString(),
        question: faq.question,
        answer: faq.answer
      }));
      await Promise.all(englishFaqs.map(faq => {
        return setToCache("en", faq._id, JSON.stringify(faq));
      }));
    }

    const translatedFaqs = await Promise.all(englishFaqs.map(async (faq) => {
      const [translatedQuestion, translatedAnswer] = await Promise.all([
        translateText(faq.question, lang).catch(() => faq.question),
        translateText(faq.answer, lang).catch(() => faq.answer)
      ]);

      return {
        _id: faq._id,
        question: translatedQuestion,
        answer: translatedAnswer
      };
    }));

    await Promise.all(translatedFaqs.map(faq => {
      return setToCache(lang, faq._id, JSON.stringify(faq));
    }));

    return res.json(translatedFaqs);
  } catch (err) {
    console.error("Error fetching FAQs:", err);
    res.status(500).json({ error: "Server error" });
  }
}


// Add new FAQ
export async function addFAQ(req, res) {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: "Question and answer are required" });
    }

    const newFAQ = new FAQ({question, answer});

    await newFAQ.save();

    const faqId = newFAQ._id.toString();
    const faqValue = JSON.stringify({_id:faqId, question, answer});
    setToCache("en", faqId, faqValue);


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
    const { question, answer } = req.body;

    const faq = await FAQ.findById(id);
    if (!faq) return res.status(404).json({ error: "FAQ not found" });

    faq.question = question || faq.question;
    faq.answer = answer || faq.answer;
    faq.translations = {};
    await faq.save();

    const languages = await getCachedLanguages();
    console.log("Languages in Redis: ", languages);

    await Promise.all(
      languages.map(async (lang) => {
        if(lang === "en"){
          await setToCache("en", id, JSON.stringify({question: faq.question, answer: faq.answer}));
        }
        else{
          const [translatedQuestion, translatedAnswer] = await Promise.all([
            translateText(faq.question, lang).catch(() => faq.question),
            translateText(faq.answer, lang).catch(() => faq.answer),
          ]);

          await setToCache(lang, id, JSON.stringify({question: translatedQuestion, answer: translatedAnswer}));
        }

        await refreshCacheTTL(lang);
      })
    )

    res.json(faq);
  } catch (err) {
    console.error("Error updating FAQ: ", err);
    res.status(500).json({ error: "Error updating FAQ" });
  }
}

// Delete FAQ
export async function deleteFAQ(req, res) {
  try {
    const { id } = req.params;
    // console.log("Deleting FAQ with ID:", id);

    // Delete from MongoDB
    const deletedFAQ = await FAQ.findByIdAndDelete(id);
    if (!deletedFAQ) {
      return res.status(404).json({ error: "FAQ not found" });
    }

    // Get all languages stored in Redis
    const languages = await getCachedLanguages();
    console.log("Languages in Redis before deletion:", languages);

    // Delete the FAQ from Redis for all languages
    await Promise.all(
      languages.map(async (lang) => {
        await deleteFromCache(lang, id);
        await refreshCacheTTL(lang); // Refresh TTL after deletion
      })
    );

    res.json({ message: "FAQ deleted successfully" });
  } catch (err) {
    console.error("Error deleting FAQ:", err);
    res.status(500).json({ error: "Error deleting FAQ" });
  }
}

