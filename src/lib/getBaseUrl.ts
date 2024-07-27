const getBaseUrl = () =>
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : `https://chat-to-pdf-roan.vercel.app/`;
export default getBaseUrl;
