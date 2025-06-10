const KeywordController = require('../../controller/controller');

function makeKeywords(count) {
  return Array.from({ length: count }, (_, i) => ({
    name: `Keyword${i + 1}`
  }));
}

function mockListView(overrides = {}) {
  return {
    render: jest.fn(),
    isCurrentPageButton: jest.fn(() => false),
    scrollToPagination: jest.fn(),
    currentPage: 1,
    ...overrides
  };
}

describe('KeywordController - pagination', () => {
  let controller;

  beforeEach(() => {
    controller = Object.create(KeywordController.prototype);
    controller.keywordLists = {
      meta: { 
        batchSize: 5,
        display: makeKeywords(12)
      }
    };
  });

  describe('renderPage()', () => {
    it('should render correct slice for page 2', () => {
      const listView = mockListView({ currentPage: 2 });
  
      controller.renderPage(listView, controller.keywordLists.meta.display, 5, 2);
  
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

    it('should render correct slice for page 3', () => {
      const listView = mockListView({ currentPage: 3 });
  
      controller.renderPage(listView, controller.keywordLists.meta.display, 5, 3);
  
      expect(listView.render).toHaveBeenCalledWith(
        [
          { name: 'Keyword11' },
          { name: 'Keyword12' }
        ],
        3,
        3,
        10
      );
    });

    it('should adjust currentPage if incorrect', () => {
      const listView = mockListView({ currentPage: 4 });
  
      controller.renderPage(listView, controller.keywordLists.meta.display, 5, 4);
  
      expect(listView.render).toHaveBeenCalledWith(
        [
          { name: 'Keyword1' },
          { name: 'Keyword2' },
          { name: 'Keyword3' },
          { name: 'Keyword4' },
          { name: 'Keyword5' }
        ],
        3,
        1,
        0
      );
    });
  });
  
  describe('changePage()', () => {
    beforeEach(() => {
      controller.renderPage = jest.fn();;
    });

    it('should call renderPage with correct arguments', () => {
      const listView = mockListView();
      controller.view = { getListViewByType: jest.fn(() => listView) };
      const mockButton = {
        dataset: { page: 2 }
      };

      controller.changePage('meta', mockButton);

      expect(controller.renderPage).toHaveBeenCalledWith(
        listView,
        controller.keywordLists.meta.display,
        5, 
        2
      );
      expect(listView.scrollToPagination).toHaveBeenCalled();
    });

    it('should do nothing if page is current', () => {
      const listView = mockListView({ isCurrentPageButton: jest.fn(() => true) });
      controller.view = { getListViewByType: jest.fn(() => listView) };

      controller.changePage('meta', {});

      expect(controller.renderPage).not.toHaveBeenCalled();
    });

    it('should do nothing if page is not a number', () => {
      const listView = mockListView();
      controller.view = { getListViewByType: jest.fn(() => listView) };
      const mockButton = {
        dataset: { page: 'invalid' }
      };

      controller.changePage('meta', mockButton);

      expect(controller.renderPage).not.toHaveBeenCalled();
    });
  });
});
