import puppeteer from "puppeteer";
import fs from "fs";

const scrape = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const allBooks = [];
  let currentPage = 1;

  let url = `https://books.toscrape.com/`;

  await page.goto(url);

  const maxPages = await page.evaluate(() => {
    const pager = document.querySelector(".pager");
    const next = pager.querySelector(".current").textContent;
    return parseInt(next.split("of")[1].trim());
  });
  while (currentPage <= maxPages) {
    url = `https://books.toscrape.com/catalogue/page-${currentPage}.html`;
    console.log("im getting ", url);

    await page.goto(url);
    const books = await page.evaluate(() => {
      const bookElements = document.querySelectorAll(".product_pod");
      const pager = document.querySelector(".pager");
      const next = pager.querySelector(".current").textContent;
      // const maxPages = parseInt(next.split("of")[1].trim());
      return Array.from(bookElements).map((book) => {
        const title = book.querySelector("h3 a").getAttribute("title");
        const price = book.querySelector(".price_color").textContent;
        const stock = book.querySelector(".instock.availability")
          ? "In Stock"
          : "Out of Stock";
        const rating = book
          .querySelector("p.star-rating")
          .getAttribute("class")
          .split(" ")[1];
        const link = book.querySelector("h3 a").getAttribute("href");
        return { title, price, stock, rating, link };
      });
    });
    allBooks.push(...books);
    console.log(`Books on Page ${page}`, books);
    currentPage++;
  }

  fs.writeFileSync("books.json", JSON.stringify(allBooks, null, 2));

  console.log("Data saved to books.json");

  await browser.close();
};

scrape();
