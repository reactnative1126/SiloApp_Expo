import {BorshCoder, Instruction} from '@project-serum/anchor';
import {PartiallyDecodedInstruction, PublicKey} from '@solana/web3.js';

export const getAccountIndex = (coder: BorshCoder, instructionName: string, accountName: string): [number, any] => {
  const [instructionIndex, instruction] = getInstructionData(coder, instructionName);
  for (let i = 0; i < instruction.accounts.length; i++) {
    const account = instruction.accounts[i];
    if (account.name === accountName) {
      return [i, account];
    }
  }
  return null;
};

export const getIxAccountByName = (
  coder: BorshCoder,
  ix: PartiallyDecodedInstruction,
  decodedIx: Instruction,
  accountName: string,
): PublicKey => {
  const [instructionIndex, instructionData] = getInstructionData(coder, decodedIx.name);
  for (let i = 0; i < instructionData.accounts.length; i++) {
    const account = instructionData.accounts[i];
    if (account.name === accountName) {
      return ix.accounts[i];
    }
  }
};

export const getInstructionData = (coder: BorshCoder, instructionName: string): [number, any] => {
  // @ts-ignore
  const instructions = coder.instruction.idl.instructions;
  for (let i = 0; i < instructions.length; i++) {
    const instruction = instructions[i];
    if (instruction.name === instructionName) {
      return [i, instruction];
    }
  }
  return null;
};
