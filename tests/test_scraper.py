import unittest

from bs4 import BeautifulSoup

from scraper import BookScraper


DETAIL_HTML = """
<html><body>
  <ul class="breadcrumb">
    <li><a href="/">Home</a></li><li><a href="/catalogue/category/books_1/index.html">Books</a></li>
    <li><a href="/catalogue/category/books/poetry_23/index.html">Poetry</a></li><li>Example</li>
  </ul>
  <div class="product_main"><h1>Example Book</h1><p class="price_color">£12.34</p><p class="star-rating Four"></p></div>
  <div class="item active"><img src="../../media/example.jpg"></div>
  <div id="product_description"></div><p>A useful description.</p>
  <table class="table table-striped">
    <tr><th>UPC</th><td>abc123</td></tr>
    <tr><th>Price (excl. tax)</th><td>£12.34</td></tr>
    <tr><th>Price (incl. tax)</th><td>£12.34</td></tr>
    <tr><th>Tax</th><td>£0.00</td></tr>
    <tr><th>Availability</th><td>In stock (7 available)</td></tr>
    <tr><th>Number of reviews</th><td>2</td></tr>
  </table>
</body></html>
"""


class FixtureScraper(BookScraper):
    def get_soup(self, url):
        return BeautifulSoup(DETAIL_HTML, "html.parser")


class ScraperParsingTest(unittest.TestCase):
    def test_detail_page_is_normalized(self):
        book = FixtureScraper(delay=0).parse_book(
            "https://books.toscrape.com/catalogue/example_1/index.html"
        )
        self.assertEqual(book.book_id, "abc123")
        self.assertEqual(book.title, "Example Book")
        self.assertEqual(book.category, "Poetry")
        self.assertEqual(float(book.price_gbp), 12.34)
        self.assertEqual(book.stock_quantity, 7)
        self.assertEqual(book.rating, 4)
        self.assertEqual(book.review_count, 2)


if __name__ == "__main__":
    unittest.main()

