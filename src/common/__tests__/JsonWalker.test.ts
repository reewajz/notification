import { JsonWalker } from '../utils/JsonWalker';

describe('JsonWalker test', function() {
  const input = {
    'itonics@elements-node/contracts/elements/Element': {
      uri: 'iOKnULf84g5a3QA',
      spaceUri: '6y2Gd90o5beUqZML',
      label: 'notif',
      elementTypeUri: 'wa1Wllbd9BJVx3V',
      summary: 'Summary prasant',
      status: 'published',
      createdOn: 1663652763829,
      updatedOn: 1663653491527,
      createdByUri: '5b18c754-fb7f-44ac-8704-87e980a6a2e3',
      updatedByUri: '5b18c754-fb7f-44ac-8704-87e980a6a2e3',
      version: 4,
      fieldValues: [
        {
          value: [
            '88bcddf3-8c34-41ff-aca0-30bf45cea2d8'
          ],
          fieldUri: '149lviGg3XPCxKw'
        },
        {
          value: [
            'd7e85cf3-eea1-4b1f-a8e4-9d38478237df',
            'd168c75f-9179-41bc-a11f-e790e8d93eef',
            'ab54be24-d255-4725-9391-f5794f453c24'
          ],
          fieldUri: 'bnRDmWhL47IqpeA'
        },
        {
          value: [
            'be86f124-ccb7-47cd-a22e-d9bfb1cbce3a'
          ],
          fieldUri: 'QLPKeTQKjvgjsQx'
        }
      ],
      creatorType: 'USER',
      originType: 'SPACE',
      originUri: '6y2Gd90o5beUqZML',
      updaterType: 'USER',
      origin: 'Marius Space'
    }
  };

  it('should walk until the condition is satisfied', () => {
    const walker = new JsonWalker(input);
    const result = walker.walkTill(['itonics@elements-node/contracts/elements/Element', 'fieldValues', '1', 'value', '2'],
      (prev, key, cur) => {
        return cur.fieldUri != null;
      });
    expect(result).toStrictEqual({
      value: [
        'd7e85cf3-eea1-4b1f-a8e4-9d38478237df',
        'd168c75f-9179-41bc-a11f-e790e8d93eef',
        'ab54be24-d255-4725-9391-f5794f453c24'
      ],
      fieldUri: 'bnRDmWhL47IqpeA'
    });
  });

  it('should walk until the end of keys', () => {
    const walker = new JsonWalker(input);
    const keys = ['itonics@elements-node/contracts/elements/Element', 'fieldValues', '1', 'value', '2'];
    const result = walker.walk(keys);
    expect(result).toEqual('ab54be24-d255-4725-9391-f5794f453c24');
    expect(walker.canWalk(keys)).toEqual(true);
  });


  it('should return undefined if can not walk further', () => {
    const walker = new JsonWalker(input);
    const keys = ['itonics@elements-node/contracts/elements/Element', 'fieldValues', 'doesnt exists', 'value', '2'];
    const result = walker.walk(keys);
    expect(result).toBeUndefined();
    expect(walker.canWalk(keys)).toEqual(false);
  });

  it('should have fieldValues in diff', function() {
    const diffInput = {
      'itonics@elements-node/contracts/elements/Element': {
        updatedOn: 1663737290738,
        version: 5,
        fieldValues: {
          1: {
            value: {
              3: 'edb624d4-ac78-4516-9787-abe3f582899f'
            }
          }
        }
      }
    };
    const walker = new JsonWalker(diffInput);
    expect(walker.canWalk(['itonics@elements-node/contracts/elements/Element', 'fieldValues'])).toEqual(true);
  });

});
