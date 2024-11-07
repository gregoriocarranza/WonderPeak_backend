export const parseError = async (
  message: string | undefined,
  code: Number
): Promise<any> => {
  const error: any = new Error(message);
  error.statusCode = code || null;
  return error;
};
