import { ProaccionaPage } from './app.po';

describe('proacciona App', function() {
  let page: ProaccionaPage;

  beforeEach(() => {
    page = new ProaccionaPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
