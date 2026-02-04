import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";

// This refined component uses Tailwind's prose for 90% of the work
// and targeted overrides for the "high-end" UI elements.
export default function MessageContent({ content }: { content: string }) {
  return (
    <div
      className="prose prose-slate prose-sm max-w-none 
      prose-p:leading-relaxed prose-p:text-slate-700
      prose-headings:text-slate-900 prose-headings:font-bold
      prose-code:text-rose-600 prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded
      prose-code:before:content-none prose-code:after:content-none
      prose-strong:text-slate-900 prose-strong:font-bold"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Real syntax highlighting for blocks like GraphQL (shown in image 2)
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <div className="my-4 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                <div className="bg-slate-100 px-4 py-1.5 text-[10px] font-sans uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  {match[1]}
                </div>
                <SyntaxHighlighter
                  {...props}
                  style={oneLight}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: "1rem",
                    fontSize: "0.75rem",
                  }}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },

          // Cleaner tables that match modern dashboards
          table: ({ children }) => (
            <div className="my-4 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 m-0">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-50">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-xs text-slate-600 border-t border-slate-100">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
