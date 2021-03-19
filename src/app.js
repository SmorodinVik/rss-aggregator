import axios from 'axios';
import * as yup from 'yup';
import i18n from 'i18next';

import initView from './view.js';
import parser from './parser.js';
import resources from './locales/resources.js';

const loadRSS = (path) => axios.get(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(path)}`)
  .then((response) => response.data.contents);

const validate = (value, urls) => {
  const schema = yup
    .string()
    .notOneOf(urls, 'form.errors.existingURL')
    .url('form.errors.notURL')
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
    lng: null,
    urls: [],
    feeds: [],
    posts: [],
    error: null,
    form: {
      status: 'filling',
      feedback: null,
      submitCount: 0,
      error: null,
    },
  };

  const elements = {
    lngBtns: document.querySelectorAll('#lngBtns > div > a'),
    title: document.querySelector('h1'),
    form: document.querySelector('#rss-form'),
    input: document.querySelector('#rss-input'),
    submitBtn: document.querySelector('#rss-submit'),
    feedback: document.querySelector('.feedback'),
    feedsBox: document.querySelector('.feeds'),
    postsBox: document.querySelector('.posts'),
    author: document.querySelector('#author'),
  };

  const i18nInstance = i18n.createInstance();

  const watched = initView(state, elements, i18nInstance);

  const defaultLanguage = 'en';

  i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  }).then(() => {
    watched.lng = defaultLanguage;
  });

  elements.lngBtns.forEach((btn) => btn.addEventListener('click', (e) => {
    watched.lng = e.target.id;
  }));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const rssLink = formData.get('url');

    const error = validate(rssLink, watched.urls);

    if (error) {
      watched.form.error = error;
      watched.form.status = 'incorrect';
      return;
    }

    watched.form.feedback = null;
    watched.form.status = 'loading';

    loadRSS(rssLink)
      .then((data) => {
        watched.form.feedback = 'form.luckyFeedback';
        const { feed, posts } = parser(data);
        watched.feeds = [feed, ...watched.feeds];
        watched.posts = [...posts, ...watched.posts];
        watched.urls = [rssLink, ...watched.urls];
        watched.form.status = 'filling';
        watched.form.submitCount += 1;
      })
      .catch((err) => {
        watched.error = err.message === 'Network Error' ? 'errors.networkError' : err.message;
        watched.form.status = 'failed';
      });
  });
};

export default app;
