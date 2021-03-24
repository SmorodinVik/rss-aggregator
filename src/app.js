/* eslint-disable no-param-reassign */
import axios from 'axios';
import * as yup from 'yup';
import i18n from 'i18next';
import * as _ from 'lodash';

import initView from './view.js';
import parser from './parser.js';
import resources from './locales/resources.js';

const loadRSS = (path) => axios.get(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(path)}`)
  .then((response) => response.data.contents);

const loadNewPosts = (urls) => {
  const promises = urls.map((url) => loadRSS(url)
    .then((value) => parser(value).posts)
    .catch(() => null));
  return Promise.all(promises)
    .then((result) => result.filter((val) => val !== null).flat());
};

const filterNewPosts = (oldPosts, newPosts) => {
  const titleList = oldPosts.map(({ title }) => title);
  return newPosts.filter(({ title }) => !_.includes(titleList, title));
};

const addId = (state, posts) => posts
  .map((post) => {
    const id = state.posts.idCounter;
    state.posts.idCounter += 1;
    return { id, ...post };
  });

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

const makePostViewed = (posts, id) => posts.map((post) => {
  if (post.id === id) {
    return { ...post, viewed: true };
  }
  return post;
});

const addPostElementAction = (watched, elements) => {
  const aEls = elements.postsBox.querySelectorAll('a');
  aEls.forEach((el) => {
    el.addEventListener('click', (e) => {
      const id = Number(e.target.dataset.id);
      watched.posts.postList = makePostViewed(watched.posts.postList, id);
      addPostElementAction(watched, elements);
    });
  });

  const buttons = elements.postsBox.querySelectorAll('button');
  buttons.forEach((button) => {
    button.addEventListener('click', (e) => {
      const id = Number(e.target.dataset.id);
      watched.posts.postList = makePostViewed(watched.posts.postList, id);
      watched.modals.postId = id;
      watched.modals.open = true;
      addPostElementAction(watched, elements);
    });
  });
};

const app = () => {
  const state = {
    lng: null,
    urls: [],
    feeds: [],
    posts: {
      idCounter: 0,
      postList: [],
    },
    modals: {
      open: false,
      postId: null,
    },
    errors: [],
    form: {
      status: 'filling',
      feedback: null,
      submitCount: 0,
      errors: [],
    },
  };

  const elements = {
    modal: document.querySelector('#modal'),
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

  const defaultLanguage = 'ru';

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
    const rssLink = formData.get('url').trim();

    const error = validate(rssLink, watched.urls);

    if (error) {
      watched.form.errors = [error, ...watched.form.errors];
      watched.form.status = 'incorrect';
      return;
    }

    watched.form.feedback = null;
    watched.form.status = 'loading';

    loadRSS(rssLink)
      .then((data) => {
        watched.form.feedback = 'form.luckyFeedback';
        const { feed, posts } = parser(data);
        const postsWithId = addId(watched, posts);
        watched.feeds = [feed, ...watched.feeds];
        watched.posts.postList = [...postsWithId, ...watched.posts.postList];
        addPostElementAction(watched, elements);
        watched.urls = [...watched.urls, rssLink];
        watched.form.status = 'filling';
        watched.form.submitCount += 1;
      })
      .catch((err) => {
        const networkErrors = ['Network Error', 'no internet'];
        const errorMessage = _.includes(networkErrors, err.message) ? 'errors.networkError' : err.message;
        watched.errors = [errorMessage, ...watched.errors];
        watched.form.status = 'failed';
      });
  });

  document.addEventListener('click', (e) => {
    if (watched.modals.open && e.target === elements.modal) {
      watched.modals.open = false;
    }
  });

  const closeModalElements = [
    elements.modal.querySelector('.modal-footer > button'),
    elements.modal.querySelector('.modal-header > button'),
  ];

  closeModalElements.forEach((el) => {
    el.addEventListener('click', () => {
      if (watched.modals.open) {
        watched.modals.open = false;
      }
    });
  });

  const fn = () => {
    loadNewPosts(watched.urls)
      .then((newPosts) => filterNewPosts(watched.posts.postList, newPosts))
      .then((filteredPosts) => addId(watched, filteredPosts))
      .then((postsWithId) => {
        if (postsWithId.length !== 0) {
          watched.posts.postList = [...postsWithId, ...watched.posts.postList];
          addPostElementAction(watched, elements);
        }
        setTimeout(fn, 5000);
      });
  };

  setTimeout(fn, 5000);
};

export default app;
