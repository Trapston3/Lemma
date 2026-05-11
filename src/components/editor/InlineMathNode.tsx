import { NodeViewWrapper } from '@tiptap/react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function InlineMathNode({ node }: any) {
  const renderedMath = katex.renderToString(node.attrs.latex, {
    throwOnError: false,
    displayMode: false,
  });

  return (
    <NodeViewWrapper className="inline-block mx-1 cursor-pointer" as="span">
      <span dangerouslySetInnerHTML={{ __html: renderedMath }} />
    </NodeViewWrapper>
  );
}
