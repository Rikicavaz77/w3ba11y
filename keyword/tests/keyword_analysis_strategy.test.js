/**
 * @jest-environment jsdom
 */
const KeywordAnalysisStrategy = require('../services/strategy/keyword_analysis_strategy');

describe('KeywordAnalysisStrategy', () => {
  test('should throw error if instantiated directly', () => {
    expect(() => new KeywordAnalysisStrategy()).toThrow(
      'KeywordAnalysisStrategy cannot be instantiated directly'
    );
  });

  test('should throw error if setContext is not implemented', () => {
    class DummyStrategy extends KeywordAnalysisStrategy {}
    const strategy = Object.create(DummyStrategy.prototype);
    expect(() => strategy.setContext()).toThrow(
      'setContext() must be implemented'
    );
  });

  test('should throw error if analyze is not implemented', () => {
    class DummyStrategy extends KeywordAnalysisStrategy {}
    const strategy = Object.create(DummyStrategy.prototype);
    expect(() => strategy.analyze()).toThrow(
      'analyze() must be implemented'
    );
  });
});
