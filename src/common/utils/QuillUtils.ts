import { User } from '@itonics/core/dist/types/tenant/model';
import { KeyValueMap } from '../interfaces/KeyValueMap';

export interface QuillObject {
  ops: Array<{ insert: string | Mention }>;
}

export interface Mention {
  mention: {
    denotationChar: string;
    id: string;
    value: string;
  };
}

export class QuillUtils {
  /**
   * Converts Quill editor delta JSON to plain text
   * @param json
   */
  static convertQuillJsonToPlainText(json: string): string {
    try {
      const quillDeltaObj: { ops: Array<{ insert: string }> } = JSON.parse(json);
      const plaintext = QuillUtils.convertQuillDeltaToPlainText(quillDeltaObj);
      if (plaintext !== null) {
        return plaintext;
      }
    } catch (e) {
      console.warn('Couldn\'t parse Quill delta', e);
    }
    return json;
  }

  static getMentionUserUris(quillObj: QuillObject): Array<string> {
    return quillObj.ops
      .filter((op) => QuillUtils.isCommentMention(op.insert))
      .map((op) => {
        return (<Mention> op.insert).mention.id;
      });
  }

  static getMentionElementUris(quillObj: QuillObject): Array<string> {
    return quillObj.ops
      .filter((op) => QuillUtils.isElementMention(op.insert))
      .map((op) => {
        return (<Mention> op.insert).mention.id;
      });
  }

  static convertQuillDeltaWithUserDetails(
    quillObj: QuillObject,
    userDetails: Array<Partial<User>> = [],
    elementDetails: Array<KeyValueMap> = []
  ): { message: string; userDetails: Array<Partial<User>> } {
    const comments: Array<string> = [];
    quillObj.ops.forEach((op) => {
      if (typeof op.insert === 'string') {
        comments.push(op.insert);
      }
      if (typeof op.insert === 'object' && 'mention' in op.insert) {
        const uri = op.insert.mention.id;
        const users = userDetails.find((element) => element.userUri === uri);
        const elements = elementDetails.find((element) => element.uri === uri);
        if (users) {
          comments.push(`<strong>@${users.firstName} ${users.lastName}</strong>`);
        }

        if (elements) {
          comments.push(`${elements.actionUrl}`);
        }
      }
    });
    return { message: comments.join(' '), userDetails };
  }

  private static convertQuillDeltaToPlainText(quillDeltaObj: { ops: Array<{ insert: string }> }): string {
    if (quillDeltaObj !== null && 'ops' in quillDeltaObj) {
      return quillDeltaObj.ops
        .filter((op) => typeof op.insert === 'string')
        .map((op) => op.insert)
        .join('');
    }
    return null;
  }

  private static isCommentMention(commentMention: string | Mention): commentMention is Mention {
    return this.isMentionComment(commentMention) && (<Mention> commentMention).mention.denotationChar === '@';
  }

  private static isElementMention(elementMention: string | Mention): elementMention is Mention {
    return QuillUtils.isMentionComment(elementMention) && (<Mention> elementMention).mention.denotationChar === '#';
  }

  private static isMentionComment(mention: string | Mention): mention is Mention {
    return (<Mention> mention).mention !== undefined;
  }
}
