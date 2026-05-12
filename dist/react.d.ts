import { default as React } from 'react';
import { ParticularDriftUserOptions } from './index';

export type ParticularDriftCanvasProps = Omit<React.CanvasHTMLAttributes<HTMLCanvasElement>, 'children'> & {
    imageUrl: string;
    options?: ParticularDriftUserOptions;
};
export declare const ParticularDriftCanvas: ({ imageUrl, options, style, ...props }: ParticularDriftCanvasProps) => React.JSX.Element;
