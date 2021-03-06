import { format, clearText } from '../src/format';
import { getFileContent } from '../src/util';
import { expect } from 'chai';

const settings: any = {
    cucumberautocomplete: {
        skipDocStringsFormat: true,
        formatConfOverride: {
            'But': 3,
            'And': 'asdasd',
            'SomeTestKey': 12,
            'Scenario Outline': 0,
        }
    }
};

describe('format', () => {
    let after = getFileContent(__dirname + '/data/features/after.format.feature').split(/\r?\n/);
    let beforeU = getFileContent(__dirname + '/data/features/before.format.feature');
    let beforeUArr = beforeU.split(/\r?\n/);
    let before = clearText(format('\t', beforeU, settings)).split(/\r?\n/);
    it(`should not change lines num`, () => expect(before.length).to.be.equal(after.length));
    beforeUArr.forEach((l, i) => it(`should correctly format "${l}" line`, () =>
        expect(before[i]).to.be.equal(after[i])));
});