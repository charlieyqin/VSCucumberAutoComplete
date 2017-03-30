import PagesHandler from '../src/handlers/pages.handler';
import { expect } from 'chai';

let pagesSettings = {
    page: __dirname + '/data/page.objects.js',
    page2: __dirname + '/data/page2.objects.js',
};
let pagesHandler = new PagesHandler(pagesSettings);

describe('getPoMatch', () => {
    describe('diff input PO lines', () => {
        let diffStrings = [
            'var a = 1',
            'let a=1',
            'a: 1',
            'test.a = 1'
        ];
        diffStrings.forEach(l => {
            it(`should get "a" page object from "${l}" line`, () => {
                let match = pagesHandler.getPoMatch(l);
                expect(match).to.not.be.null;
                expect(match[1]).to.be.equals('a');
            });
        });
    });
    describe('non PO lines', () => {
        let nonPoLines = [
            'var a ? 1',
            'var a 1 =',
            '?a: 1'
        ];
        nonPoLines.forEach(l => {
            it(`should not get match from "${l}" string`, () => {
                let match = pagesHandler.getPoMatch(l);
                expect(match).to.be.null;
            });
        });
    });
});

describe('populate', () => {
    it('should return all the elements if no parameters provided', () => {
        let res = pagesHandler.getElements();
        expect(res['length']).to.be.equal(2);
        expect(res[0].text === 'page');
    });
    it('should return page if provided', () => {
        let res = pagesHandler.getElements('page');
        expect(res['id']).to.contains('page');
        expect(res['text']).to.be.equals('page');
        expect(res['objects'].length).to.be.equals(2);
    });
    it('should return page object if provided', () => {
        let res = pagesHandler.getElements('page', 'a');
        expect(res['id']).to.contains('pageObject');
        expect(res['text']).to.be.equals('a');
    });
});


describe('populate', () => {
    it('should populate the elements after constructor call', () => {
        let elements = pagesHandler.getElements();
        expect(elements['length']).to.be.equal(2);
        expect(elements[0].objects.length).to.be.equal(2);
        expect(elements[1].objects.length).to.be.equal(1);
    });

    it('should not concat elements after repopulating', () => {
        pagesHandler.populate(pagesSettings);
        let elements = pagesHandler.getElements();
        expect(elements['length']).to.be.equal(2);
        expect(elements[0].objects.length).to.be.equal(2);
        expect(elements[1].objects.length).to.be.equal(1);
    });

    it('should correctly populate the page from file', () => {
        let page = pagesHandler.getElements()[0];
        expect(page.id).to.contains('page');
        expect(page.text).to.be.equals('page');
        expect(page.desc).to.contains('var a = 1');
        expect(page.def['uri']).to.contains('page.objects.js');
    });

    it('should correctly populate the page Objects from file', () => {
        let pageObject1 = pagesHandler.getElements()[0].objects[0];
        let pageObject2 = pagesHandler.getElements()[0].objects[1];
        expect(pageObject1.id).to.contains('pageObject');
        expect(pageObject2.id).to.contains('pageObject');
        expect(pageObject1.id).to.not.be.equals(pageObject2.id);
        expect(pageObject1.text).to.be.equals('a');
        expect(pageObject2.text).to.be.equals('b');
        expect(pageObject1.def['uri']).to.contains('page.objects.js');
        expect(pageObject2.def['uri']).to.contains('page.objects.js');
    });
});

describe('validate', () => {
    it('should not return Diagnostic for correct lines', () => {
        expect(pagesHandler.validate('When I click "page"."a" or "page2"."variable"', 2)).to.be.null;
    });
    it('should return corrext Diagnostic for non-existent page', () => {
        let d = pagesHandler.validate('I use "pag"."a"', 2);
        expect(d.length).to.be.equal(1);
        expect(d[0]).to.be.deep.equal({
            severity: 2,
            range:
            {
                start: { line: 2, character: 7 },
                end: { line: 2, character: 15 }
            },
            message: 'Was unable to find page "pag"',
            source: 'ex'
        });
    });
    it('should return corrext Diagnostic for non-existent page object', () => {
        let d = pagesHandler.validate('I use "page"."c"', 2);
        expect(d.length).to.be.equal(1);
        expect(d[0]).to.be.deep.equal({
            severity: 2,
            range:
            {
                start: { line: 2, character: 14 },
                end: { line: 2, character: 16 }
            },
            message: 'Was unable to find page object "c" for page "page"',
            source: 'ex'
        });
    });
    it('it should return diagnostic for several same non-existent pages', () => {
        let d = pagesHandler.validate('I use "pag"."a" and "pag"."a"', 2);
        expect(d.length).to.be.equal(2);
        expect(d[0].range.start.character).to.be.equal(7);
        expect(d[0].range.end.character).to.be.equal(15);
        expect(d[1].range.start.character).to.be.equal(21);
        expect(d[1].range.end.character).to.be.equal(29);
    });
});

describe('getFeaturePosition', () => {
    it('should correctly determine feature line position', () => {
        let line = '  When I use use "page1"."object1" and "page2"."object2"';
        expect(pagesHandler.getFeaturePosition(line, 5)).to.be.null;
        expect(pagesHandler.getFeaturePosition(line, 19)).to.be.deep.equals({
            page: 'page1'
        });
        expect(pagesHandler.getFeaturePosition(line, 27)).to.be.deep.equals({
            page: 'page1',
            object: 'object1'
        });
        expect(pagesHandler.getFeaturePosition(line, 36)).to.be.null;
        expect(pagesHandler.getFeaturePosition(line, 41)).to.be.deep.equals({
            page: 'page2'
        });
        expect(pagesHandler.getFeaturePosition(line, 49)).to.be.deep.equals({
            page: 'page2',
            object: 'object2'
        });
    });
});