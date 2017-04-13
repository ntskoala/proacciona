import { Tfc2Page } from './app.po';

describe('tfc2 App', () => {
  let page: Tfc2Page;

  beforeEach(() => {
    page = new Tfc2Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
