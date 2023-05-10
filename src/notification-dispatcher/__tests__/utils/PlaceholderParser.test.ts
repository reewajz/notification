import { MissingVariablePlaceholderError } from '../../../common/utils/MissingVariablePlaceholderError';
import { CASE_INSENSITIVE_MAPPER, PlaceholderParser } from '../../../common/utils/PlaceholderParser';

describe('PlaceholderParser', function() {
  it('should replace placeholder with given vars', function() {
    const parser = new PlaceholderParser([
      {
        user: {
          firstname: 'Prashant'
        }
      },
      {
        element: {
          type: 'Ideation',
          title: 'Intro'
        }

      }]
    );
    const result = parser.parse('{{ user.firstname }} published {{    element.type }} {{element.title}}.'
    );
    expect(result).toEqual('Prashant published Ideation Intro.');
  });

  it('should replace placeholder when given nested vars', function() {
    const parser = new PlaceholderParser([
        {

          user: {
            name: {
              first: 'Prashant',
              last: 'Barahi'
            }
          },
          element: {
            type: 'Ideation',
            title: 'Intro'
          }
        }
      ]
    );
    const result = parser.parse('{{ user.name.first }} {{ user.name.last }} published {{element.type}} {{element.title}}.');
    expect(result).toEqual('Prashant Barahi published Ideation Intro.');
  });

  it('should replace placeholder when given primitive vars', function() {
    const parser = new PlaceholderParser([
      {
        user: 'Prashant'
      },
      {
        element: 'Ideation'
      },

      {
        time: {
          ago: 4
        }
      }
    ]);
    const result = parser.parse('{{ user }} published "{{ element   }}" {{time.ago}}h ago.');
    expect(result).toEqual(`Prashant published "Ideation" 4h ago.`);
  });

  it('should throw exception if required vars not provided', function() {
      const parser = new PlaceholderParser({
        user: {
          firstname: 'Prashant'
        }
      });
      const input = '{{ user.firstname }} published {{element.type}} {{element.title}}.';

      expect(() => parser.parse(input)).toThrowError(MissingVariablePlaceholderError);
      try {
        parser.parse(input);
      } catch (e) {
        expect(e).toBeInstanceOf(MissingVariablePlaceholderError);
        expect((e as MissingVariablePlaceholderError).placeholders).toStrictEqual([
          'element.type',
          'element.title'
        ]);
      }
    }
  );


  it('should ignore single curly braces', function() {
    const parser = new PlaceholderParser({
      user: 'Prashant'
    });
    const result = parser.parse('{ user   } {{ user }}');
    expect(result).toEqual(`{ user   } Prashant`);
  });

  it('should replace placeholder even when lowercase/uppercase doesn\'t match with given vars', function() {
    const parser = new PlaceholderParser([
        {
          USER: {
            firstName: 'Prashant'
          }
        },
        {
          element: {
            TYPE: 'Ideation',
            TITLe: 'Intro'
          }

        }
      ],
      CASE_INSENSITIVE_MAPPER
    );
    const result = parser.parse('{{ user.firstname }} published {{    element.type }} {{element.title}}.'
    );
    expect(result).toEqual('Prashant published Ideation Intro.');
  });


  it('should replace placeholder or get default value', function() {
    const parser = new PlaceholderParser([
        {
          USER: {
            firstName: 'Prashant'
          }
        }
      ],
      CASE_INSENSITIVE_MAPPER
    );
    const result1 = parser.parse('{{ user.firstname }} published {{  element.type ?: "Default value" }} {{element.title ?: "TITLE"}}.');
    expect(result1).toEqual('Prashant published Default value TITLE.');



    const result2 = parser.parse('}} {{  element.type ?: "Default value" }} {{element.title ?: "  ..TITLE"}}');
    expect(result2).toEqual('}} Default value   ..TITLE');
  });

  it('should support default value containing quotes', function() {
    const parser = new PlaceholderParser([
        {
          USER: {
            firstName: 'Prashant'
          }
        }
      ],
      CASE_INSENSITIVE_MAPPER
    );

    const result2 = parser.parse('Default value contains {{  element.type?:""default value"" }} quotes');
    expect(result2).toEqual('Default value contains "default value" quotes');
  });

});
