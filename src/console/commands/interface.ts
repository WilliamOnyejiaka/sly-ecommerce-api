import { Command } from 'commander';

export interface CommandInterface {
    register(program: Command): void;
}
