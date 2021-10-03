/* eslint-disable indent */
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

  const postBtns = elements.postsBox.querySelectorAll('.btn-sm');
  postBtns.forEach((btn) => {
    btn.textContent = i18nInstance.t('modal.viewBtn');
  });

  const readMoreBtn = elements.modal.querySelector('.full-article');
  readMoreBtn.textContent = i18nInstance.t('modal.readMore');

  const closeModalBtn = elements.modal.querySelector('.modal-footer > button');
  closeModalBtn.textContent = i18nInstance.t('modal.closeBtn');
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

const buildPostElement = (post, i18nInstance) => {
  const liEl = document.createElement('li');
  liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');

  const aEl = document.createElement('a');
  aEl.href = post.link;
  const className = post.viewed ? 'font-weight-normal' : 'font-weight-bold';
  aEl.classList.add(className);
  aEl.target = '_blank';
  aEl.rel = 'noopener noreferrer';
  aEl.dataset.id = post.id;
  aEl.textContent = post.title;

  const btnEl = document.createElement('button');
  btnEl.type = 'button';
  btnEl.classList.add('btn', 'btn-primary', 'btn-sm');
  btnEl.dataset.id = post.id;
  btnEl.dataset.toggle = 'modal';
  btnEl.dataset.target = '#modal';
  btnEl.textContent = i18nInstance.t('modal.viewBtn');

  liEl.append(aEl, btnEl);
  return liEl;
};

const renderPosts = (posts, elements, i18nInstance) => {
  if (posts.length === 0) return;

  elements.postsBox.textContent = '';

  const h2El = document.createElement('h2');
  h2El.textContent = i18nInstance.t('posts');

  const ulEl = document.createElement('ul');
  ulEl.classList.add('list-group');

  const builtPosts = posts.map((post) => buildPostElement(post, i18nInstance));
  ulEl.append(...builtPosts);

  elements.postsBox.append(h2El, ulEl);
};

const renderForm = (form, elements) => {
  switch (form.status) {
    case 'filling':
      elements.submitBtn.removeAttribute('disabled');
      elements.input.removeAttribute('readonly');
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
      elements.input.setAttribute('readonly', true);
      break;
    case 'failed':
      elements.submitBtn.removeAttribute('disabled');
      elements.input.removeAttribute('readonly');
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
  const errorMessage = form.errors[0];
  elements.feedback.textContent = i18nInstance.t(errorMessage);
  elements.feedback.dataset.i18n = errorMessage;
};

const renderAppError = (errors, elements, i18nInstance) => {
  const errorMessage = errors[0];
  elements.feedback.textContent = i18nInstance.t(errorMessage);
  elements.feedback.dataset.i18n = errorMessage;
};

const renderModal = (state, elements) => {
  const { open, postId } = state.modals;

  if (open) {
    const [post] = state.posts.postList
      .filter(({ id }) => postId === id);

    const title = elements.modal.querySelector('.modal-title');
    title.textContent = post.title;

    const body = elements.modal.querySelector('.modal-body');
    body.textContent = post.description;

    const readMoreBtn = elements.modal.querySelector('.full-article');
    readMoreBtn.href = post.link;

    elements.modal.classList.add('show');
    elements.modal.style = 'display: block;';
    elements.modal.setAttribute('role', 'dialog');
    elements.modal.setAttribute('aria-modal', true);
    elements.modal.removeAttribute('aria-hidden');

    document.body.classList.add('modal-open');

    const divEl = document.createElement('div');
    divEl.classList.add('modal-backdrop', 'fade', 'show');
    document.body.append(divEl);
  } else {
    elements.modal.classList.remove('show');
    elements.modal.removeAttribute('aria-modal');
    elements.modal.removeAttribute('role');
    elements.modal.setAttribute('aria-hidden', true);
    elements.modal.style = 'display: none;';

    document.body.classList.remove('modal-open');

    const el = document.querySelector('.modal-backdrop');
    el.remove();
  }
};

const initView = (state, elements, i18nInstance) => {
  elements.input.focus();

  const mapping = {
    lng: () => renderLngChange(state, elements, i18nInstance),
    feeds: () => renderFeeds(state.feeds, elements, i18nInstance),
    'posts.postList': () => renderPosts(state.posts.postList, elements, i18nInstance),
    errors: () => renderAppError(state.errors, elements, i18nInstance),
    'modals.open': () => renderModal(state, elements),
    'form.status': () => renderForm(state.form, elements),
    'form.feedback': () => renderFeedback(state.form, elements, i18nInstance),
    'form.submitCount': () => elements.input.focus(),
    'form.errors': () => renderFormError(state.form, elements, i18nInstance),
  };

  const watchedState = onChange(state, (path) => {
    if (mapping[path]) {
      mapping[path]();
    }
  });

  return watchedState;
};

export default initView;
