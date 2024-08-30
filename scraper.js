const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const baseUrl = "http://quotes.toscrape.com";
const outputFilePath = path.join(__dirname, "quotes.csv");

// Write the header to the CSV file
fs.writeFileSync(outputFilePath, "Quote,Author,Tags\n", "utf-8");

// Function to scrape a single page
const scrapePage = async (pageUrl) => {
  try {
    const response = await axios.get(`${baseUrl}${pageUrl}`);
    const $ = cheerio.load(response.data);
    const quotes = [];

    // Extract quotes from the page
    $(".quote").each((index, element) => {
      const quote = $(element).find(".text").text().replace(/"/g, '""');
      const author = $(element).find(".author").text();
      const tags = [];
      $(element)
        .find(".tags a.tag")
        .each((i, el) => {
          tags.push($(el).text());
        });

      quotes.push({
        quote,
        author,
        tags: tags.join(", "),
      });
    });

    // Write quotes to the CSV file
    quotes.forEach((q) => {
      const row = `"${q.quote}","${q.author}","${q.tags}"\n`;
      fs.appendFileSync(outputFilePath, row, "utf-8");
    });

    console.log(`Scraped page: ${pageUrl}`);

    // Check if there is a "Next" button, and recursively scrape the next page
    const nextButton = $(".pager .next a").attr("href");
    if (nextButton) {
      await scrapePage(nextButton); // Recursively scrape the next page
    } else {
      console.log("Scraping completed and data saved to quotes.csv");
    }
  } catch (error) {
    console.error(`Error scraping page ${pageUrl}:`, error);
  }
};

// Start scraping from the first page
scrapePage("/");
