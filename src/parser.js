export default (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/xml');
  if (!doc.querySelector('rss')) {
    throw new Error('The resource does not contain a valid RSS');
  }
  const feedTitle = doc.querySelector('title').textContent;
  const feedDescription = doc.querySelector('description').textContent;

  const items = doc.querySelectorAll('item');

  const posts = Array.from(items)
    .map((item) => {
      const title = item.querySelector('title').textContent;
      const link = item.querySelector('link').textContent;
      const description = item.querySelector('description').textContent;
      return { title, link, description };
    });
  return { feed: { title: feedTitle, description: feedDescription }, posts };
};
