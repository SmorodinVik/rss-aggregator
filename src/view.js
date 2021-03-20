/* eslint-disable no-param-reassign */
import onChange from 'on-change';

const renderTexts = (elements, i18nInstance) => {
  elements.title.textContent = i18nInstance.t('mainTitle');
  elements.input.placeholder = i18nInstance.t('form.inputPlaceholder');
  elements.submitBtn.textContent = i18nInstance.t('form.submitBtn');
  const i18nValue = elements.feedback.dataset.i18n;
  elements.feedback.textContent = i18nInstance.t(i18nValue);

  const feedsTitle = elements.feedsBox.querySelector('h2');
  if (feedsTitle) {
    feedsTitle.textContent = i18nInstance.t('feeds');
  }

  const postsTitle = elements.postsBox.querySelector('h2');
  if (postsTitle) {
    postsTitle.textContent = i18nInstance.t('posts');
  }

  elements.author.innerHTML = `
    ${i18nInstance.t('createdBy')} <a href="https://github.com/SmorodinaVik" target="_blank">${i18nInstance.t('author')}</a>
  `;
};

const renderLngChange = (state, elements, i18nInstance) => {
  const { lng } = state;
  elements.lngBtns.forEach((el) => {
    if (el.id === lng) {
      el.classList.remove('text-muted');
    } else {
      el.classList.add('text-muted');
    }
  });
  i18nInstance.changeLanguage(lng).then(() => renderTexts(elements, i18nInstance));
};

const buildFeedElement = (feed) => {
  const liEl = document.createElement('li');
  liEl.classList.add('list-group-item');

  const h3El = document.createElement('h3');
  h3El.textContent = feed.title;

  const pEl = document.createElement('p');
  pEl.textContent = feed.description;

  liEl.append(h3El, pEl);
  return liEl;
};

const renderFeeds = (feeds, elements, i18nInstance) => {
  elements.feedsBox.textContent = '';

  const h2El = document.createElement('h2');
  h2El.textContent = i18nInstance.t('feeds');

  const ulEl = document.createElement('ul');
  ulEl.classList.add('list-group', 'mb-5');

  const builtFeeds = feeds.map(buildFeedElement);
  ulEl.append(...builtFeeds);

  elements.feedsBox.append(h2El, ulEl);
};

const buildPostElement = (post) => {
  const liEl = document.createElement('li');
  liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');

  const aEl = document.createElement('a');
  aEl.classList.add('font-weigth-normal');
  aEl.href = post.link;
  aEl.target = '_blank';
  aEl.rel = 'noopener noreferrer';
  aEl.textContent = post.title;

  liEl.append(aEl);
  return liEl;
};

const renderPosts = (posts, elements, i18nInstance) => {
  if (posts.length === 0) return;

  elements.postsBox.textContent = '';

  const h2El = document.createElement('h2');
  h2El.textContent = i18nInstance.t('posts');

  const ulEl = document.createElement('ul');
  ulEl.classList.add('list-group');

  const builtPosts = posts.map(buildPostElement);
  ulEl.append(...builtPosts);

  elements.postsBox.append(h2El, ulEl);
};

const renderForm = (form, elements) => {
  switch (form.status) {
  case 'filling':
    elements.submitBtn.removeAttribute('disabled');
    elements.input.removeAttribute('disabled');
    elements.input.classList.remove('is-invalid');
    elements.input.value = '';
    elements.feedback.classList.remove('text-danger');
    elements.feedback.classList.add('text-success');
    break;

  case 'incorrect':
    elements.input.classList.add('is-invalid');
    elements.feedback.classList.add('text-danger');
    break;

  case 'loading':
    elements.submitBtn.setAttribute('disabled', true);
    elements.input.setAttribute('disabled', true);
    break;

  case 'failed':
    elements.submitBtn.removeAttribute('disabled');
    elements.input.removeAttribute('disabled');
    elements.feedback.classList.add('text-danger');
    elements.input.classList.remove('is-invalid');
    break;

  default:
    throw new Error(`Unknown form status: ${form.status}`);
  }
};

const renderFeedback = (form, elements, i18nInstance) => {
  elements.feedback.textContent = i18nInstance.t(form.feedback);
  elements.feedback.dataset.i18n = form.feedback;
};

const renderFormError = (form, elements, i18nInstance) => {
  elements.feedback.textContent = i18nInstance.t(form.error);
  elements.feedback.dataset.i18n = form.error;
};

const renderAppError = (error, elements, i18nInstance) => {
  elements.feedback.textContent = i18nInstance.t(error);
  elements.feedback.dataset.i18n = error;
};

const initView = (state, elements, i18nInstance) => {
  elements.input.focus();

  const mapping = {
    lng: () => renderLngChange(state, elements, i18nInstance),
    feeds: () => renderFeeds(state.feeds, elements, i18nInstance),
    posts: () => renderPosts(state.posts, elements, i18nInstance),
    error: () => renderAppError(state.error, elements, i18nInstance),
    'form.status': () => renderForm(state.form, elements),
    'form.feedback': () => renderFeedback(state.form, elements, i18nInstance),
    'form.submitCount': () => elements.input.focus(),
    'form.error': () => renderFormError(state.form, elements, i18nInstance),
  };

  const watchedState = onChange(state, (path) => {
    if (mapping[path]) {
      mapping[path]();
    }
  });

  return watchedState;
};

export default initView;
