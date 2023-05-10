import { QuillUtils } from '../utils/QuillUtils';

describe('QuillUtils', () => {
  const text = 'Coronavirus disease (COVID-19) is an infectious disease caused by the SARS-CoV-2 virus.';

  it('converts empty operation to empty plain text', () => {
    const json: string = buildQuillJson();

    const plainText = QuillUtils.convertQuillJsonToPlainText(json);

    expect(plainText).toBeDefined();
    expect(plainText).toEqual('');
  });

  it('returns invalid json as it is', () => {
    const json: string = text;

    const plainText = QuillUtils.convertQuillJsonToPlainText(json);

    expect(plainText).toBeDefined();
    expect(plainText).toEqual(json);
  });

  it('returns plain text as it is', () => {
    const json = 'test json test json}';

    const plainText = QuillUtils.convertQuillJsonToPlainText(json);

    expect(plainText).toBeDefined();
    expect(plainText).toEqual(json);
  });

  it('converts single operation to plain text', () => {
    const json: string = buildQuillJson(buildOp(text));

    const plainText = QuillUtils.convertQuillJsonToPlainText(json);

    expect(plainText).toBeDefined();
    expect(plainText).toEqual(text);
  });

  it('converts multiple complex operations to plain text', () => {
    const json: string = buildQuillJson(buildOp(text), buildOp('\n', { indent: 1 }), buildOp(text + '\n', { header: 1 }));

    const plainText = QuillUtils.convertQuillJsonToPlainText(json);

    expect(plainText).toBeDefined();
    expect(plainText).toEqual(text + '\n' + text + '\n');
  });

  it('returns all the user urs mentioned in comment', () => {
    const json =
      '{"ops":[{"insert":{"mention":{"denotationChar":"@","id":"5b18c754-fb7f-44ac-8704-87e980a6a2e3","value":""}}},{"insert":" test reply msg "},{"insert":{"mention":{"denotationChar":"@","id":"d168c75f-9179-41bc-a11f-e790e8d93eef","value":""}}},{"insert":" reewaj"},{"insert":{"mention":{"denotationChar":"@","id":"d7e85cf3-eea1-4b1f-a8e4-9d38478237df","value":""}}},{"insert":"\\n"}]}';
    const uris = QuillUtils.getMentionUserUris(JSON.parse(json));
    expect(uris).toBeDefined();
    expect(uris.length).toEqual(3);
    expect(uris).toEqual([
      '5b18c754-fb7f-44ac-8704-87e980a6a2e3',
      'd168c75f-9179-41bc-a11f-e790e8d93eef',
      'd7e85cf3-eea1-4b1f-a8e4-9d38478237df'
    ]);
  });

  it('converts quill object while with mentioned user details', () => {
    const json =
      '{"ops":[{"insert":{"mention":{"denotationChar":"@","id":"5b18c754-fb7f-44ac-8704-87e980a6a2e3","value":""}}},{"insert":" and "},{"insert":{"mention":{"denotationChar":"@","id":"d168c75f-9179-41bc-a11f-e790e8d93eef","value":""}}},{"insert":" reewaj"},{"insert":"?"}]}';

    const userDetails = [
      {
        userUri: 'd168c75f-9179-41bc-a11f-e790e8d93eef',
        firstName: 'Reewaj',
        lastName: 'Shrestha',
        email: 'reewaj.shrestha@itonics.de'
      },
      {
        userUri: '5b18c754-fb7f-44ac-8704-87e980a6a2e3',
        firstName: 'Prashant',
        lastName: 'Barahi',
        email: 'prashant.barahi@itonics.de'
      }
    ];
    const parsedComment = QuillUtils.convertQuillDeltaWithUserDetails(JSON.parse(json), userDetails);
    expect(parsedComment).toEqual({
      message: '<strong>@Prashant Barahi</strong>  and  <strong>@Reewaj Shrestha</strong>  reewaj ?',
      userDetails: [
        {
          email: 'reewaj.shrestha@itonics.de',
          firstName: 'Reewaj',
          lastName: 'Shrestha',
          userUri: 'd168c75f-9179-41bc-a11f-e790e8d93eef'
        },
        {
          email: 'prashant.barahi@itonics.de',
          firstName: 'Prashant',
          lastName: 'Barahi',
          userUri: '5b18c754-fb7f-44ac-8704-87e980a6a2e3'
        }
      ]
    });
  });

  const buildQuillJson = (...ops: Array<any>) => {
    const delta = { ops };
    return JSON.stringify(delta);
  };

  const buildOp = (txt: string, attributes?: any) => {
    return attributes ? { attributes, insert: txt } : { insert: txt };
  };
});
