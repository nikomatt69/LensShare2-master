import { Matcher } from 'interweave';
import Link from 'next/link';
import React from 'react';
import getLensHandle from '@/utils/functions/getLensHandle';

const Mention = ({ ...props }: any) => {
  return (
    <Link href={`/u/${getLensHandle(props.display?.slice(1))}`}>
      {props.display}
    </Link>
  );
};

export class MentionMatcher extends Matcher {
  replaceWith(match: string, props: any) {
    return React.createElement(Mention, props, match);
  }

  asTag(): string {
    return 'a';
  }

  match(value: string) {
    return this.doMatch(value, /@[a-zA-Z0-9_.]/, (matches) => {
      return {
        display: matches[0]
      };
    });
  }
}
