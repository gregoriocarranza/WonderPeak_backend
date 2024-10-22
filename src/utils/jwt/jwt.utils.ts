export const getEmailByAuthData = (authData: any): string => {
  const tokenBaseHost: string | undefined = process.env.JWT_BASE_HOST;
  return authData[`${tokenBaseHost}/email`];
};
