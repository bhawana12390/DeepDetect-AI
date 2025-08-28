
'use client';

import { useState } from 'react';
import { useToast } from './use-toast';
import { set } from 'date-fns';

export function useCopyToClipboard() {
    const [copiedText, setCopiedText] = useState<string | null>(null);
    const { toast } = useToast();

    const copy = async (text: string) => {
        if (!navigator?.clipboard) {
            toast({
                title: 'Clipboard not supported',
                description: 'Your browser does not support Clipboard API operations.',
                variant: 'destructive',
            });
            return false;
        }

        try {
            await navigator.clipboard.writeText(text);
            setCopiedText(text);
            toast({
                title: 'Copied to clipboard',
                description: `Text justification has been copied successfully.`,
            });
            return true;
        } catch (error) {
            console.warn('Failed to copy text:', error);
            toast({
                title: 'Copy failed',
                description: 'An error occurred while trying to copy the text.',
                variant: 'destructive',
            });
            setCopiedText(null);
            return false;
        }
    };

    return { copiedText, copy };
}