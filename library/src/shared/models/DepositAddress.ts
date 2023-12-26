export namespace DepositAddress {
    export type StateEnum = 'storing' | 'created';
    export const StateEnum: {
        Storing: StateEnum;
        Created: StateEnum;
    } = {
        Storing: 'storing',
        Created: 'created'
    };
    export type FormatEnum = 'standard' | 'legacy';
    export const FormatEnum: {
        Standard: FormatEnum;
        Legacy: FormatEnum;
    } = {
        Standard: 'standard',
        Legacy: 'legacy'
    };
}