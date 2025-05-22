const KeywordController = require('../../controller/controller');

function makeKeywords(count) {
  return Array.from({ length: count }, (_, i) => ({
    name: `Keyword${i + 1}`
  }));
}

function mockListView(overrides = {}) {
  return {
    render: jest.fn(),
    isCurrentPage: jest.fn(() => false),
    scrollToPagination: jest.fn(),
    currentPage: 1,
    ...overrides
  };
}

describe('KeywordController - pagination', () => {
  let controller;

  beforeEach(() => {
    controller = { 
      displayMetaKeywords: makeKeywords(12),
      batchSizes: { meta: 5 },
      renderPage: KeywordController.prototype.renderPage,
      changePage: KeywordController.prototype.changePage,
      getListByType: KeywordController.prototype.getListByType
    };
  });

  test('renderPage() should render correct slice for page 2', () => {
    const listView = mockListView({ currentPage: 2 });

    controller.renderPage('meta', listView, controller.displayMetaKeywords, 2);

    expect(listView.render).toHaveBeenCalledWith(
      [
        { name: 'Keyword6' },
        { name: 'Keyword7' },
        { name: 'Keyword8' },
        { name: 'Keyword9' },
        { name: 'Keyword10' }
      ],
      3,
      2,
      5
    );
  });

  test('changePage() should do nothing if page is current', () => {
    const listView = mockListView({ isCurrentPage: jest.fn(() => true) });
    controller.view = { getListViewByType: jest.fn(() => listView) };

    controller.changePage('meta', 1);

    expect(listView.render).not.toHaveBeenCalled();
  });

  test('changePage() should call renderPage with correct arguments', () => {
    const listView = mockListView();
    controller.view = { getListViewByType: jest.fn(() => listView) };
    const spy = jest.spyOn(controller, 'renderPage');

    controller.changePage('meta', 2);

    expect(spy).toHaveBeenCalledWith(
      'meta',
      listView,
      controller.displayMetaKeywords,
      2
    );
    expect(listView.scrollToPagination).toHaveBeenCalled();
  });
});
