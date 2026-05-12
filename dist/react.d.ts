import { default as React } from 'react';
import { ParticularDriftUserOptions } from './index';

export type ParticularDriftCanvasProps = Omit<React.CanvasHTMLAttributes<HTMLCanvasElement>, 'children'> & {
    imageUrl: string;
    onRendererError?: (error: unknown) => void;
    options?: ParticularDriftUserOptions;
};
export declare const ParticularDriftCanvas: ({ imageUrl, onRendererError, options, style, ...props }: ParticularDriftCanvasProps) => React.JSX.Element;
