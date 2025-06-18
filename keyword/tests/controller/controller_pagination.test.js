const KeywordController = require('@keyword/controller/controller');

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

  describe('renderListPage()', () => {
    it('should render correct slice for page 2', () => {
      const listView = mockListView({ currentPage: 2 });
  
      controller.renderListPage(listView, controller.keywordLists.meta.display, 5, 2);
  
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
  
      controller.renderListPage(listView, controller.keywordLists.meta.display, 5, 3);
  
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
  
      controller.renderListPage(listView, controller.keywordLists.meta.display, 5, 4);
  
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
  
  describe('changeListPage()', () => {
    beforeEach(() => {
      controller.renderListPage = jest.fn();
    });

    it('should call renderListPage with correct arguments', () => {
      const listView = mockListView();
      controller.view = { getListViewByType: jest.fn(() => listView) };
      const mockButton = {
        dataset: { page: 2 }
      };

      controller.changeListPage('meta', mockButton);

      expect(controller.renderListPage).toHaveBeenCalledWith(
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

      controller.changeListPage('meta', {});

      expect(controller.renderListPage).not.toHaveBeenCalled();
    });

    it('should do nothing if page is not a number', () => {
      const listView = mockListView();
      controller.view = { getListViewByType: jest.fn(() => listView) };
      const mockButton = {
        dataset: { page: 'invalid' }
      };

      controller.changeListPage('meta', mockButton);

      expect(controller.renderListPage).not.toHaveBeenCalled();
    });
  });
});
