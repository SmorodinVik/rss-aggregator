import axios from 'axios';
import * as yup from 'yup';

import initView from './view.js';
import parser from './parser.js';

const loadRSS = (path) => axios.get(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(path)}`)
  .then((response) => response.data.contents);

const validate = (value, urls) => {
  const schema = yup
    .string()
    .notOneOf(urls, 'RSS is already exists')
    .url('The link must be a valid URL')
    .required();

  try {
    schema.validateSync(value);
    return null;
  } catch (err) {
    return err.message;
  }
};

const app = () => {
  const state = {
    urls: [],
    feeds: [],
    posts: [],
    form: {
      status: 'filling',
      feedback: null,
      submitCount: 0,
    },
  };

  const elements = {
    form: document.querySelector('#rss-form'),
    input: document.querySelector('#rss-input'),
    submitBtn: document.querySelector('#rss-submit'),
    feedback: document.querySelector('.feedback'),
    feedsBox: document.querySelector('.feeds'),
    postsBox: document.querySelector('.posts'),
  };

  const watched = initView(state, elements);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const rssLink = formData.get('url');

    const error = validate(rssLink, watched.urls);

    if (error) {
      watched.form.feedback = error;
      watched.form.status = 'incorrect';
      return;
    }

    watched.form.feedback = null;
    watched.form.status = 'loading';

    loadRSS(rssLink)
      .then((data) => {
        watched.form.feedback = 'RSS successfully loaded';
        const { feed, posts } = parser(data);
        watched.feeds = [feed, ...watched.feeds];
        watched.posts = [...posts, ...watched.posts];
        watched.urls = [rssLink, ...watched.urls];
        watched.form.status = 'filling';
        watched.form.submitCount += 1;
      })
      .catch((err) => {
        watched.form.feedback = err.message;
        watched.form.status = 'failed';
      });
  });
};

export default app;
