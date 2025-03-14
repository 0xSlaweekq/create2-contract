import { ethers } from 'hardhat' // For utilities

/**
 * Converts a string to the bytes32 format.
 * @param argString - the string to convert.
 * @returns the string in bytes32 format.
 */
export const stringToBytes32 = (argString: string): string => {
  return ethers.encodeBytes32String(argString)
}
