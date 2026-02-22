export declare function runAction(opts: {
    op: string;
    argsInput?: string;
    hideWarning?: boolean;
    file?: string;
    fail?: boolean;
}): Promise<{
    exitCode: number;
    output?: never;
    stdout?: never;
    stderr?: never;
} | {
    exitCode: number;
    output: string;
    stdout: string;
    stderr: string;
}>;
//# sourceMappingURL=action.d.ts.map