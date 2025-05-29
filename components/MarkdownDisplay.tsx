import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownDisplayProps {
    markdownText: string;
}

const MarkdownDisplay: React.FC<MarkdownDisplayProps> = ({ markdownText }) => {
    return (
        <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdownText}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownDisplay;