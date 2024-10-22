import * as _ from 'lodash';
import { IInputValidator } from './types';

export const inputValidator = async (
  inputData: any
): Promise<IInputValidator> => {
  const objectEntries: any = Object.entries(inputData);
  for (let i in objectEntries) {
    if (_.isUndefined(objectEntries[i][1])) {
      return {
        success: false,
        message: `Param ${objectEntries[i][0]} is missing`,
      };
    }
  }
  return {
    success: true,
  };
};
